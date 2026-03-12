// ══════════════════════════════════════════
//  WORLD & WEATHER CONFIG
// ══════════════════════════════════════════
const WORLD_W=4000,WORLD_H=4000,TILE=80;
const CFG_PR=18;

// Dark biome palettes
const BIOME='#080810'; // 단색 다크 배경

// ── WEATHER SYSTEM ──
const WEATHER_TYPES=[
  {id:'clear',  label:'맑음',      icon:'🌑', bgTop:'#050508',bgBot:'#07070d', ambientAlpha:0},
  {id:'rain',   label:'폭우',      icon:'🌧', bgTop:'#04050a',bgBot:'#06080e', ambientAlpha:.10, ambientCol:'#0d1520'},
  {id:'snow',   label:'폭설',      icon:'❄️', bgTop:'#05060b',bgBot:'#07080e', ambientAlpha:.08, ambientCol:'#10121a'},
  {id:'hail',   label:'우박',      icon:'🌨', bgTop:'#050609',bgBot:'#06080c', ambientAlpha:.10, ambientCol:'#0a100e'},
  {id:'thunder',label:'뇌우',      icon:'⛈', bgTop:'#030305',bgBot:'#050508', ambientAlpha:.15, ambientCol:'#0a0820'},
  {id:'fog',    label:'짙은 안개', icon:'🌫', bgTop:'#060609',bgBot:'#08080d', ambientAlpha:.22, ambientCol:'#101018'},
];
const WEATHER_DUR=1800; // frames per weather phase

// ══════════════════════════════════════════
//  ITEM DEFS
// ══════════════════════════════════════════
const ITEM_DEFS={
  // ── 기존 투사체 변환 아이템 ──
  slow:{icon:'❄️',label:'슬로우',color:'#38bdf8',duration:900,
    type:'projectile',
    projectile:{draw(a){
      cx.save();cx.translate(a.wx,a.wy);cx.rotate(a.ang);
      const g=cx.createLinearGradient(-10,0,10,0);
      g.addColorStop(0,'#bfdbfe');g.addColorStop(.5,'#fff');g.addColorStop(1,'#93c5fd');
      cx.fillStyle=g;cx.beginPath();cx.moveTo(12,0);cx.lineTo(2,-5);cx.lineTo(-10,0);cx.lineTo(2,5);cx.closePath();cx.fill();
      cx.strokeStyle='rgba(147,197,253,.5)';cx.lineWidth=1;cx.stroke();
      cx.fillStyle='rgba(255,255,255,.6)';
      [[-4,-2],[-6,2],[4,-3]].forEach(([ox,oy])=>{cx.beginPath();cx.arc(ox,oy,1.2,0,Math.PI*2);cx.fill();});
      cx.restore();
    }}},
  multi:{icon:'🏹',label:'멀티샷',color:'#fbbf24',duration:750,
    type:'projectile',
    projectile:{draw(a){
      cx.save();cx.translate(a.wx,a.wy);cx.rotate(a.ang);
      cx.strokeStyle='#fbbf24';cx.lineWidth=2.5;cx.lineCap='round';
      cx.beginPath();cx.moveTo(-11,0);cx.lineTo(10,0);cx.stroke();
      cx.fillStyle='#f59e0b';cx.beginPath();cx.moveTo(13,0);cx.lineTo(7,-3);cx.lineTo(7,3);cx.closePath();cx.fill();
      cx.fillStyle='#fde68a';cx.beginPath();cx.moveTo(-11,0);cx.lineTo(-18,-4);cx.lineTo(-14,0);cx.lineTo(-18,4);cx.closePath();cx.fill();
      cx.globalAlpha=.3;cx.strokeStyle='#fde68a';cx.lineWidth=3;cx.beginPath();cx.moveTo(-13,0);cx.lineTo(-22,0);cx.stroke();
      cx.restore();
    }}},
  pierce:{icon:'⚡',label:'관통',color:'#a78bfa',duration:700,
    type:'projectile',
    projectile:{draw(a){
      cx.save();cx.translate(a.wx,a.wy);cx.rotate(a.ang);
      cx.shadowColor='#a78bfa';cx.shadowBlur=10;
      cx.strokeStyle='#e9d5ff';cx.lineWidth=3;cx.lineCap='round';
      cx.beginPath();cx.moveTo(-13,0);cx.lineTo(13,0);cx.stroke();
      cx.fillStyle='#c4b5fd';cx.beginPath();cx.moveTo(15,0);cx.lineTo(8,-3.5);cx.lineTo(8,3.5);cx.closePath();cx.fill();
      cx.strokeStyle='#f0abfc';cx.lineWidth=1.5;cx.beginPath();cx.moveTo(-4,-2);cx.lineTo(0,0);cx.lineTo(-4,2);cx.stroke();
      cx.restore();
    }}},
  explosive:{icon:'💥',label:'폭발',color:'#f97316',duration:600,
    type:'projectile',
    projectile:{draw(a){
      cx.save();cx.translate(a.wx,a.wy);cx.rotate(a.ang);
      const g=cx.createRadialGradient(-2,-2,1,0,0,8);
      g.addColorStop(0,'#fde68a');g.addColorStop(.5,'#f97316');g.addColorStop(1,'#7c2d12');
      cx.fillStyle=g;cx.beginPath();cx.arc(0,0,8,0,Math.PI*2);cx.fill();
      cx.strokeStyle='#fde68a';cx.lineWidth=1.5;
      [[10,0],[8,5],[8,-5]].forEach(([ox,oy])=>{cx.beginPath();cx.moveTo(7,oy*.4);cx.lineTo(ox,oy);cx.stroke();});
      cx.restore();
    }}},
  rapid:{icon:'🌀',label:'연사',color:'#34d399',duration:700,
    type:'projectile',
    projectile:{draw(a){
      cx.save();cx.translate(a.wx,a.wy);cx.rotate(a.ang);
      cx.shadowColor='#34d399';cx.shadowBlur=8;
      cx.strokeStyle='#6ee7b7';cx.lineWidth=2;cx.lineCap='round';
      cx.beginPath();cx.moveTo(-10,0);cx.lineTo(10,0);cx.stroke();
      cx.fillStyle='#34d399';cx.beginPath();cx.moveTo(12,0);cx.lineTo(6,-2.5);cx.lineTo(6,2.5);cx.closePath();cx.fill();
      cx.globalAlpha=.4;cx.strokeStyle='#a7f3d0';cx.lineWidth=2;cx.beginPath();cx.moveTo(-10,0);cx.lineTo(-20,0);cx.stroke();
      cx.restore();
    }}},
  // ── 신규: 캐릭터 버프 아이템 (투사체 변환 없음) ──
  speed:{
    icon:'💨',label:'이동 증가',color:'#67e8f9',duration:720,
    type:'buff',
    // 이속 +80% (update에서 hasItem 체크)
  },
  shield:{
    icon:'🛡',label:'보호막',color:'#e2e8f0',duration:600,
    type:'buff',
    // 피격 무효화 (shieldHp 3)
    shieldHp:3,
  },
  atkspeed:{
    icon:'⚔️',label:'공속 증가',color:'#fb7185',duration:660,
    type:'buff',
    // 공격속도 2배 (getShootRate에서 체크)
  },
  laser:{
    icon:'🔴',label:'레이저',color:'#ef4444',duration:180,
    type:'buff',
    // 3초간 전방위 레이저로 모든 몬스터 1방 사살
  },
};
const ITEM_KEYS=Object.keys(ITEM_DEFS);

