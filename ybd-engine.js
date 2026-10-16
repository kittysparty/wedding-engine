/*! Your Big Day - digital wedding suite engine
 *  One file, many weddings. A wedding page is just:
 *    <div id="ybd-app" data-event="CODE"></div>
 *    <script src="<this file>"></script>
 *  All per-couple content lives in the platform Google Sheet (config + guests tabs),
 *  keyed by event code. Update this file once -> every wedding updates.
 */
(function(){
"use strict";
var app=document.getElementById("ybd-app");
if(!app||app.dataset.init)return;app.dataset.init="1";
var EVENTCODE=(app.getAttribute("data-event")||"").trim();

/* ===== platform data store (the one Sheet all weddings read from) ===== */
var SHEET_ID="17FmEqRJx_46I7JWz6R0ZK1e5mwwg--I-HUKuwGy8sPQ";
var CONFIG_GID="0";
var GUESTS_GID="100";
/* ====================================================================== */

/* ---------- styles (injected; stub page carries none) ---------- */
var CSS=`
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600');
html:has(#ybd-app),body:has(#ybd-app){overflow:hidden;height:100%}
#ybd-app{position:fixed;inset:0;max-width:none;width:auto;margin:0;z-index:2147483000;display:flex;flex-direction:column;background:#F1EFE9;font-family:'Inter',system-ui,sans-serif;color:#1B1A16;line-height:1.6;-webkit-font-smoothing:antialiased}
body.admin-bar #ybd-app{top:32px}
@media(max-width:782px){body.admin-bar #ybd-app{top:46px}}
#ybd-app *{box-sizing:border-box;margin:0;padding:0}
#ybd-app .shell{flex:1 1 auto;display:flex;flex-direction:column;min-width:0;min-height:0;width:100%}
#ybd-app .bar{flex:0 0 auto;position:relative;display:flex;align-items:center;justify-content:center;padding:calc(env(safe-area-inset-top,0) + .7rem) 1.15rem .7rem;background:rgba(241,239,233,.94);backdrop-filter:blur(8px);border-bottom:1px solid #1B1A16}
#ybd-app .bar .back{position:absolute;left:1.15rem;top:50%;transform:translateY(-50%);background:none;border:none;font-family:'Inter';font-size:.88rem;color:#5E7488;cursor:pointer;display:none;align-items:center;gap:.35rem}
#ybd-app .bar .back.on{display:flex}
#ybd-app .bar .brand{display:flex;flex-direction:column;align-items:center;gap:.25rem;background:none;border:none;padding:0;cursor:pointer}
#ybd-app .bar .brand img{width:26px;height:26px;border-radius:50%;object-fit:cover;display:block}
#ybd-app .bar .brand .wm{font-size:.6rem;letter-spacing:.24em;text-transform:uppercase;color:#8B857A;white-space:nowrap}
#ybd-app .main{flex:1 1 auto;min-height:0;position:relative}
#ybd-app .view{position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;display:none}
#ybd-app .view.on{display:block;animation:ybdf .3s ease}
#ybd-app .view.frame{overflow:hidden}
#ybd-app .view.frame iframe{width:100%;height:100%;border:0;display:block;background:#F1EFE9}
@keyframes ybdf{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
#ybd-app .col{max-width:40rem;margin:0 auto}
#ybd-app .pad{padding:1.6rem 1.25rem 3rem}
#ybd-app .hero{text-align:center;max-width:40rem;margin:0 auto;padding:2.6rem 1.25rem 2rem}
#ybd-app .hero.photohero{max-width:none;color:#fff;min-height:66vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background-size:cover;background-position:center;padding:3rem 1.5rem}
#ybd-app .hero.photohero .pre{color:#EADFCB}
#ybd-app .hero.photohero h1{color:#fff}
#ybd-app .hero.photohero h1 .amp{color:#E3C9A6}
#ybd-app .hero.photohero .meta{color:rgba(255,255,255,.85)}
#ybd-app .hero.photohero .cd{color:rgba(255,255,255,.92)}
#ybd-app .hero .pre{font-size:.74rem;letter-spacing:.28em;text-transform:uppercase;color:#5E7488;margin-bottom:1rem}
#ybd-app .hero h1{font-family:'Newsreader',serif;font-weight:300;font-style:italic;font-size:clamp(2.8rem,13vw,4.4rem);line-height:1}
#ybd-app .hero h1 .amp{font-style:normal;color:#8B857A}
#ybd-app .hero .meta{margin-top:1.1rem;font-size:.86rem;letter-spacing:.14em;text-transform:uppercase;color:#8B857A}
#ybd-app .hero .cd{margin-top:1rem;font-family:'Newsreader',serif;font-style:italic;color:#5E7488}
#ybd-app .acts{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;max-width:40rem;margin:0 auto;padding:.5rem 1.25rem 2rem}
#ybd-app .act{background:#fff;border:1px solid #DBD6CB;border-radius:.2rem;padding:1.15rem 1rem;text-align:left;cursor:pointer;transition:border-color .15s,transform .15s}
#ybd-app .act:hover{transform:translateY(-2px);border-color:#5E7488}
#ybd-app .act .ico{width:1.7rem;height:1.7rem;color:#5E7488;margin-bottom:.7rem;stroke-width:1.5;fill:none;stroke:currentColor}
#ybd-app .act .t{font-family:'Newsreader',serif;font-style:italic;font-size:1.2rem}
#ybd-app .act .d{font-size:.8rem;color:#8B857A;margin-top:.1rem}
#ybd-app .section{padding:1.7rem 1.25rem;border-top:1px solid #DBD6CB}
#ybd-app .kicker{font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:#5E7488;margin-bottom:.5rem}
#ybd-app h2{font-family:'Newsreader',serif;font-weight:300;font-style:italic;font-size:1.75rem;line-height:1.1}
#ybd-app .section p{color:#5c564d;margin-top:.6rem}
#ybd-app .tl{list-style:none;margin-top:1rem}
#ybd-app .tl li{display:flex;gap:1.1rem;padding:.65rem 0;border-bottom:1px solid #DBD6CB}
#ybd-app .tl li:last-child{border-bottom:none}
#ybd-app .tl .tm{font-family:'Newsreader',serif;font-style:italic;color:#5E7488;min-width:3.6rem}
#ybd-app .foot{text-align:center;padding:2rem 1.25rem 3rem;color:#8B857A;font-size:.8rem;border-top:1px solid #DBD6CB}
#ybd-app .foot a{color:#5E7488;text-decoration:none;border-bottom:1px solid #DBD6CB}
#ybd-app .foot b{font-family:'Newsreader',serif;font-style:italic;font-weight:500;color:#5E7488}
#ybd-app .course{padding:1rem 0;border-bottom:1px solid #DBD6CB}
#ybd-app .course:last-child{border-bottom:none}
#ybd-app .course .c{font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;color:#5E7488}
#ybd-app .course .d{font-family:'Newsreader',serif;font-style:italic;font-size:1.25rem;margin:.25rem 0}
#ybd-app .course .n{font-size:.88rem;color:#8B857A}
#ybd-app .course .tag{font-family:'Inter';font-style:normal;font-size:.58rem;letter-spacing:.12em;color:#8B857A;border:1px solid #DBD6CB;border-radius:1rem;padding:.08rem .45rem;vertical-align:middle;margin-left:.45rem}
#ybd-app .course .altw{font-size:.64rem;letter-spacing:.18em;text-transform:uppercase;color:#b3ada1;margin:.55rem 0}
#ybd-app .finder .lab{font-family:'Newsreader',serif;font-style:italic;font-size:1.4rem;margin-bottom:.8rem}
#ybd-app .field{position:relative;border-bottom:1.5px solid #1B1A16}
#ybd-app .field input{width:100%;font-family:'Inter';font-size:1.15rem;color:#1B1A16;background:none;border:none;padding:.6rem 1.7rem .65rem 0;outline:none}
#ybd-app .field input::placeholder{color:#b3ada1}
#ybd-app .field .ic{position:absolute;right:0;top:50%;transform:translateY(-50%);width:1.15rem;height:1.15rem;stroke:#8B857A;fill:none;stroke-width:1.8;stroke-linecap:round}
#ybd-app .result{margin-top:2rem;display:none}
#ybd-app .result.on{display:block}
#ybd-app .you{font-size:1rem;color:#8B857A}
#ybd-app .seat{font-family:'Newsreader',serif;font-style:italic;font-weight:300;font-size:clamp(2rem,6vw,2.7rem);line-height:1.12;margin-top:.35rem}
#ybd-app .seat .tno{font-style:normal;color:#5E7488}
#ybd-app .mates{margin-top:1.8rem;padding-top:1.3rem;border-top:1px solid #DBD6CB}
#ybd-app .mates .ml{font-size:.8rem;letter-spacing:.14em;text-transform:uppercase;color:#8B857A;margin-bottom:.8rem}
#ybd-app .mates ul{list-style:none;display:flex;flex-direction:column;gap:.5rem}
#ybd-app .mates li{font-size:1.05rem;color:#4b463f}
#ybd-app .mates li.self{color:#5E7488;font-weight:500}
#ybd-app .nomatch{font-family:'Newsreader',serif;font-style:italic;font-size:1.3rem}
#ybd-app .nomatch small{display:block;font-family:'Inter';font-style:normal;font-size:.9rem;color:#8B857A;margin-top:.4rem}
#ybd-app .choice{display:block;width:100%;text-align:left;background:none;border:none;border-bottom:1px solid #DBD6CB;padding:.8rem 0;font-family:'Inter';font-size:1.1rem;color:#1B1A16;cursor:pointer}
#ybd-app .choice:hover{color:#5E7488}
#ybd-app .seatstatus{color:#8B857A;padding:1rem 0}
#ybd-app .seatstatus .big{font-family:'Newsreader',serif;font-style:italic;font-size:1.4rem;color:#1B1A16;margin-bottom:.4rem}
#ybd-app .soon{text-align:center;padding:3rem 1.25rem}
#ybd-app .soon .big{font-family:'Newsreader',serif;font-style:italic;font-size:1.6rem;margin-bottom:.5rem}
#ybd-app .soon p{color:#8B857A}
#ybd-app .boot{display:flex;align-items:center;justify-content:center;height:100%;font-family:'Newsreader',serif;font-style:italic;font-size:1.3rem;color:#8B857A}
`;
var st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);

/* shell + boot placeholder */
var shell=document.createElement("div");shell.className="shell";
shell.innerHTML='<div class="main"><div class="view on"><div class="boot" id="ybd-boot">Loading your wedding...</div></div></div>';
app.appendChild(shell);

/* ---------- helpers ---------- */
function esc(s){return(""+s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function ampName(s){return(""+s).split("&").map(function(p){return esc(p.trim());}).join(' <span class="amp">&amp;</span> ');}
function norm(s){return(""+s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s'-]/g," ").replace(/\s+/g," ").trim();}
function parseJSON(s,fallback){if(s==null||s==="")return fallback;try{return JSON.parse(s);}catch(e){return fallback;}}
function boot(msg){var b=app.querySelector("#ybd-boot");if(b)b.textContent=msg;}
function loadGviz(gid,cb){var s=document.createElement("script");s.src="https://docs.google.com/spreadsheets/d/"+SHEET_ID+"/gviz/tq?gid="+gid+"&headers=1&tqx=out:json;responseHandler:"+cb;s.onerror=function(){window[cb]&&window[cb](null);};document.body.appendChild(s);return s;}
/* snake_case header -> object key, matching the engine's property names (event_code, couple_names, ...) */
function hkey(s){return String(s==null?"":s).trim().toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");}
/* turn a gviz response into array of row objects keyed by header */
function gvizRows(resp){
  var out=[];if(!resp||!resp.table)return out;
  var t=resp.table,cols=t.cols||[],rows=t.rows||[],labels=[];
  cols.forEach(function(c,i){labels[i]=hkey((c&&c.label)||"");});
  rows.forEach(function(r){var c=r.c||[],o={};for(var i=0;i<labels.length;i++){if(!labels[i])continue;var cell=c[i];o[labels[i]]=(cell&&cell.v!=null)?cell.v:"";}out.push(o);});
  return out;
}

var IC={
rsvp:'<svg class="ico" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
seat:'<svg class="ico" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
menu:'<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
photos:'<svg class="ico" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M8 6l1.5-2h5L16 6"/><circle cx="12" cy="12.5" r="3.5"/></svg>'
};
var LABELS={rsvp:["RSVP","Let us know you\u2019re coming"],seat:["Find your seat","Which table am I on?"],menu:["Menu & timeline","The food & the day"],photos:["Photos","Share your snaps"]};
function tl(rows){return '<ul class="tl">'+rows.map(function(r){return '<li><span class="tm">'+esc(r[0])+'</span><span>'+esc(r[1])+'</span></li>';}).join("")+'</ul>';}

/* ---------- guard: no event code ---------- */
if(!EVENTCODE){boot("This wedding link is missing its event code.");return;}

/* ---------- load config, then render ---------- */
window.__ybdCfgCb=function(resp){
  var rows=gvizRows(resp);
  if(!rows.length){boot("We couldn\u2019t load this wedding. Please refresh.");return;}
  var row=null;
  for(var i=0;i<rows.length;i++){if(norm(rows[i].event_code)===norm(EVENTCODE)){row=rows[i];break;}}
  if(!row){boot("This wedding could not be found. Please check your link.");return;}
  try{render(buildConfig(row));}catch(e){boot("Something went wrong loading this wedding.");}
};
loadGviz(CONFIG_GID,"__ybdCfgCb");
setTimeout(function(){var b=app.querySelector("#ybd-boot");if(b&&/Loading/.test(b.textContent))boot("Taking longer than usual \u2014 please refresh.");},9000);

/* map a config row -> normalised CFG object */
function buildConfig(r){
  var feats=(""+(r.features||"")).split(",").map(function(s){return norm(s);}).filter(Boolean);
  if(!feats.length)feats=["rsvp","seat","menu","photos"];
  return {
    couple:r.couple_names||"",
    logo:r.logo||"https://i0.wp.com/yourbigday.events/wp-content/uploads/2024/01/image_123650291.jpg",
    photo:r.hero_photo||"",
    dateMeta:r.date_meta||"",
    iso:r.wedding_iso||"",
    theme:norm(r.theme||"editorial"),
    features:feats,
    wedibox:r.wedibox_url||"",
    rsvpUrl:r.rsvp_url||"",
    venue:r.venue_text||"",
    story:parseJSON(r.story_json,[]),
    order:parseJSON(r.order_json,[]),
    menu:parseJSON(r.menu_json,[]),
    menuOrder:parseJSON(r.menu_order_json,[])
  };
}

/* ---------- render the hub from CFG ---------- */
function render(CFG){
  var has={};CFG.features.forEach(function(f){has[f]=true;});

  /* home: action cards (only enabled features, in a fixed order) */
  var order=["rsvp","seat","menu","photos"];
  var cards=order.filter(function(f){return has[f];}).map(function(f){
    return '<div class="act" data-go="'+f+'">'+IC[f]+'<div class="t">'+LABELS[f][0]+'</div><div class="d">'+LABELS[f][1]+'</div></div>';
  }).join("");

  var heroStyle=CFG.photo?(' photohero" style="background-image:linear-gradient(rgba(27,26,22,.28),rgba(27,26,22,.62)),url(\''+CFG.photo+'\')"'):'"';
  var sections="";
  if(CFG.story&&CFG.story.length)sections+='<div class="section"><div class="kicker">Our love story</div><h2>How it all began</h2>'+CFG.story.map(function(p){return '<p>'+esc(p)+'</p>';}).join("")+'</div>';
  if(CFG.order&&CFG.order.length)sections+='<div class="section"><div class="kicker">The day</div><h2>Order of the day</h2>'+tl(CFG.order)+'</div>';
  if(CFG.venue)sections+='<div class="section"><div class="kicker">Getting there</div><h2>Venue & travel</h2><p>'+esc(CFG.venue)+'</p></div>';

  var home='<div class="view on" data-id="home">'
  +'<div class="hero'+heroStyle+'><div class="pre">We\u2019re getting married</div>'
  +'<h1>'+ampName(CFG.couple)+'</h1>'
  +(CFG.dateMeta?'<div class="meta">'+esc(CFG.dateMeta)+'</div>':'')
  +'<div class="cd" id="ybd-cd"></div></div>'
  +(cards?'<div class="acts">'+cards+'</div>':'')
  +'<div class="col">'+sections
  +'<div class="foot">Have your wedding coming up? Set up your digital experience with <a href="https://yourbigday.events/contact-us/"><b>Your Big Day</b></a></div>'
  +'</div></div>';

  /* seat */
  var seat=has.seat?('<div class="view" data-id="seat"><div class="col pad finder">'
  +'<div class="kicker">Find your seat</div><div class="lab">Where am I sitting?</div>'
  +'<div class="field"><input id="ybd-sq" type="search" placeholder="Start typing your name" autocomplete="off" aria-label="Find your seat"><svg class="ic" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></div>'
  +'<div class="result" id="ybd-seat-out"></div><div class="seatstatus" id="ybd-seat-status"></div>'
  +'</div></div>'):'';

  /* menu */
  var menu="";
  if(has.menu){
    function itemHtml(it){return '<div class="d">'+esc(it.d)+(it.tag?' <span class="tag">'+esc(it.tag)+'</span>':'')+'</div>'+(it.n?'<div class="n">'+esc(it.n)+'</div>':'');}
    var courses=(CFG.menu||[]).map(function(co){var body=co.items.map(itemHtml).join(co.alt?'<div class="altw">alternating with</div>':'');return '<div class="course"><div class="c">'+esc(co.c)+'</div>'+body+'</div>';}).join("");
    menu='<div class="view" data-id="menu"><div class="col pad">'
    +'<div class="kicker">At your table</div><h2>The menu</h2>'
    +'<div style="margin-top:1rem">'+courses+'</div>'
    +(CFG.menuOrder&&CFG.menuOrder.length?'<h2 style="margin-top:2.2rem">Running order</h2>'+tl(CFG.menuOrder):'')
    +'</div></div>';
  }

  /* rsvp */
  var rsvp="";
  if(has.rsvp){
    rsvp=CFG.rsvpUrl
      ?'<div class="view frame" data-id="rsvp"><iframe data-src="'+CFG.rsvpUrl+'" allow="clipboard-write"></iframe></div>'
      :'<div class="view" data-id="rsvp"><div class="col"><div class="soon"><div class="big">RSVP opening soon</div><p>The RSVP form is being connected \u2014 please check back shortly.</p></div></div></div>';
  }

  /* photos */
  var photos=(has.photos&&CFG.wedibox)?('<div class="view frame" data-id="photos"><iframe data-src="'+CFG.wedibox+'" allow="camera;microphone;clipboard-write;encrypted-media"></iframe></div>'):'';

  shell.innerHTML='<div class="bar">'
  +'<button type="button" class="back" id="ybd-back">\u2190 Back</button>'
  +'<button type="button" class="brand" data-go="home" aria-label="Home"><img src="'+CFG.logo+'" alt="Your Big Day"><span class="wm">Your Big Day</span></button>'
  +'</div><div class="main">'+home+seat+menu+rsvp+photos+'</div>';

  var back=app.querySelector("#ybd-back");
  function go(id){
    [].forEach.call(app.querySelectorAll(".view"),function(v){v.classList.toggle("on",v.getAttribute("data-id")===id);});
    back.classList.toggle("on",id!=="home");
    var v=app.querySelector('.view[data-id="'+id+'"]');if(v)v.scrollTop=0;
    var fr=v?v.querySelector("iframe[data-src]"):null;
    if(fr&&!fr.getAttribute("src"))fr.setAttribute("src",fr.getAttribute("data-src"));
    if(id==="seat")seatInit();
  }
  [].forEach.call(app.querySelectorAll("[data-go]"),function(el){el.addEventListener("click",function(){go(el.getAttribute("data-go"));});});
  back.addEventListener("click",function(){go("home");});

  /* countdown */
  (function(){if(!CFG.iso)return;var d=new Date(CFG.iso);var el=app.querySelector("#ybd-cd");if(!el||isNaN(d))return;var days=Math.max(0,Math.ceil((d-new Date())/86400000));el.textContent=days===0?"Today is the day":(days+(days===1?" day to go":" days to go"));})();

  /* ===== live seat search (reads the guests tab) ===== */
  var GUESTS=[],BYNO={},CHOICES=[],seatDone=false,seatStarted=false;
  var sq,outEl,statusEl;
  function lev(a,b){var m=a.length,n=b.length;if(!m)return n;if(!n)return m;var p=[],c=[],i,j;for(j=0;j<=n;j++)p[j]=j;for(i=1;i<=m;i++){c[0]=i;for(j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));var t=p;p=c;c=t;}return p[n];}
  function mtch(name,q){var n=norm(name),query=norm(q);if(!query)return 0;if(n===query)return 100;if(n.indexOf(query)===0)return 90;var t=n.split(" ");for(var i=0;i<t.length;i++)if(t[i].indexOf(query)===0)return 80;if(n.indexOf(query)>-1)return 65;for(var k=0;k<t.length;k++){var d=lev(t[k],query);if(query.length>=4&&d<=1)return 55;if(query.length>=6&&d<=2)return 45;}return 0;}
  function seatStatus(big,small){if(!statusEl)return;statusEl.innerHTML=big?('<div class="big">'+big+'</div>'+(small?'<div>'+small+'</div>':'')):"";}
  function clearOut(){outEl.className="result";outEl.innerHTML="";}
  function showGuest(g){
    var t=BYNO[g.tno]||{no:g.tno,name:g.tname,guests:[g.name]};
    var mates=t.guests.map(function(n){var self=norm(n)===norm(g.name);return '<li class="'+(self?"self":"")+'">'+esc(n)+(self?" (you)":"")+'</li>';}).join("");
    outEl.innerHTML='<div class="you">'+esc(g.name)+'</div><div class="seat"><span class="tno">Table '+g.tno+'</span> \u2014 '+esc(t.name)+'</div><div class="mates"><div class="ml">Seated with</div><ul>'+mates+'</ul></div>';
    outEl.className="result on";
  }
  function showChoices(list){CHOICES=list;var b=list.map(function(g,i){return '<button type="button" class="choice" data-i="'+i+'">'+esc(g.name)+'</button>';}).join("");outEl.innerHTML='<div class="nomatch" style="font-size:1.2rem;margin-bottom:.6rem">A few names match \u2014 which one are you?</div>'+b;outEl.className="result on";}
  function search(q){clearOut();if(!q.trim())return;var hits=[];GUESTS.forEach(function(g){var s=mtch(g.name,q);if(s>0)hits.push({g:g,s:s});});if(!hits.length){outEl.innerHTML='<div class="nomatch">We couldn\u2019t find that name.<small>Try your first or last name, or check with the couple.</small></div>';outEl.className="result on";return;}hits.sort(function(a,b){return b.s-a.s;});var best=hits[0].s;var top=hits.filter(function(h){return h.s===best;});if(top.length===1)showGuest(top[0].g);else showChoices(top.map(function(h){return h.g;}));}
  function buildSeats(rows){
    seatDone=true;
    var mine=rows.filter(function(r){return norm(r.code)===norm(EVENTCODE);});
    var withTables=mine.filter(function(r){return r.tno;});
    if(!mine.length){seatStatus("Seating chart not found","Please check your link, or ask the couple.");return;}
    if(!withTables.length){seatStatus("Seating opens closer to the day","Tables are assigned once RSVPs are in \u2014 please check back.");return;}
    GUESTS=[];BYNO={};
    withTables.forEach(function(r){if(!r.name)return;GUESTS.push({name:r.name,tno:r.tno,tname:r.tname});if(!BYNO[r.tno])BYNO[r.tno]={no:r.tno,name:r.tname,guests:[]};BYNO[r.tno].guests.push(r.name);});
    seatStatus("","");
  }
  window.__ybdSeatCb=function(resp){
    try{
      var rows=gvizRows(resp),out=[];
      rows.forEach(function(o){var code=(""+(o.event_code||"")).trim();if(!code)return;var name=(""+(o.guest_name||"")).trim();if(!name)return;out.push({code:code,name:name,tno:Number(o.table_number)||0,tname:(""+(o.table_name||"")).trim()});});
      buildSeats(out);
    }catch(e){seatDone=true;seatStatus("Something went wrong","Please refresh the page to try again.");}
  };
  function seatInit(){
    if(seatStarted)return;seatStarted=true;
    sq=app.querySelector("#ybd-sq");outEl=app.querySelector("#ybd-seat-out");statusEl=app.querySelector("#ybd-seat-status");
    var tmr;sq.addEventListener("input",function(e){clearTimeout(tmr);tmr=setTimeout(function(){if(seatDone)search(e.target.value);},110);});
    outEl.addEventListener("click",function(e){var b=e.target.closest?e.target.closest(".choice"):null;if(!b)return;var g=CHOICES[Number(b.getAttribute("data-i"))];if(g)showGuest(g);});
    seatStatus("Loading the seating chart","One moment.");
    loadGviz(GUESTS_GID,"__ybdSeatCb");
    setTimeout(function(){if(seatDone)return;seatDone=true;seatStatus("Could not load the seating chart","Please refresh to try again.");},9000);
  }
}
})();
