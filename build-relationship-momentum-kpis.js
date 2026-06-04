const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const before = html;

html = html.replace(/<style id="tapdRelationshipMomentumStyle">[\s\S]*?<\/style>/g, '');
html = html.replace(/<script id="tapdRelationshipMomentumKpis">[\s\S]*?<\/script>/g, '');

const style = String.raw`
<style id="tapdRelationshipMomentumStyle">
  .tapd-momentum-card{
    margin:0 0 16px;
    padding:14px;
    border-radius:18px;
    border:1px solid rgba(14,206,192,.22);
    background:linear-gradient(135deg,rgba(14,206,192,.08),rgba(234,179,8,.045));
    box-shadow:0 12px 34px rgba(0,0,0,.20);
    font-family:Inter,sans-serif;
  }
  .tapd-momentum-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px;}
  .tapd-momentum-kicker{margin:0 0 4px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;font-weight:900;color:#EAB308;}
  .tapd-momentum-title{margin:0;font-size:15px;line-height:1.2;font-weight:900;color:#F8FAFC;letter-spacing:-.2px;}
  .tapd-momentum-sub{margin:4px 0 0;font-size:11px;line-height:1.45;color:#8EA2B2;}
  .tapd-momentum-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
  .tapd-momentum-stat{min-height:76px;border-radius:15px;border:1px solid rgba(148,163,184,.16);background:#101820;padding:11px 9px;display:flex;flex-direction:column;justify-content:space-between;}
  .tapd-momentum-value{font-size:23px;line-height:1;font-weight:950;letter-spacing:-.6px;color:#F8FAFC;}
  .tapd-momentum-label{font-size:10.5px;line-height:1.2;font-weight:800;color:#CBD5E1;margin-top:8px;}
  .tapd-momentum-note{margin:10px 0 0;font-size:10.5px;line-height:1.45;color:#6F8495;}
  .tapd-momentum-stat.opportunity{border-color:rgba(234,179,8,.30);background:linear-gradient(135deg,rgba(234,179,8,.10),#101820);}
  .tapd-momentum-stat.opportunity .tapd-momentum-value{color:#EAB308;}
  @media(max-width:380px){.tapd-momentum-grid{grid-template-columns:1fr}.tapd-momentum-stat{min-height:62px}.tapd-momentum-value{font-size:22px}}
</style>`;

