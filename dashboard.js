/*! Your Big Day \u2014 RSVP dashboard (admin console)
 *  A page is: <div id="ybd-dash"></div><script src="<this file>"></script>
 *  The wedding + access token come from the URL hash: #e=<event_code>&t=<token>
 *  Admin token -> full console (edit + export). Client token -> read-only couple view.
 */
(function(){
"use strict";
var app=document.getElementById("ybd-dash");
if(!app||app.dataset.init)return;app.dataset.init="1";

/* platform data store */
var SHEET_ID="17FmEqRJx_46I7JWz6R0ZK1e5mwwg--I-HUKuwGy8sPQ";
var CONFIG_GID="0";

var CSS=`
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,300;1,6..72,400;1,6..72,500&family=Inter:wght@400;500;600&display=swap');
html:has(#ybd-dash),body:has(#ybd-dash){background:#F1EFE9}
#ybd-dash{max-width:1000px;margin:0 auto;padding:2rem 1.25rem 4rem;font-family:'Inter',system-ui,sans-serif;color:#1B1A16;line-height:1.5;-webkit-font-smoothing:antialiased}
#ybd-dash *{box-sizing:border-box}
#ybd-dash .dwm{font-size:.72rem;letter-spacing:.28em;text-transform:uppercase;color:#8B857A;font-weight:500}
#ybd-dash .dh{display:flex;flex-wrap:wrap;align-items:baseline;gap:.75rem;margin:.5rem 0 .2rem}
#ybd-dash .dh h1{font-family:'Newsreader',serif;font-weight:300;font-style:italic;font-size:2.3rem;line-height:1.05;margin:0}
#ybd-dash .chip{font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;border:1px solid #DBD6CB;border-radius:999px;padding:.2rem .6rem;color:#5E7488}
#ybd-dash .dmeta{color:#8B857A;font-size:.95rem;margin-bottom:1.6rem}
#ybd-dash .tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.7rem;margin-bottom:2rem}
#ybd-dash .tile{background:#fff;border:1px solid #DBD6CB;border-radius:.3rem;padding:1rem 1.1rem}
#ybd-dash .tile .n{font-family:'Newsreader',serif;font-style:italic;font-size:2.2rem;line-height:1}
#ybd-dash .tile .l{font-size:.74rem;letter-spacing:.1em;text-transform:uppercase;color:#8B857A;margin-top:.35rem}
#ybd-dash .tile.ok .n{color:#4a6b4a}#ybd-dash .tile.no .n{color:#9a6a5a}#ybd-dash .tile.wait .n{color:#8B857A}
#ybd-dash h2{font-family:'Newsreader',serif;font-weight:300;font-style:italic;font-size:1.5rem;margin:2.2rem 0 .9rem;border-top:1px solid #DBD6CB;padding-top:1.4rem}
#ybd-dash .mt{margin-bottom:.8rem}
#ybd-dash .mt .mc{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:#5E7488;margin:.9rem 0 .5rem}
#ybd-dash .bar{display:flex;align-items:center;gap:.7rem;margin:.35rem 0}
#ybd-dash .bar .bl{flex:0 0 11rem;font-size:.95rem}
#ybd-dash .bar .bt{flex:1 1 auto;height:.7rem;background:#E7E3DA;border-radius:999px;overflow:hidden}
#ybd-dash .bar .bf{height:100%;background:#5E7488}
#ybd-dash .bar .bn{flex:0 0 2.2rem;text-align:right;font-variant-numeric:tabular-nums;color:#5c564d}
#ybd-dash ul.plain{list-style:none;margin:0;padding:0}
#ybd-dash .diet li{padding:.5rem 0;border-bottom:1px solid #DBD6CB}
#ybd-dash .diet li:last-child{border-bottom:none}
#ybd-dash .diet .who{font-weight:500}
#ybd-dash .diet .what{color:#5c564d}
#ybd-dash .hh{background:#fff;border:1px solid #DBD6CB;border-radius:.3rem;padding:1rem 1.1rem;margin-bottom:.7rem}
#ybd-dash .hh .hht{display:flex;justify-content:space-between;align-items:center;gap:1rem}
#ybd-dash .hh .hhn{font-family:'Newsreader',serif;font-style:italic;font-size:1.2rem}
#ybd-dash .g{display:grid;grid-template-columns:1fr auto;gap:.2rem 1rem;padding:.55rem 0;border-top:1px solid #EFECE4}
#ybd-dash .g:first-of-type{border-top:none}
#ybd-dash .g .gn{font-size:1rem}
#ybd-dash .g .gm{font-size:.85rem;color:#8B857A;grid-column:1/2}
#ybd-dash .pill{font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;padding:.15rem .55rem;border-radius:999px;white-space:nowrap;align-self:start}
#ybd-dash .pill.yes{background:#e4ede4;color:#3f5e3f}
#ybd-dash .pill.no{background:#efe1dc;color:#875a4a}
#ybd-dash .pill.wait{background:#eee9df;color:#8B857A}
#ybd-dash button{font-family:'Inter';cursor:pointer}
#ybd-dash .btn{background:#1B1A16;color:#F1EFE9;border:none;border-radius:999px;padding:.6rem 1.1rem;font-size:.9rem;font-weight:500}
#ybd-dash .btn.ghost{background:none;color:#5E7488;border:1px solid #DBD6CB}
#ybd-dash .btn.sm{padding:.4rem .9rem;font-size:.82rem}
#ybd-dash .actions{display:flex;flex-wrap:wrap;gap:.6rem;margin:.5rem 0 1rem}
#ybd-dash .ed{margin-top:.8rem;padding-top:.8rem;border-top:1px dashed #DBD6CB}
#ybd-dash .ed .er{padding:.5rem 0}
#ybd-dash .ed .seg{display:inline-flex;border:1px solid #1B1A16;border-radius:999px;overflow:hidden;margin:.3rem 0}
#ybd-dash .ed .seg button{background:none;border:none;padding:.35rem .9rem;font-size:.82rem;color:#1B1A16}
#ybd-dash .ed .seg button.on{background:#1B1A16;color:#F1EFE9}
#ybd-dash .ed label{display:block;font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:#8B857A;margin:.5rem 0 .25rem}
#ybd-dash .ed select,#ybd-dash .ed input{width:100%;font-family:'Inter';font-size:.95rem;background:#fff;border:1px solid #DBD6CB;border-radius:.2rem;padding:.5rem .6rem}
#ybd-dash .note{color:#8B857A;font-size:.9rem}
#ybd-dash .boot{padding:4rem 1rem;text-align:center;font-family:'Newsreader',serif;font-style:italic;font-size:1.3rem;color:#8B857A}
#ybd-dash .foot{margin-top:2.5rem;padding-top:1.4rem;border-top:1px solid #DBD6CB;color:#8B857A;font-size:.8rem;text-align:center}
`;
var st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);
app.innerHTML='<div class="boot" id="ybd-dboot">Loading dashboard...</div>';

function esc(s){return(""+s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function norm(s){return(""+s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim();}
function boot(m){var b=app.querySelector("#ybd-dboot");if(b)b.textContent=m;}
function parseJSON(s,f){if(s==null||s==="")return f;try{return JSON.parse(s);}catch(e){return f;}}
function toDate(v){if(!v)return null;if(v instanceof Date)return v;var s=String(v);var m=s.match(/^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)$/);if(m)return new Date(+m[1],+m[2],+m[3],+(m[4]||0),+(m[5]||0),+(m[6]||0));var d=new Date(s);return isNaN(d)?null:d;}
function fmtDate(d){try{return d.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"});}catch(e){return "";}}
function hkey(s){return String(s==null?"":s).trim().toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");}
function gvizRows(resp){var out=[];if(!resp||!resp.table)return out;var t=resp.table,cols=t.cols||[],rows=t.rows||[],labels=[];cols.forEach(function(c,i){labels[i]=hkey((c&&c.label)||"");});rows.forEach(function(r){var c=r.c||[],o={};for(var i=0;i<labels.length;i++){if(!labels[i])continue;var cell=c[i];o[labels[i]]=(cell&&cell.v!=null)?cell.v:"";}out.push(o);});return out;}
function jsonp(src,params,ok,err){var cb="__ybdD"+Math.random().toString(36).slice(2);var done=false;var s=document.createElement("script");window[cb]=function(r){done=true;try{delete window[cb];}catch(e){window[cb]=null;}if(s.parentNode)s.parentNode.removeChild(s);ok(r);};var sep=src.indexOf("?")>-1?"&":"?";s.src=src+sep+params+"&callback="+cb;s.onerror=function(){if(done)return;done=true;if(err)err();};document.body.appendChild(s);setTimeout(function(){if(done)return;done=true;if(err)err();},12000);}

/* read hash: #e=code&t=token (also accepts ?query) */
function hashParams(){var h=(location.hash||"").replace(/^#/,"");if(!h)h=(location.search||"").replace(/^\?/,"");var o={};h.split("&").forEach(function(kv){if(!kv)return;var i=kv.indexOf("=");var k=i>-1?kv.slice(0,i):kv;var v=i>-1?kv.slice(i+1):"";o[k]=decodeURIComponent(v.replace(/\+/g," "));});return o;}
var HP=hashParams();var EVENTCODE=(HP.e||"").trim();var TOKEN=(HP.t||"").trim();
if(!EVENTCODE||!TOKEN){boot("This dashboard link is incomplete. Please use the full link you were sent.");return;}

var EXEC="";
/* load config via gviz to find the Apps Script endpoint for this platform sheet */
window.__ybdDCfg=function(resp){
  var rows=gvizRows(resp),row=null;
  for(var i=0;i<rows.length;i++){if(norm(rows[i].event_code)===norm(EVENTCODE)){row=rows[i];break;}}
  if(!row){boot("This wedding could not be found.");return;}
  EXEC=(""+(row.rsvp_url||"")).trim();
  if(!EXEC){boot("The dashboard isn\u2019t connected yet. Please check back shortly.");return;}
  loadData();
};
(function(){var s=document.createElement("script");s.src="https://docs.google.com/spreadsheets/d/"+SHEET_ID+"/gviz/tq?gid="+CONFIG_GID+"&headers=1&tqx=out:json;responseHandler:__ybdDCfg";s.onerror=function(){boot("Couldn\u2019t load the dashboard. Please refresh.");};document.body.appendChild(s);})();

var DATA=null,ROLE="client",MEALS=[];
function loadData(){
  jsonp(EXEC,"action=dashboard&e="+encodeURIComponent(EVENTCODE)+"&token="+encodeURIComponent(TOKEN),function(r){
    if(!r||!r.ok){boot(r&&r.error==="unauthorized"?"This link isn\u2019t valid for this wedding.":"Couldn\u2019t load the dashboard. Please refresh.");return;}
    DATA=r;ROLE=r.role;MEALS=(parseJSON(r.event.menu_json,[])||[]).filter(function(co){return co.alt&&co.items&&co.items.length>1;}).map(function(co){return {course:co.c,options:co.items.map(function(it){return it.d;})};});
    render();
  },function(){boot("Couldn\u2019t load the dashboard. Please refresh.");});
}

function rsvpByName(){var m={};(DATA.rsvp||[]).forEach(function(r){m[norm(r.name)]=r;});return m;}
function statusOf(r){if(!r)return "wait";var a=norm(r.attending);return a==="yes"?"yes":(a==="no"?"no":"wait");}

function render(){
  var ev=DATA.event,inv=DATA.invite||[],byName=rsvpByName();
  var invited=inv.length,attending=0,declined=0,responded=0;
  inv.forEach(function(g){var s=statusOf(byName[norm(g.name)]);if(s==="yes"){attending++;responded++;}else if(s==="no"){declined++;responded++;}});
  var awaiting=invited-responded;
  var wd=toDate(ev.wedding_iso),dl=toDate(ev.rsvp_deadline);
  var metaText=(ev.date_meta&&!/^Date\(/.test(String(ev.date_meta)))?ev.date_meta:(wd?fmtDate(wd):"");
  var cd="";if(wd){var days=Math.max(0,Math.ceil((wd-new Date())/86400000));cd=days+(days===1?" day to go":" days to go");}
  var dlLine=dl?("RSVPs close "+fmtDate(dl)):"";

  var H='<div class="dwm">Your Big Day</div>'
   +'<div class="dh"><h1>'+esc(ev.couple_names)+'</h1><span class="chip">'+(ROLE==="admin"?"Admin console":"Your dashboard")+'</span></div>'
   +'<div class="dmeta">'+[metaText,cd,dlLine].filter(Boolean).map(esc).join(" &middot; ")+'</div>';

  H+='<div class="tiles">'
   +tile(invited,"Invited","")
   +tile(responded,"Responded","")
   +tile(attending,"Attending","ok")
   +tile(declined,"Can\u2019t make it","no")
   +tile(awaiting,"Awaiting reply","wait")
   +'</div>';

  /* meal tallies */
  if(MEALS.length){
    H+='<h2>Meal choices</h2>';
    var attGuests=inv.filter(function(g){return statusOf(byName[norm(g.name)])==="yes";}).map(function(g){return byName[norm(g.name)];});
    MEALS.forEach(function(mc){
      var counts={},chosen=0;mc.options.forEach(function(o){counts[o]=0;});
      attGuests.forEach(function(r){if(!r||!r.meal)return;(""+r.meal).split("|").forEach(function(seg){var idx=seg.indexOf(":");if(idx<0)return;if(norm(seg.slice(0,idx))!==norm(mc.course))return;var opt=seg.slice(idx+1).trim();if(counts.hasOwnProperty(opt)){counts[opt]++;chosen++;}else{counts[opt]=(counts[opt]||0)+1;chosen++;}});});
      var max=Math.max(1,attending);
      H+='<div class="mt"><div class="mc">'+esc(mc.course)+'</div>';
      Object.keys(counts).forEach(function(o){var n=counts[o];H+='<div class="bar"><div class="bl">'+esc(o)+'</div><div class="bt"><div class="bf" style="width:'+Math.round(n/max*100)+'%"></div></div><div class="bn">'+n+'</div></div>';});
      H+='</div>';
    });
  }

  /* dietary */
  var diet=inv.map(function(g){return byName[norm(g.name)];}).filter(function(r){return r&&norm(r.attending)==="yes"&&r.dietary&&(""+r.dietary).trim();});
  if(diet.length){H+='<h2>Dietary &amp; allergies</h2><ul class="plain diet">'+diet.map(function(r){return '<li><span class="who">'+esc(r.name)+'</span> &mdash; <span class="what">'+esc(r.dietary)+'</span></li>';}).join("")+'</ul>';}

  /* actions */
  H+='<h2>Guests</h2>';
  H+='<div class="actions"><button type="button" class="btn ghost sm" id="ybd-csv">Download guest list (CSV)</button>'
    +'<button type="button" class="btn ghost sm" id="ybd-chase">Copy chase list</button>'
    +(ROLE==="admin"?'<button type="button" class="btn ghost sm" id="ybd-refresh">Refresh</button>':'')+'</div>';

  /* households */
  var order=[],groups={};
  inv.forEach(function(g){var h=g.household||g.name;if(!groups[h]){groups[h]=[];order.push(h);}groups[h].push(g);});
  order.forEach(function(h){
    var members=groups[h];
    var anyResp=members.some(function(g){return statusOf(byName[norm(g.name)])!=="wait";});
    H+='<div class="hh" data-hh="'+esc(h)+'"><div class="hht"><div class="hhn">'+esc(h)+'</div>'+(ROLE==="admin"?'<button type="button" class="btn ghost sm hh-edit">Edit</button>':'')+'</div>';
    members.forEach(function(g){
      var r=byName[norm(g.name)],s=statusOf(r);
      var pill=s==="yes"?'<span class="pill yes">Attending</span>':(s==="no"?'<span class="pill no">Declined</span>':'<span class="pill wait">No reply</span>');
      H+='<div class="g"><div class="gn">'+esc(g.name)+'</div>'+pill+(r&&r.meal?'<div class="gm">'+esc(r.meal)+(r.dietary?' &middot; '+esc(r.dietary):'')+'</div>':(r&&r.dietary?'<div class="gm">'+esc(r.dietary)+'</div>':''))+'</div>';
    });
    H+='<div class="edhold"></div></div>';
  });

  H+='<div class="foot">Your Big Day &middot; '+(ROLE==="admin"?"Operator console":"Live as your guests reply")+'</div>';

  app.innerHTML=H;
  wire(byName,groups);
}

function tile(n,l,cls){return '<div class="tile '+(cls||"")+'"><div class="n">'+n+'</div><div class="l">'+l+'</div></div>';}

function wire(byName,groups){
  var csv=app.querySelector("#ybd-csv");if(csv)csv.addEventListener("click",function(){downloadCSV();});
  var chase=app.querySelector("#ybd-chase");if(chase)chase.addEventListener("click",function(){copyChase(byName,groups);});
  var rf=app.querySelector("#ybd-refresh");if(rf)rf.addEventListener("click",function(){rf.textContent="Refreshing\u2026";loadData();});
  if(ROLE==="admin"){
    [].forEach.call(app.querySelectorAll(".hh"),function(card){
      var btn=card.querySelector(".hh-edit");if(!btn)return;
      btn.addEventListener("click",function(){
        var hold=card.querySelector(".edhold");
        if(hold.innerHTML){hold.innerHTML="";btn.textContent="Edit";return;}
        btn.textContent="Close";
        hold.innerHTML=editForm(card.getAttribute("data-hh"),groups,byName);
        wireEdit(card,byName,groups);
      });
    });
  }
}

function editForm(h,groups,byName){
  var members=groups[h]||[];
  var rows=members.map(function(g,i){
    var r=byName[norm(g.name)]||{};var a=norm(r.attending);
    var mealsel={};if(r.meal){(""+r.meal).split("|").forEach(function(seg){var idx=seg.indexOf(":");if(idx>-1)mealsel[norm(seg.slice(0,idx))]=seg.slice(idx+1).trim();});}
    var meals=MEALS.map(function(mc,mi){var opts='<option value="">Select\u2026</option>'+mc.options.map(function(o){return '<option'+(mealsel[norm(mc.course)]===o?' selected':'')+'>'+esc(o)+'</option>';}).join("");return '<label>'+esc(mc.course)+'</label><select data-meal="'+mi+'">'+opts+'</select>';}).join("");
    return '<div class="er" data-i="'+i+'" data-name="'+esc(g.name)+'"><div style="font-weight:500">'+esc(g.name)+'</div><div class="seg"><button type="button" data-att="yes"'+(a==="yes"?' class="on"':'')+'>Attending</button><button type="button" data-att="no"'+(a==="no"?' class="on"':'')+'>Can\u2019t</button></div><div class="mealwrap"'+(a==="yes"?'':' style="display:none"')+'>'+meals+'<label>Dietary</label><input type="text" data-diet value="'+esc(r.dietary||"")+'"></div></div>';
  }).join("");
  return '<div class="ed">'+rows+'<button type="button" class="btn sm ybd-savehh" style="margin-top:.6rem">Save</button> <span class="note ybd-savemsg"></span></div>';
}

function wireEdit(card,byName,groups){
  [].forEach.call(card.querySelectorAll(".er"),function(er){
    var seg=er.querySelector(".seg"),wrap=er.querySelector(".mealwrap");
    seg.addEventListener("click",function(e){var b=e.target.closest?e.target.closest("button[data-att]"):null;if(!b)return;[].forEach.call(seg.querySelectorAll("button"),function(x){x.classList.remove("on");});b.classList.add("on");if(wrap)wrap.style.display=(b.getAttribute("data-att")==="yes")?"block":"none";});
  });
  var save=card.querySelector(".ybd-savehh"),msg=card.querySelector(".ybd-savemsg");
  save.addEventListener("click",function(){
    var h=card.getAttribute("data-hh");var guests=[];
    [].forEach.call(card.querySelectorAll(".er"),function(er){
      var name=er.getAttribute("data-name");var on=er.querySelector(".seg button.on");var attending=on?on.getAttribute("data-att"):"";
      var meal="",dietary="";
      if(attending==="yes"){var parts=[];[].forEach.call(er.querySelectorAll("select[data-meal]"),function(sel){var mi=Number(sel.getAttribute("data-meal"));if(sel.value)parts.push(MEALS[mi].course+": "+sel.value);});meal=parts.join(" | ");var di=er.querySelector("input[data-diet]");dietary=di?di.value.trim():"";}
      guests.push({name:name,household:h,attending:attending,meal:meal,dietary:dietary});
    });
    save.disabled=true;msg.textContent="Saving\u2026";
    jsonp(EXEC,"action=admin_save&e="+encodeURIComponent(EVENTCODE)+"&token="+encodeURIComponent(TOKEN)+"&d="+encodeURIComponent(JSON.stringify({household:h,guests:guests})),function(r){if(r&&r.ok){msg.textContent="Saved";loadData();}else{save.disabled=false;msg.textContent="Couldn\u2019t save";}},function(){save.disabled=false;msg.textContent="Couldn\u2019t save";});
  });
}

function csvCell(s){s=(""+(s==null?"":s));return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}
function downloadCSV(){
  var inv=DATA.invite||[],byName=rsvpByName();
  var rows=[["Household","Guest","Status","Meal","Dietary","Table"]];
  inv.forEach(function(g){var r=byName[norm(g.name)]||{};var a=norm(r.attending);var status=a==="yes"?"Attending":(a==="no"?"Declined":"No reply");rows.push([g.household||g.name,g.name,status,r.meal||"",r.dietary||"",g.table_name||g.table_number||""]);});
  var csv=rows.map(function(r){return r.map(csvCell).join(",");}).join("\r\n");
  var blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});var url=URL.createObjectURL(blob);
  var a=document.createElement("a");a.href=url;a.download="rsvp-"+EVENTCODE+".csv";document.body.appendChild(a);a.click();setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(url);},100);
}
function copyChase(byName,groups){
  var out=[];Object.keys(groups).forEach(function(h){var members=groups[h];var anyResp=members.some(function(g){return statusOf(byName[norm(g.name)])!=="wait";});if(!anyResp)out.push(h+" ("+members.map(function(g){return g.name;}).join(", ")+")");});
  var text=out.length?("Yet to RSVP:\n"+out.join("\n")):"Everyone has replied.";
  try{navigator.clipboard.writeText(text);}catch(e){}
  var btn=app.querySelector("#ybd-chase");if(btn){var o=btn.textContent;btn.textContent=out.length?("Copied "+out.length+" households"):"Everyone replied";setTimeout(function(){btn.textContent=o;},2500);}
}
})();
