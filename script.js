const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let screen=0, musicOn=false, audioCtx=null, melodyTimer=null;
const screens=$$(".screen"), opened=new Set(), viewedPhotos=new Set();
const reasonSeen=new Set(), clues=new Set();
const visitStarted=Date.now();
setInterval(()=>{const el=$('#visitTime');if(el){const s=Math.floor((Date.now()-visitStarted)/1000);el.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}},1000);
function go(n){if(n>=screens.length)return;screens.forEach((s,i)=>s.classList.toggle('active',i===n));screen=n;$('#progressBar').style.width=`${(n/(screens.length-1))*100}%`;window.scrollTo({top:0,behavior:'smooth'});sparkleBurst(10)}
function startMusic(){
  if(musicOn){ if(audioCtx?.state==='suspended') audioCtx.resume(); return; }
  musicOn=true; $('#musicPill').classList.add('playing'); $('#musicLabel').textContent='soundtrack on · soft';
  audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();
  audioCtx.resume();
  const master=audioCtx.createGain(); master.gain.value=.065; master.connect(audioCtx.destination);
  const notes=[261.63,329.63,392,329.63,293.66,349.23,440,349.23,261.63,329.63,392,493.88];
  let i=0;
  const tick=()=>{
    if(!musicOn)return;
    const now=audioCtx.currentTime;
    const o=audioCtx.createOscillator(), g=audioCtx.createGain();
    o.type='sine'; o.frequency.value=notes[i++%notes.length];
    g.gain.setValueAtTime(.0001,now); g.gain.exponentialRampToValueAtTime(.010,now+.05); g.gain.exponentialRampToValueAtTime(.0001,now+.72);
    o.connect(g).connect(master); o.start(now); o.stop(now+.76);
    melodyTimer=setTimeout(tick,820);
  }; tick();
}
function toggleMusic(){
  if(!musicOn){startMusic();return}
  musicOn=false; $('#musicPill').classList.remove('playing'); $('#musicLabel').textContent='tap for soft soundtrack'; clearTimeout(melodyTimer); audioCtx?.suspend();
}
$('#musicBtn').addEventListener('click',e=>{e.stopPropagation();toggleMusic()});document.addEventListener('click',()=>{if(!musicOn)startMusic()},{once:true});
$$('[data-next]').forEach(b=>b.addEventListener('click',()=>go(screen+1)));
$('#unlockBtn').addEventListener('click',unlock);$('#secretInput').addEventListener('keydown',e=>{if(e.key==='Enter')unlock()});$('#skipUnlock').addEventListener('click',()=>{$('#unlockMsg').textContent='Fine. I’ll let you in. Security has been emotionally compromised. 😂';setTimeout(()=>go(2),600)});
function unlock(){const v=$('#secretInput').value.trim().toLowerCase();if(['beautiful','pretty','love','cutie','adu','pakhi'].includes(v)){$('#lockIcon').textContent='🔓';$('#unlockMsg').textContent='Access granted. Cuteness confirmed. 💗';sparkleBurst(18);setTimeout(()=>go(2),700)}else{$('#unlockMsg').textContent='Incorrect. Try a word you would use for yourself. 👀';$('.lock-card').classList.remove('shake');void $('.lock-card').offsetWidth;$('.lock-card').classList.add('shake')}}
$('#blowBtn').addEventListener('click',()=>{$('#cake').classList.add('blown');$('#wishMsg').textContent='Wish sent to the universe. Delivery: hopefully immediate. ✨';sparkleBurst(28);setTimeout(()=>go(3),1400)});
$$('[data-open]').forEach(b=>b.addEventListener('click',()=>openChapter(b.dataset.open)));
const map={letter:'tpl-letter',chaos:'tpl-chaos',reasons:'tpl-reasons',memories:'tpl-memories',timeline:'tpl-timeline',investigation:'tpl-investigation',quiz:'tpl-quiz',finale:'tpl-finale'};
const chapterMeta={
  letter:['01','THE SOFT PART'],
  chaos:['02','CLASSIFIED NONSENSE'],
  reasons:['03','THE LOVE ARCHIVE'],
  memories:['04','OUR LITTLE MUSEUM'],
  timeline:['05','HOW WE GOT HERE'],
  investigation:['06','RELATIONSHIP INVESTIGATION'],
  quiz:['07','FAKE SCIENCE'],
  finale:['08','THE LAST TRANSMISSION']
};
function openChapter(name){
  opened.add(name);
  updateDone();
  if(name==='finale'){
    go(5);
    setTimeout(typeFinal,120);
    return;
  }
  showTemplate(map[name],name);
  go(4);
}
function showTemplate(id,name){
  const host=$('#chapterContent');
  host.innerHTML='';
  host.appendChild(document.getElementById(id).content.cloneNode(true));
  const meta=chapterMeta[name]||['',''];
  $('#chapterPageNumber').textContent=`CHAPTER ${meta[0]} / 08`;
  $('#chapterPageName').textContent=meta[1];
  document.body.style.overflow='';
  host.parentElement.dataset.chapter=name;
  bindDynamic(id);
}
function bindDynamic(id){
  $$('.mini-next').forEach(b=>b.addEventListener('click',()=>{if(b.disabled)return;const n=b.dataset.modalNext;openChapter(n)}));
  if(id==='tpl-reasons')bindReasons();
  if(id==='tpl-memories')bindPhotoMuseum();
  if(id==='tpl-investigation')bindInvestigation();
  if(id==='tpl-quiz')bindQuiz();
}
function bindReasons(){const data=[
['THE SMILE FILE','Your beautiful smile. The kind that makes Hossen forget what he was saying.','03.webp'],
['THE KITCHEN FILE','Your cooking. Evidence that you can feed me and emotionally destroy my standards for normal food at the same time.','02.webp'],
['THE HAIR FILE','The smell of your hair. Yes, this is oddly specific. No, I will not be taking questions.','08.webp'],
['THE FACE FILE','Your funny faces. Honestly, your facial expressions deserve their own documentary.','01.webp'],
['THE ANGER FILE','Your anger. It annoys me. I secretly love it. This is a terrible design flaw in my personality.','06.webp'],
['THE CARE FILE','The way you care. Quiet things, little things, the things that make a person feel looked after.','10.webp'],
['THE TIME FILE','The time you give me. Out of everything busy life can steal, I notice the time you choose to give me.','04.webp'],
['THE BONK FILE','The way you beat me. Before anyone calls the authorities: this is filed under PLAYFUL COUPLE NONSENSE. 😂','05.webp'],
['THE THREAT FILE','Your threats. Again: the unserious, ridiculous kind. The relationship has apparently installed its own comedy department.','09.webp'],
['THE PEACE FILE','The way you handle my anger. Somehow you can deal with Hossen when even Hossen.exe is overheating.','07.webp']];
  const grid=$('#reasonGrid'), title=$('#reasonTitle'),body=$('#reasonBody'),count=$('#reasonCount'),status=$('#reasonStatus'),next=$('#reasonsNext');
  $$('.reason-file').forEach(btn=>btn.addEventListener('click',()=>{const i=+btn.dataset.reason;reasonSeen.add(i);btn.classList.add('opened');btn.querySelector('span').textContent='OPENED';title.textContent=data[i][0];body.textContent=data[i][1];$('#reasonPhoto').src='assets/photos/'+data[i][2];count.textContent=reasonSeen.size;status.textContent=reasonSeen.size===10?'archive complete — suspiciously romantic 💗':'keep going, detective Adu 👀';if(reasonSeen.size===10){next.disabled=false;$('#handSecret')?.classList.add('unlocked');sparkleBurst(24)}else next.disabled=true}));
  $('#holdHandBtn')?.addEventListener('click',()=>{const r=$('#handResponse');r.classList.add('show');$('#holdHandBtn').textContent='Still holding ♡';sparkleBurst(30);document.querySelector('.hand-secret')?.classList.add('held')});
}
function bindPhotoMuseum(){$$('.photo-open').forEach(btn=>btn.addEventListener('click',()=>{const box=$('#photoLightbox');if(!box)return;$('#lightboxImg').src='assets/photos/'+btn.dataset.photo;$('#lightboxCaption').textContent=btn.dataset.caption;box.classList.add('show');box.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';viewedPhotos.add(btn.dataset.photo);$('#galleryCount').textContent=viewedPhotos.size;$('#galleryStatus').textContent=viewedPhotos.size===10?'all 10 frames inspected — excellent taste 💗':'the curator is watching 👀';sparkleBurst(8)}))}
function closePhotoLightbox(){const box=$('#photoLightbox');if(!box)return;box.classList.remove('show');box.setAttribute('aria-hidden','true');document.body.style.overflow='';setTimeout(()=>$('#lightboxImg').src='',220)}
document.addEventListener('click',e=>{if(e.target.closest('.photo-lightbox-backdrop')||e.target.closest('#lightboxClose'))closePhotoLightbox()});
function bindInvestigation(){const answers={1:'Hossen. The evil creepy laugh is officially his fault. 😂',2:'Adu’s anger. Somehow annoying + secretly loved = catastrophic boyfriend logic.',3:'24 January 2026. Case file confirmed.'};$$('.clue').forEach(b=>b.addEventListener('click',()=>{const n=+b.dataset.clue;clues.add(n);b.classList.add('found');$('#caseResult').textContent=answers[n];$('#solveCase').disabled=clues.size<3;if(clues.size===3){$('#caseResult').textContent='All clues collected. Detective Adu has enough evidence to convict Hossen of being hopelessly in love. 💗';sparkleBurst(18)}}));$('#solveCase').addEventListener('click',()=>{opened.add('investigation');updateDone();$('#solveCase').textContent='CASE SOLVED ✓';setTimeout(()=>openChapter('quiz'),500)})}
function bindQuiz(){const qs=[['Who is more dramatic?',['Adu 😇','Hossen 😌','Both. Obviously.'],2],['Who has the evil creepy laugh?',['Adu','Hossen','The neighbours'],1],['What happened on 24 January 2026?',['A random Tuesday','The relationship became official','A software update'],1],['What does Hossen secretly love even when it annoys him?',['Adu’s anger','His own jokes','Traffic'],0],['Where is a favourite date memory?',['Ramna','The moon','The kitchen sink'],0],['What is the official birthday today?',['12 September','24 January','Sometime in winter'],0],['Who is Hossen trying to marry as soon as possible?',['Adu','His Wi-Fi router','Nobody, this is a trap'],0]];let i=0,score=0;const q=$('#quizQuestion'),ans=$('#quizAnswers'),res=$('#quizResult'),prog=$('#quizProgress'),scoreEl=$('#quizScore');function render(){const x=qs[i];prog.textContent=`QUESTION ${i+1} / ${qs.length}`;scoreEl.textContent=`score: ${score}`;q.innerHTML=`<b>${i+1}.</b> ${x[0]}`;ans.innerHTML=x[1].map((a,j)=>`<button data-q="${j}">${a}</button>`).join('');res.textContent='';$$('#quizAnswers button').forEach(b=>b.addEventListener('click',()=>{const ok=+b.dataset.q===x[2];if(ok){score++;res.textContent='Correct. The fake science is thriving. 💘'}else res.textContent='Incorrect. Hossen’s lawyers have been notified. 😂';scoreEl.textContent=`score: ${score}`;$$('#quizAnswers button').forEach(z=>z.disabled=true);setTimeout(()=>{i++;if(i<qs.length)render();else{res.innerHTML=`<b>FINAL RESULT: ${score}/7</b><br>Compatibility: ${score>=5?'dangerously high.': 'still high because the website is biased.'}<br><button class="primary quiz-next" id="quizNext">Open the final transmission →</button>`;opened.add('quiz');updateDone();$('#quizNext').addEventListener('click',()=>openChapter('finale'));}},700)}))}render()}
$('#backMenu').addEventListener('click',()=>go(3));
$('#finalBack').addEventListener('click',()=>go(3));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closePhotoLightbox();if(screen===4||screen===5)go(3)}});
function updateDone(){$('#doneCount').textContent=opened.size;$('#statusText').textContent=opened.size===8?'everything unlocked — you actually did it':'keep exploring — Hossen hid more stuff'}
const finalText='Happy birthday, Adu. From childhood friends in 2012 to us in 2026, somehow you became one of my favourite parts of life. I hope 24 is gentle with you, exciting for you, and full of little moments that make you stop and smile. I promise to marry you as soon as possible, never leave you, and never hurt you. And if you ever forget how loved you are… come back to this little website. I’ll leave the light on.';
function typeFinal(){let i=0;const el=$('#finalType');el.textContent='';const t=setInterval(()=>{el.textContent=finalText.slice(0,++i);if(i>=finalText.length)clearInterval(t)},18)}new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&e.target.id==='s4')typeFinal()}),{threshold:.4}).observe($('#s4'));
function clickSound(freq=520){
  try{const c=audioCtx||new(window.AudioContext||window.webkitAudioContext)(); const o=c.createOscillator(),g=c.createGain(); o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.007,c.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.09);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+.1)}catch(e){}
}
document.addEventListener('click',e=>{if(e.target.closest('button')) clickSound(480+Math.random()*140)},{capture:true});
function sparkleBurst(count=14){const sy=['✦','♡','♥','✧','·'];for(let i=0;i<count;i++){const s=document.createElement('span');s.className='spark';s.textContent=sy[Math.floor(Math.random()*sy.length)];s.style.left=(45+Math.random()*10)+'vw';s.style.top=(45+Math.random()*10)+'vh';s.style.color=Math.random()>.5?'#ff6fa7':'#ffd4e4';s.style.setProperty('--x',(Math.random()*260-130)+'px');s.style.setProperty('--y',(Math.random()*-260-40)+'px');s.style.fontSize=(10+Math.random()*18)+'px';document.body.appendChild(s);setTimeout(()=>s.remove(),1000)}}
document.addEventListener('pointermove',e=>{const h=$('#cursorHeart');if(innerWidth>700){h.style.left=e.clientX+'px';h.style.top=e.clientY+'px';h.style.opacity='.6'}});