const script = String.raw`
<script id="tapdRelationshipMomentumKpis">
(function(){
  if(window.__tapdRelationshipMomentumKpis)return;
  window.__tapdRelationshipMomentumKpis=true;

  var OPPORTUNITY_WORDS=['lead','opportunity','collaboration','partner','partnership','referral','intro','investor','funding','sponsor','speaking','media','pilot','demo','proposal','client','customer','sale','deal','strategic'];
  function safeParse(value,fallback){try{return JSON.parse(value)}catch(e){return fallback}}
  function asArray(value){return Array.isArray(value)?value:[];}
  function allStorageItems(){
    var out=[];
    try{
      for(var i=0;i<localStorage.length;i++){
        var key=localStorage.key(i);
        var raw=localStorage.getItem(key);
        var parsed=safeParse(raw,null);
        out.push({key:key,raw:raw,parsed:parsed});
      }
    }catch(e){}
    return out;
  }
  function looksLikeCapture(item){
    var key=(item.key||'').toLowerCase();
    var raw=(item.raw||'').toLowerCase();
    if(key.indexOf('capture')>=0||key.indexOf('conversation')>=0||key.indexOf('relationship')>=0||key.indexOf('follow')>=0)return true;
    if(raw.indexOf('conversation')>=0||raw.indexOf('follow-up')>=0||raw.indexOf('next step')>=0||raw.indexOf('whatsapp')>=0)return true;
    return false;
  }
  function flattenRecords(){
    var records=[];
    allStorageItems().forEach(function(item){
      var p=item.parsed;
      if(Array.isArray(p)){
        p.forEach(function(x){if(x&&typeof x==='object')records.push({key:item.key,data:x,raw:JSON.stringify(x)});});
      }else if(p&&typeof p==='object'){
        Object.keys(p).forEach(function(k){
          var v=p[k];
          if(v&&typeof v==='object')records.push({key:item.key+'.'+k,data:v,raw:JSON.stringify(v)});
        });
        records.push({key:item.key,data:p,raw:item.raw||''});
      }else if(looksLikeCapture(item)){
        records.push({key:item.key,data:{},raw:item.raw||''});
      }
    });
    var seen={};
    return records.filter(function(r){
      var id=(r.data&&(r.data.id||r.data.createdAt||r.data.timestamp||r.data.name||r.data.contactName))||r.key+':' + (r.raw||'').slice(0,60);
      if(seen[id])return false;
      seen[id]=true;
      return true;
    });
  }
  function textOf(record){
    try{return ((record.key||'')+' '+(record.raw||'')+' '+JSON.stringify(record.data||{})).toLowerCase();}catch(e){return ((record.key||'')+' '+(record.raw||'')).toLowerCase();}
  }
  function isSent(record){
    var t=textOf(record);
    return t.indexOf('sent')>=0||t.indexOf('follow-up sent')>=0||t.indexOf('followup sent')>=0||t.indexOf('status":"sent')>=0||t.indexOf('status:sent')>=0;
  }
  function isOpportunity(record){
    var t=textOf(record);
    for(var i=0;i<OPPORTUNITY_WORDS.length;i++){if(t.indexOf(OPPORTUNITY_WORDS[i])>=0)return true;}
    return false;
  }
  function calculate(){
    var records=flattenRecords().filter(function(r){return looksLikeCapture({key:r.key,raw:r.raw})||isSent(r)||isOpportunity(r);});
    var captured=records.filter(function(r){return !isSent(r)||textOf(r).indexOf('capture')>=0||textOf(r).indexOf('conversation')>=0;}).length;
    var sent=records.filter(isSent).length;
    var opportunities=records.filter(isOpportunity).length;
    return {captured:captured,sent:sent,opportunities:opportunities};
  }
  function buildCard(){
    var metrics=calculate();
    var card=document.createElement('div');
    card.id='tapdRelationshipMomentumCard';
    card.className='tapd-momentum-card';
    card.innerHTML=''
      +'<div class="tapd-momentum-head">'
      +'<div><p class="tapd-momentum-kicker">Relationship Signals</p><h3 class="tapd-momentum-title">Networking Momentum</h3><p class="tapd-momentum-sub">Measured from captured conversations, sent follow-ups, and opportunity tags detected in TAPD.</p></div>'
      +'</div>'
      +'<div class="tapd-momentum-grid">'
      +'<div class="tapd-momentum-stat"><div class="tapd-momentum-value">'+metrics.captured+'</div><div class="tapd-momentum-label">Conversations Captured</div></div>'
      +'<div class="tapd-momentum-stat"><div class="tapd-momentum-value">'+metrics.sent+'</div><div class="tapd-momentum-label">Follow-Ups Sent</div></div>'
      +'<div class="tapd-momentum-stat opportunity"><div class="tapd-momentum-value">'+metrics.opportunities+'</div><div class="tapd-momentum-label">Opportunities Detected</div></div>'
      +'</div>'
      +'<p class="tapd-momentum-note">If a number is zero, it simply means TAPD has not captured that signal yet.</p>';
    return card;
  }
  function findRelationshipHubContainer(){
    var preferred=document.getElementById('page-relhub-56')||document.getElementById('relationshipHub')||document.getElementById('relHub');
    if(preferred)return preferred;
    var candidates=[].slice.call(document.querySelectorAll('.page,[id*="rel" i],[id*="relationship" i],[class*="rel" i],[class*="relationship" i]'));
    for(var i=0;i<candidates.length;i++){
      var text=(candidates[i].textContent||'').toLowerCase();
      if(text.indexOf('relationship')>=0||text.indexOf('follow-up')>=0||text.indexOf('connections')>=0)return candidates[i];
    }
    return null;
  }
  function injectMomentum(){
    var hub=findRelationshipHubContainer();
    if(!hub)return;
    var old=document.getElementById('tapdRelationshipMomentumCard');
    if(old)old.remove();
    var card=buildCard();
    var body=document.getElementById('rh56Body')||hub.querySelector('.rh56-body,.modal-body,.page-body,.body,.content')||hub;
    body.insertBefore(card,body.firstChild);
  }
  function boot(){
    injectMomentum();
    setTimeout(injectMomentum,150);
    setTimeout(injectMomentum,600);
    var original=window.rh56Open;
    if(typeof original==='function'&&!window.__tapdMomentumWrappedRhOpen){
      window.__tapdMomentumWrappedRhOpen=true;
      window.rh56Open=function(){var result=original.apply(window,arguments);setTimeout(injectMomentum,80);setTimeout(injectMomentum,300);return result;};
    }
    var originalRender=window.rh56Render;
    if(typeof originalRender==='function'&&!window.__tapdMomentumWrappedRhRender){
      window.__tapdMomentumWrappedRhRender=true;
      window.rh56Render=function(){var result=originalRender.apply(window,arguments);setTimeout(injectMomentum,80);return result;};
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
</script>`;

if (html.includes('</head>')) html = html.replace(/<\/head>/i, style+'\n</head>');
else html = style+'\n'+html;

if (html.includes('</body>')) html = html.replace(/<\/body>(?![\s\S]*<\/body>)/i, script+'\n</body>');
else html += '\n'+script+'\n';

if (html !== before) {
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[TAPD build] Added Relationship Hub networking momentum KPIs.');
} else {
  console.log('[TAPD build] Relationship momentum KPIs already present.');
}
