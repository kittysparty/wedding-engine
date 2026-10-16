/**
 * Your Big Day — RSVP endpoint (Google Apps Script)
 *
 * One web app serves EVERY wedding in the platform sheet (keyed by event code).
 * It is container-bound to the platform Google Sheet, so paste it via the sheet's
 * Extensions > Apps Script and deploy as a Web App (see the deploy steps you were given).
 *
 * It responds to JSONP GET requests from the wedding pages:
 *   ?action=submit&e=<event_code>&d=<url-encoded JSON>&callback=<fn>   -> upsert + audit log
 *   ?action=get&e=<event_code>&h=<url-encoded household>&callback=<fn> -> that household's current RSVP
 *
 * It writes to two tabs (created automatically if missing): "rsvp" (live, upserted)
 * and "rsvp_log" (append-only audit — nothing is ever overwritten there).
 */

var RSVP_HEADERS = ["event_code","household","guest_name","attending","meal","dietary","song","updated_at","source"];
var LOG_HEADERS  = ["timestamp","event_code","household","guest_name","attending","meal","dietary","song","source"];

function doGet(e) {
  var p = (e && e.parameter) || {};
  var cb = p.callback || "callback";
  var out;
  try {
    if (p.action === "submit")      out = handleSubmit(p);
    else if (p.action === "get")    out = handleGet(p);
    else                            out = { ok: false, error: "unknown action" };
  } catch (err) {
    out = { ok: false, error: String(err) };
  }
  return ContentService
    .createTextOutput(cb + "(" + JSON.stringify(out) + ")")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function norm_(s) {
  return String(s == null ? "" : s).toLowerCase().replace(/\s+/g, " ").trim();
}

function sheetByName_(ss, name, headers) {
  var sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(headers); }
  return sh;
}

function handleSubmit(p) {
  var code = String(p.e || "").trim();
  var data = JSON.parse(p.d || "{}");
  var household = String(data.household || "").trim();
  var guests = data.guests || [];
  var message = String(data.message || "");
  if (!code || !household || !guests.length) return { ok: false, error: "missing data" };

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var ss = SpreadsheetApp.getActive();
    var rsvp = sheetByName_(ss, "rsvp", RSVP_HEADERS);
    var log  = sheetByName_(ss, "rsvp_log", LOG_HEADERS);

    var values = rsvp.getDataRange().getValues();
    var header = values[0] || RSVP_HEADERS;
    var idx = {};
    header.forEach(function (h, i) { idx[norm_(h)] = i; });
    var cCode = idx["event_code"], cName = idx["guest_name"];
    var now = new Date();

    guests.forEach(function (g) {
      var name = String(g.name || "").trim();
      if (!name) return;
      var row = [code, household, name, String(g.attending || ""), String(g.meal || ""),
                 String(g.dietary || ""), String(g.song || ""), now, "form"];
      var found = -1;
      for (var r = 1; r < values.length; r++) {
        if (norm_(values[r][cCode]) === norm_(code) && norm_(values[r][cName]) === norm_(name)) { found = r; break; }
      }
      if (found > -1) { rsvp.getRange(found + 1, 1, 1, RSVP_HEADERS.length).setValues([row]); values[found] = row; }
      else { rsvp.appendRow(row); values.push(row); }
      log.appendRow([now, code, household, name, String(g.attending || ""), String(g.meal || ""),
                     String(g.dietary || ""), String(g.song || ""), "form"]);
    });

    if (message) log.appendRow([now, code, household, "(message)", "", "", message, "", "form"]);
    return { ok: true, saved: guests.length };
  } finally {
    lock.releaseLock();
  }
}

function handleGet(p) {
  var code = String(p.e || "").trim();
  var household = String(p.h || "").trim();
  if (!code || !household) return { ok: false, error: "missing" };
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName("rsvp");
  if (!sh) return { ok: true, guests: [] };
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return { ok: true, guests: [] };
  var header = values[0];
  var idx = {};
  header.forEach(function (h, i) { idx[norm_(h)] = i; });
  var out = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    if (norm_(row[idx["event_code"]]) === norm_(code) && norm_(row[idx["household"]]) === norm_(household)) {
      out.push({
        name: row[idx["guest_name"]],
        attending: row[idx["attending"]],
        meal: row[idx["meal"]],
        dietary: row[idx["dietary"]]
      });
    }
  }
  return { ok: true, guests: out };
}
