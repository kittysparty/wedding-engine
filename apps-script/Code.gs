/**
 * Your Big Day — RSVP + dashboard endpoint (Google Apps Script)
 *
 * One web app serves EVERY wedding in the platform sheet (keyed by event code).
 * Container-bound to the platform Google Sheet: paste via Extensions > Apps Script
 * and deploy as a Web App (Execute as: Me, Who has access: Anyone).
 *
 * JSONP GET actions:
 *   ?action=submit&e=<code>&d=<json>&callback=<fn>            guest RSVP upsert + audit log
 *   ?action=get&e=<code>&h=<household>&callback=<fn>          one household's current RSVP
 *   ?action=dashboard&e=<code>&token=<token>&callback=<fn>    admin/client console data (token-gated)
 *   ?action=admin_save&e=<code>&token=<admin>&d=<json>&callback=<fn>   operator manual upsert
 *
 * Tabs (auto-created): "rsvp" (live, upserted), "rsvp_log" (append-only audit).
 * Tokens live in the "config" tab columns client_token / admin_token.
 */

var RSVP_HEADERS = ["event_code","household","guest_name","attending","meal","dietary","song","updated_at","source"];
var LOG_HEADERS  = ["timestamp","event_code","household","guest_name","attending","meal","dietary","song","source"];

function doGet(e) {
  var p = (e && e.parameter) || {};
  var cb = p.callback || "callback";
  var out;
  try {
    if (p.action === "submit")          out = handleSubmit(p, "form");
    else if (p.action === "get")        out = handleGet(p);
    else if (p.action === "dashboard")  out = handleDashboard(p);
    else if (p.action === "admin_save") out = handleAdminSave(p);
    else                                out = { ok: false, error: "unknown action" };
  } catch (err) {
    out = { ok: false, error: String(err) };
  }
  return ContentService.createTextOutput(cb + "(" + JSON.stringify(out) + ")")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function norm_(s) { return String(s == null ? "" : s).toLowerCase().replace(/\s+/g, " ").trim(); }
function sheetByName_(ss, name, headers) { var sh = ss.getSheetByName(name); if (!sh) { sh = ss.insertSheet(name); sh.appendRow(headers); } return sh; }
function headerIdx_(header) { var idx = {}; header.forEach(function (h, i) { idx[norm_(h)] = i; }); return idx; }

function readConfigRow_(ss, code) {
  var sh = ss.getSheetByName("config"); if (!sh) return null;
  var v = sh.getDataRange().getValues(); if (v.length < 2) return null;
  var idx = headerIdx_(v[0]);
  for (var r = 1; r < v.length; r++) {
    if (norm_(v[r][idx["event_code"]]) === norm_(code)) { var o = {}; for (var k in idx) o[k] = v[r][idx[k]]; return o; }
  }
  return null;
}
function readInvite_(ss, code) {
  var sh = ss.getSheetByName("guests"); if (!sh) return [];
  var v = sh.getDataRange().getValues(); if (v.length < 2) return [];
  var idx = headerIdx_(v[0]); var out = [];
  for (var r = 1; r < v.length; r++) {
    var row = v[r]; if (norm_(row[idx["event_code"]]) !== norm_(code)) continue;
    var name = String(row[idx["guest_name"]] || "").trim(); if (!name) continue;
    out.push({ household: String(row[idx["household"]] || "").trim() || name, name: name,
               table_number: row[idx["table_number"]] || "", table_name: String(row[idx["table_name"]] || "").trim() });
  }
  return out;
}
function readRsvp_(ss, code) {
  var sh = ss.getSheetByName("rsvp"); if (!sh) return [];
  var v = sh.getDataRange().getValues(); if (v.length < 2) return [];
  var idx = headerIdx_(v[0]); var out = [];
  for (var r = 1; r < v.length; r++) {
    var row = v[r]; if (norm_(row[idx["event_code"]]) !== norm_(code)) continue;
    out.push({ household: String(row[idx["household"]] || "").trim(), name: String(row[idx["guest_name"]] || "").trim(),
               attending: String(row[idx["attending"]] || ""), meal: String(row[idx["meal"]] || ""),
               dietary: String(row[idx["dietary"]] || ""), updated_at: String(row[idx["updated_at"]] || "") });
  }
  return out;
}

function upsert_(code, household, guests, message, source) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var ss = SpreadsheetApp.getActive();
    var rsvp = sheetByName_(ss, "rsvp", RSVP_HEADERS);
    var log  = sheetByName_(ss, "rsvp_log", LOG_HEADERS);
    var values = rsvp.getDataRange().getValues();
    var idx = headerIdx_(values[0] || RSVP_HEADERS);
    var cCode = idx["event_code"], cName = idx["guest_name"];
    var now = new Date(), n = 0;
    guests.forEach(function (g) {
      var name = String(g.name || "").trim(); if (!name) return;
      var hh = String(g.household || household || "").trim();
      var row = [code, hh, name, String(g.attending || ""), String(g.meal || ""), String(g.dietary || ""), String(g.song || ""), now, source];
      var found = -1;
      for (var r = 1; r < values.length; r++) { if (norm_(values[r][cCode]) === norm_(code) && norm_(values[r][cName]) === norm_(name)) { found = r; break; } }
      if (found > -1) { rsvp.getRange(found + 1, 1, 1, RSVP_HEADERS.length).setValues([row]); values[found] = row; }
      else { rsvp.appendRow(row); values.push(row); }
      log.appendRow([now, code, hh, name, String(g.attending || ""), String(g.meal || ""), String(g.dietary || ""), String(g.song || ""), source]);
      n++;
    });
    if (message) log.appendRow([now, code, household, "(message)", "", "", message, "", source]);
    return n;
  } finally { lock.releaseLock(); }
}

