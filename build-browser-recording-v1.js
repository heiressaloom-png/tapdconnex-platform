const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');

let html = fs.readFileSync(indexPath, 'utf8');
const before = html;

/* Remove older injected versions */
html = html.replace(/<style id="tapdBrowserRecordingV2Style">[\s\S]*?<\/style>/g, '');
html = html.replace(/<script id="tapdBrowserRecordingV2Script">[\s\S]*?<\/script>/g, '');
html = html.replace(/<style id="tapdBrowserRecordingV1Style">[\s\S]*?<\/style>/g, '');
html = html.replace(/<script id="tapdBrowserRecordingV1Script">[\s\S]*?<\/script>/g, '');

const style = `<style id="tapdBrowserRecordingV2Style">
#tapdRecOverlay{position:fixed;inset:0;z-index:10050;background:rgba(0,0,0,.76);display:none;align-items:flex-end;justify-content:center;font-family:Inter,system-ui,sans-serif;color:#F0F4F8}
#tapdRecOverlay.show{display:flex}
.tapd-rec-sheet{width:min(680px,100vw);background:#060809;border:1px solid rgba(234,179,8,.28);border-radius:26px 26px 0 0;box-shadow:0 -18px 60px rgba(0,0,0,.6);padding:18px}
.tapd-rec-head{display:flex;justify-content:space-between;gap:14px;margin-bottom:14px}
.tapd-rec-kicker{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#EAB308;font-weight:950;margin:0 0 5px}
.tapd-rec-title{font-size:20px;font-weight:950;margin:0}
.tapd-rec-sub{font-size:12px;color:#9AAABD;margin:7px 0 0;line-height:1.45}
.tapd-rec-close{width:34px;height:34px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#9AAABD;font-size:20px}
.tapd-rec-card{background:#0D1117;border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:15px;margin-bottom:12px}
.tapd-rec-row{display:flex;align-items:center;justify-content:space-between;gap:10px}
.tapd-rec-label{font-size:10px;letter-spacing:1.3px;text-transform:uppercase;color:#8B9EB0;font-weight:900}
.tapd-rec-template{font-size:13px;font-weight:900;color:#F0F4F8;text-align:right}
.tapd-rec-timer{font-size:34px;font-weight:950;letter-spacing:-1px;color:#EAB308;text-align:center;margin:10px 0}
.tapd-rec-status{display:flex;align-items:center;justify-content:center;gap:8px;color:#9AAABD;font-size:12px;font-weight:750}
.tapd-rec-dot{width:9px;height:9px;border-radius:999px;background:#EF4444;box-shadow:0 0 0 0 rgba(239,68,68,.55);animation:tapdRecPulse 1.2s infinite}
.tapd-rec-dot.paused{background:#EAB308}
.tapd-rec-dot.done{background:#10B981;animation:none}
@keyframes tapdRecPulse{70%{box-shadow:0 0 0 8px transparent}}
.tapd-rec-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
.tapd-rec-btn{height:48px;border-radius:15px;border:1px solid rgba(255,255,255,.12);background:#141C22;color:#F0F4F8;font-family:Inter,sans-serif;font-weight:900;cursor:pointer}
.tapd-rec-btn:disabled{opacity:.45;cursor:not-allowed}
.tapd-rec-btn.gold{background:linear-gradient(135deg,#FACC15,#EAB308 55%,#B87503);color:#050505;border-color:#EAB308}
.tapd-rec-btn.stop{border-color:rgba(239,68,68,.35);color:#FCA5A5}
.tapd-rec-audio{width:100%;margin-top:12px}
.tapd-rec-note{font-size:11px;color:#8B9EB0;line-height:1.45;margin:10px 0 0}
.tapd-rec-error{color:#FCA5A5;font-size:12px;line-height:1.45;margin-top:10px;display:none}
@media(max-width:420px){.tapd-rec-sheet{padding:16px}.tapd-rec-timer{font-size:30px}.tapd-rec-actions{grid-template-columns:1fr}.tapd-rec-btn{height:46px}}
</style>`;