// ══════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════
function hasItem(g,key){return g.activeItems.some(i=>i.key===key);}
function getShootRate(g){
  let r=g.shootRate;
  if(hasItem(g,'rapid'))r=Math.max(8,r/2);
  if(hasItem(g,'atkspeed'))r=Math.max(10,Math.floor(r/2));
  return r;
}
function lerp(a,b,t){return a+(b-a)*t;}

// 7종 몬스터 정의
const MONSTER_POOL={
  w1:['ghoul','ghoul','wraith'],
  w2:['ghoul','wraith','vampire','crawler'],
  w4:['vampire','crawler','revenant','wraith'],
  w7:['revenant','golem','crawler'],
  w10:['golem','lich'],
};

const MONSTER_DEF={
  ghoul:   {r:24,hp:1, spd:1.15,xp:10,col:'#4ade80',col2:'#166534'},
  wraith:  {r:22,hp:1, spd:1.9, xp:14,col:'#c084fc',col2:'#6b21a8'},
  vampire: {r:26,hp:1, spd:1.0, xp:22,col:'#f87171',col2:'#991b1b'},
  crawler: {r:22,hp:1, spd:2.2, xp:18,col:'#fb923c',col2:'#9a3412'},
  revenant:{r:28,hp:1, spd:.85, xp:36,col:'#22d3ee',col2:'#155e75'},
  golem:   {r:34,hp:2, spd:.6,  xp:60,col:'#cbd5e1',col2:'#475569'},
  lich:    {r:30,hp:2, spd:.7,  xp:80,col:'#e879f9',col2:'#86198f'},
  // 보스: 독침 뱉는 스피터 (10마리당 1마리)
  spitter: {r:28,hp:3, spd:.7,  xp:50,col:'#a3e635',col2:'#3f6212',
            ranged:true, shootRange:320, shootCd:0, shootInterval:110},
};
