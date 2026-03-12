// ══════════════════════════════════════════
//  AUDIO
// ══════════════════════════════════════════
const titleBgm=document.getElementById('titleBgm');
const TITLE_BGM_MAX=0.3;
titleBgm.volume=0;

function fadeInTitleBgm(){
  titleBgm.volume=0;
  const iv=setInterval(()=>{
    if(titleBgm.volume>=TITLE_BGM_MAX){titleBgm.volume=TITLE_BGM_MAX;clearInterval(iv);return;}
    titleBgm.volume=Math.min(TITLE_BGM_MAX,titleBgm.volume+0.01);
  },100);
}

function tryTitleBgm(){
  titleBgm.play().then(()=>{
    document.removeEventListener('click',tryTitleBgm);
    document.removeEventListener('keydown',tryTitleBgm);
    document.removeEventListener('mousemove',tryTitleBgm);
    fadeInTitleBgm();
  }).catch(()=>{});
}
titleBgm.play().then(()=>{
  fadeInTitleBgm();
}).catch(()=>{
  document.addEventListener('click',tryTitleBgm);
  document.addEventListener('keydown',tryTitleBgm);
  document.addEventListener('mousemove',tryTitleBgm);
});

// ── 공격 효과음 (겹쳐 재생되도록 풀 방식) ──
const FIRE_POOL_SIZE=6;
const firePool=Array.from({length:FIRE_POOL_SIZE},()=>{
  const a=new Audio('fire4.m4a');
  a.volume=0.07;
  return a;
});
let firePoolIdx=0;
function playFireSound(){
  if(isMuted)return;
  const snd=firePool[firePoolIdx];
  firePoolIdx=(firePoolIdx+1)%FIRE_POOL_SIZE;
  snd.currentTime=0;
  snd.play().catch(()=>{});
}

// ── 인게임 BGM ──
const gameBgm=new Audio('bgm.mp3');
gameBgm.loop=true;
gameBgm.volume=0.25;
function startGameBgm(){
  if(isMuted)return;
  gameBgm.currentTime=0;
  gameBgm.play().catch(()=>{});
}
function stopGameBgm(){
  gameBgm.pause();
  gameBgm.currentTime=0;
}
function pauseGameBgm(){gameBgm.pause();}
function resumeGameBgm(){if(!isMuted)gameBgm.play().catch(()=>{});}

// ── 몬스터 사망 효과음 ──
const dieSounds=[new Audio('die1.m4a'),new Audio('die2.m4a')];
dieSounds.forEach(a=>a.volume=0.5);
function playDieSound(){
  if(isMuted)return;
  const snd=dieSounds[Math.random()<.5?0:1];
  snd.currentTime=0;
  snd.play().catch(()=>{});
}

// ── 대시 효과음 ──
const dashSnd=new Audio('slie.mp3');
dashSnd.volume=1.0;
function playDashSound(){
  if(isMuted)return;
  dashSnd.currentTime=0;
  dashSnd.play().catch(()=>{});
}

// ── 아이템 획득 효과음 ──
const itemSnd=new Audio('item.wav');
itemSnd.volume=0.5;
function playItemSound(){
  if(isMuted)return;
  itemSnd.currentTime=0;
  itemSnd.play().catch(()=>{});
  setTimeout(()=>itemSnd.pause(),1000);
}

// ── 뮤트 버튼 ──
let isMuted=false;
const btnMute=document.getElementById('btnMute');
btnMute.onclick=()=>{
  isMuted=!isMuted;
  titleBgm.muted=isMuted;
  btnMute.textContent=isMuted?'🔇':'🔊';
};