const script = `<script id="tapdBrowserRecordingV2Script">
(function(){
 if(window.__tapdBrowserRecordingV2)return;
 window.__tapdBrowserRecordingV2=true;

 var recorder=null,stream=null,chunks=[],state='idle',elapsed=0,tick=null,limit=300,audioUrl=null,audioBlob=null;

 function qs(id){return document.getElementById(id)}
 function txt(el){return (el&&el.textContent?el.textContent:'').replace(/\\s+/g,' ').trim()}
 function selectedTemplate(){
   try{return localStorage.getItem('tapd_active_template_name')||localStorage.getItem('tapd_active_template')||'Selected template'}
   catch(e){return 'Selected template'}
 }
 function plan(){
   try{return (localStorage.getItem('tapd_plan_type')||localStorage.getItem('tapd_plan')||'starter').toLowerCase()}
   catch(e){return 'starter'}
 }
 function fmt(s){var m=Math.floor(s/60),r=s%60;return String(m).padStart(2,'0')+':'+String(r).padStart(2,'0')}

 function update(){
   var left=Math.max(0,limit-elapsed);
   qs('tapdRecTimer').textContent=fmt(left);
   qs('tapdRecPlan').textContent=plan()==='pro'?'Pro Extended Capture':'Starter Capture';
   qs('tapdRecTemplate').textContent=selectedTemplate();

   qs('tapdRecStatusText').textContent=
     state==='recording'?'Recording in progress':
     state==='paused'?'Recording paused':
     state==='done'?'Recording saved locally':
     state==='stopping'?'Saving recording':
     'Preparing recorder';

   var d=qs('tapdRecDot');
   d.className='tapd-rec-dot '+(state==='paused'?'paused':state==='done'?'done':'');

   qs('tapdPauseBtn').textContent=state==='paused'?'Resume':'Pause';
   qs('tapdPauseBtn').disabled=!(state==='recording'||state==='paused');
   qs('tapdStopBtn').disabled=!(state==='recording'||state==='paused');
   qs('tapdRecDone').textContent=state==='done'?'Continue':'Done';
 }

 function showError(m){
   var e=qs('tapdRecError');
   e.textContent=m;
   e.style.display='block';
 }

 function clearTimer(){
   if(tick){clearInterval(tick);tick=null}
 }

 function startTimer(){
   clearTimer();
   tick=setInterval(function(){
     if(state!=='recording')return;
     elapsed++;
     update();
     if(elapsed>=limit)stopRecording();
   },1000);
 }

 function stopStream(){
   if(stream){
     stream.getTracks().forEach(function(t){t.stop()});
     stream=null;
   }
 }

 function open(){
   if(!qs('tapdRecOverlay'))build();

   qs('tapdRecOverlay').classList.add('show');
   qs('tapdRecError').style.display='none';
   qs('tapdRecAudio').style.display='none';
   qs('tapdRecAudio').removeAttribute('src');

   limit=plan()==='pro'?600:300;
   elapsed=0;
   chunks=[];
   audioBlob=null;
   state='idle';

   update();
   startRecording();
 }

 async function startRecording(){
   try{
     if(!navigator.mediaDevices||!window.MediaRecorder){
       showError('This browser does not support recording yet. Please try Chrome or Safari on a supported phone.');
       return;
     }

     stream=await navigator.mediaDevices.getUserMedia({audio:true});
     recorder=new MediaRecorder(stream);

     recorder.ondataavailable=function(e){
       if(e.data&&e.data.size>0)chunks.push(e.data);
     };

     recorder.onstop=function(){
       state='done';
       clearTimer();
       stopStream();

       audioBlob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});

       if(audioUrl)URL.revokeObjectURL(audioUrl);
       audioUrl=URL.createObjectURL(audioBlob);

       var a=qs('tapdRecAudio');
       a.src=audioUrl;
       a.style.display='block';

       try{
         localStorage.setItem('tapd_last_capture_seconds',String(elapsed));
         localStorage.setItem('tapd_last_capture_template',selectedTemplate());
         localStorage.setItem('tapd_last_capture_status','recording_saved_locally');
       }catch(e){}

       update();
     };

     recorder.start();
     state='recording';
     update();
     startTimer();

   }catch(err){
     showError('We could not access the microphone. Please allow microphone permission and try again.');
   }
 }

 function pauseResume(){
   if(!recorder)return;

   if(state==='recording'){
     recorder.pause();
     state='paused';
     update();
     return;
   }

   if(state==='paused'){
     recorder.resume();
     state='recording';
     update();
     return;
   }
 }

 function stopRecording(){
   if(recorder&&(state==='recording'||state==='paused')){
     state='stopping';
     update();
     recorder.stop();
   }
 }

 function close(){
   if(state==='recording'||state==='paused')stopRecording();
   qs('tapdRecOverlay').classList.remove('show');
 }

 function build(){
   var o=document.createElement('div');
   o.id='tapdRecOverlay';
   o.innerHTML=
   '<div class="tapd-rec-sheet">'+
     '<div class="tapd-rec-head">'+
       '<div>'+
         '<p class="tapd-rec-kicker" id="tapdRecPlan">Starter Capture</p>'+
         '<h2 class="tapd-rec-title">Capture this moment</h2>'+
         '<p class="tapd-rec-sub">Recording starts with your selected template active. Stop any time; transcription comes in the next step.</p>'+
       '</div>'+
       '<button class="tapd-rec-close" id="tapdRecClose" type="button">×</button>'+
     '</div>'+
     '<div class="tapd-rec-card">'+
       '<div class="tapd-rec-row">'+
         '<span class="tapd-rec-label">Active template</span>'+
         '<span class="tapd-rec-template" id="tapdRecTemplate">Selected template</span>'+
       '</div>'+
       '<div class="tapd-rec-timer" id="tapdRecTimer">05:00</div>'+
       '<div class="tapd-rec-status"><span class="tapd-rec-dot" id="tapdRecDot"></span><span id="tapdRecStatusText">Preparing recorder</span></div>'+
       '<div class="tapd-rec-actions">'+
         '<button class="tapd-rec-btn" id="tapdPauseBtn" type="button">Pause</button>'+
         '<button class="tapd-rec-btn stop" id="tapdStopBtn" type="button">Stop</button>'+
       '</div>'+
       '<audio class="tapd-rec-audio" id="tapdRecAudio" controls style="display:none"></audio>'+
       '<p class="tapd-rec-note">Step 1: this proves browser recording, timer, pause/resume, and stop. Next step will upload audio for transcription.</p>'+
       '<p class="tapd-rec-error" id="tapdRecError"></p>'+
     '</div>'+
     '<button class="tapd-rec-btn gold" id="tapdRecDone" type="button">Done</button>'+
   '</div>';

   document.body.appendChild(o);

   qs('tapdPauseBtn').onclick=pauseResume;
   qs('tapdStopBtn').onclick=stopRecording;
   qs('tapdRecClose').onclick=close;
   qs('tapdRecDone').onclick=close;
 }

 document.addEventListener('click',function(e){
   var b=e.target&&e.target.closest?e.target.closest('button,a'):null;
   if(!b)return;

   var t=txt(b).toLowerCase();

   if(t.indexOf('capture this moment')>=0){
     e.preventDefault();
     e.stopPropagation();
     open();
   }
 },true);
})();
</script>`;

html = html.includes('</head>')
  ? html.replace(/<\/head>/i, style + '\\n</head>')
  : style + '\\n' + html;

html = html.includes('</body>')
  ? html.replace(/<\/body>(?![\\s\\S]*<\/body>)/i, script + '\\n</body>')
  : html + '\\n' + script;

if(html !== before){
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[TAPD build] Added browser recording workflow v2.');
}else{
  console.log('[TAPD build] Browser recording workflow already present.');
}
