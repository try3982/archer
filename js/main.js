// ══════════════════════════════════════════
//  LOOP & FLOW
// ══════════════════════════════════════════
let G=null,raf=null,mx=0,my=0;
let bestSc=+(localStorage.getItem('ak_best2')||0);
let isPaused=false;

function pauseGame(){
  if(!G||G.mode!=='playing')return;
  isPaused=true;
  cancelAnimationFrame(raf);
  pauseGameBgm();
  document.getElementById('sPause').classList.remove('off');
  updatePauseMuteBtn();
}
function resumeGame(){
  if(!isPaused)return;
  isPaused=false;
  document.getElementById('sPause').classList.add('off');
  resumeGameBgm();
  loop();
}
function updatePauseMuteBtn(){
  document.getElementById('btnPauseMute').textContent=isMuted?'🔇 소리 꺼짐':'🔊 소리 켜짐';
}

document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
document.addEventListener('keydown',e=>{
  if(e.code==='Escape'){
    e.preventDefault();
    if(G&&G.mode==='playing'){isPaused?resumeGame():pauseGame();}
    return;
  }
  if(e.code==='Space'&&G&&G.mode==='playing'&&!isPaused){
    e.preventDefault();
    if(G.dashCd<=0&&!G.isDashing){G.isDashing=true;G.dashTimer=29;G.dashCd=300;playDashSound();}
  }
});

document.getElementById('btnPauseMute').onclick=()=>{
  isMuted=!isMuted;
  titleBgm.muted=isMuted;
  gameBgm.muted=isMuted;
  document.getElementById('btnMute').textContent=isMuted?'🔇':'🔊';
  updatePauseMuteBtn();
};

function loop(){
  if(!G||G.mode!=='playing')return;
  update(G);drawAll(G);
  raf=requestAnimationFrame(loop);
}

function startGame(){
  document.removeEventListener('click',tryTitleBgm);
  document.removeEventListener('keydown',tryTitleBgm);
  document.removeEventListener('mousemove',tryTitleBgm);
  titleBgm.pause();titleBgm.currentTime=0;
  document.getElementById('sTitle').classList.add('off');
  document.getElementById('sOver').classList.add('off');
  G=mkState();mx=W/2;my=H/2;
  G.wx=WORLD_W/2;G.wy=WORLD_H/2;
  G.camX=WORLD_W/2-W/2;G.camY=WORLD_H/2-H/2;
  updateHpHud(G);updateItemBar(G);
  document.getElementById('xpf').style.width='0%';
  document.getElementById('xpl').textContent='Lv.1  ·  0 / 80 XP';
  document.getElementById('hudSc').textContent='⭐ 0';
  document.getElementById('hudWv').textContent='00:00';
  // initial weather badge
  const w=WEATHER_TYPES[0];
  const badge=document.getElementById('weatherbadge');
  badge.textContent=w.icon+' '+w.label;badge.style.opacity='1';
  setTimeout(()=>badge.style.opacity='0',2500);
  if(raf)cancelAnimationFrame(raf);
  startGameBgm();
  loop();
}

function endGame(g){
  g.mode='gameover';cancelAnimationFrame(raf);
  stopGameBgm();
  if(g.score>bestSc){bestSc=g.score;localStorage.setItem('ak_best2',bestSc);}
  const mm=String(Math.floor(g.elapsed/60)).padStart(2,'0');
  const ss=String(g.elapsed%60).padStart(2,'0');
  document.getElementById('goW').textContent=mm+':'+ss;
  document.getElementById('goSc').textContent=g.score;
  document.getElementById('goBst').textContent='🏆 최고 기록: '+bestSc;
  document.getElementById('goKills').textContent=g.kills+'마리';
  document.getElementById('goCombo').textContent=g.bestCombo+'콤보';
  document.getElementById('goLv').textContent='Lv.'+g.lv;
  const usage=g.itemUsage||{};
  const topItem=Object.keys(usage).sort((a,b)=>usage[b]-usage[a])[0];
  document.getElementById('goItem').textContent=topItem?ITEM_DEFS[topItem].icon+' '+ITEM_DEFS[topItem].label:'없음';
  document.getElementById('sOver').classList.remove('off');
}

document.getElementById('btnS').onclick=startGame;
document.getElementById('btnR').onclick=startGame;
document.getElementById('btnPauseHome').onclick=()=>{
  isPaused=false;
  cancelAnimationFrame(raf);
  stopGameBgm();
  G=null;
  document.getElementById('sPause').classList.add('off');
  document.getElementById('sTitle').classList.remove('off');
  tryTitleBgm();
};