function handleSubmit(p, source) {
  var code = String(p.e || "").trim();
  var data = JSON.parse(p.d || "{}");
  var household = String(data.household || "").trim();
  var guests = data.guests || [];
  if (!code || !household || !guests.length) return { ok: false, error: "missing data" };
  return { ok: true, saved: upsert_(code, household, guests, String(data.message || ""), source || "form") };
}

function handleAdminSave(p) {
  var code = String(p.e || "").trim(), token = String(p.token || "").trim();
  var ss = SpreadsheetApp.getActive(), cfg = readConfigRow_(ss, code);
  if (!cfg || !token || token !== String(cfg["admin_token"] || "")) return { ok: false, error: "unauthorized" };
  var data = JSON.parse(p.d || "{}"), guests = data.guests || [];
  if (!guests.length) return { ok: false, error: "no guests" };
  return { ok: true, saved: upsert_(code, String(data.household || ""), guests, "", "manual") };
}

function handleGet(p) {
  var code = String(p.e || "").trim(), household = String(p.h || "").trim();
  if (!code || !household) return { ok: false, error: "missing" };
  var ss = SpreadsheetApp.getActive();
  var out = readRsvp_(ss, code).filter(function (r) { return norm_(r.household) === norm_(household); })
    .map(function (r) { return { name: r.name, attending: r.attending, meal: r.meal, dietary: r.dietary }; });
  return { ok: true, guests: out };
}

function handleDashboard(p) {
  var code = String(p.e || "").trim(), token = String(p.token || "").trim();
  if (!code || !token) return { ok: false, error: "missing" };
  var ss = SpreadsheetApp.getActive(), cfg = readConfigRow_(ss, code);
  if (!cfg) return { ok: false, error: "event not found" };
  var role = null;
  if (token === String(cfg["admin_token"] || "")) role = "admin";
  else if (token === String(cfg["client_token"] || "")) role = "client";
  if (!role) return { ok: false, error: "unauthorized" };
  return {
    ok: true, role: role,
    event: {
      couple_names: cfg["couple_names"] || "", date_meta: cfg["date_meta"] || "",
      wedding_iso: String(cfg["wedding_iso"] || ""), rsvp_deadline: String(cfg["rsvp_deadline"] || ""),
      menu_json: cfg["menu_json"] || ""
    },
    invite: readInvite_(ss, code),
    rsvp: readRsvp_(ss, code)
  };
}
