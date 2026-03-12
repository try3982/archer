// ══════════════════════════════════════════
//  INIT STATE
// ══════════════════════════════════════════
function mkState(){
  const tCols=Math.ceil(WORLD_W/TILE)+2,tRows=Math.ceil(WORLD_H/TILE)+2;
  const tileMap=[];
  for(let r=0;r<tRows;r++){
    tileMap[r]=[];
    for(let c=0;c<tCols;c++){
      tileMap[r][c]={col:BIOME};
    }
  }
  const decos=[];
  for(let i=0;i<280;i++){
    decos.push({
      wx:200+Math.random()*(WORLD_W-400),wy:200+Math.random()*(WORLD_H-400),
      type:['deadTree','rock','mushroom','bone','crystal'][Math.floor(Math.random()*5)],
      sz:.65+Math.random()*.7,seed:Math.random()*100,
    });
  }
  // 우주 배경: 별 3레이어 (속도 다름) + 성운 + 행성
  const stars=[];
  // layer 0: 먼 별 (작고 느림, 패럴랙스 0.05)
  for(let i=0;i<220;i++) stars.push({
    wx:Math.random()*WORLD_W,wy:Math.random()*WORLD_H,
    r:.3+Math.random()*.7, a:.4+Math.random()*.5, da:(Math.random()-.5)*.006,
    layer:0, col:['#ffffff','#ccd6f6','#ffd6e7','#d6e8ff'][Math.floor(Math.random()*4)],
  });
  // layer 1: 중간 별 (패럴랙스 0.25)
  for(let i=0;i<80;i++) stars.push({
    wx:Math.random()*WORLD_W,wy:Math.random()*WORLD_H,
    r:.6+Math.random()*1.2, a:.5+Math.random()*.4, da:(Math.random()-.5)*.008,
    layer:1, col:['#ffffff','#a5f3fc','#f9a8d4','#fde68a'][Math.floor(Math.random()*4)],
  });
  // layer 2: 가까운 큰 별/빛망울 (패럴랙스 0.5)
  for(let i=0;i<25;i++) stars.push({
    wx:Math.random()*WORLD_W,wy:Math.random()*WORLD_H,
    r:1.2+Math.random()*2.2, a:.6+Math.random()*.4, da:(Math.random()-.5)*.012,
    layer:2, col:['#ffffff','#bfdbfe','#fbcfe8'][Math.floor(Math.random()*3)],
  });
  // 성운 (nebula): 큰 반투명 블러 원
  const nebulae=[];
  for(let i=0;i<8;i++) nebulae.push({
    wx:Math.random()*WORLD_W, wy:Math.random()*WORLD_H,
    r:180+Math.random()*320,
    col:['#1e1b4b','#14532d','#450a0a','#0c4a6e','#3b0764','#1a1f2e'][Math.floor(Math.random()*6)],
    a:.18+Math.random()*.18,
  });
  // 행성 2~3개
  const planets=[];
  const pCols=[['#7c3aed','#4c1d95'],['#0e7490','#164e63'],['#9d174d','#500724'],['#92400e','#451a03']];
  for(let i=0;i<3;i++){
    const pc=pCols[Math.floor(Math.random()*pCols.length)];
    planets.push({
      wx:300+Math.random()*(WORLD_W-600), wy:300+Math.random()*(WORLD_H-600),
      r:40+Math.random()*70, col:pc[0], col2:pc[1],
      ring:Math.random()>.5,
      a:Math.random()*Math.PI*2,
    });
  }
  // weather particles pool
  const wParticles=Array.from({length:300},()=>mkWParticle());

  return{
    mode:'playing',score:0,frame:0,
    elapsed:0,         // 생존 초
    difficulty:3,      // 시작부터 웨이브3 수준
    camX:WORLD_W/2-W/2,camY:WORLD_H/2-H/2,
    wx:WORLD_W/2,wy:WORLD_H/2,pface:0,
    php:100,maxHp:100,piframe:0,
    lv:1,xp:0,xpNext:80,
    shootCd:0,shootRate:20,
    lvAtk:1,lvSpd:1,  // 레벨 기반 공격력/이속 배율
    shieldHp:0,  // 보호막 현재 내구도
    dashCd:0,     // 대시 쿨다운 (프레임, 15초=900f)
    dashTimer:0,  // 대시 지속 프레임
    isDashing:false,
    // character animation
    runCycle:0,isMoving:false,moveDir:0,
    shootAnim:0,dustTimer:0,
    hairBob:0,hairVel:0,
    // active items
    activeItems:[],
    arrows:[],monsters:[],worldItems:[],
    particles:[],popups:[],
    spawnTimer:0,spawnCount:0,
    itemSpawnTimer:0,
    // weather
    weatherIdx:0,weatherTimer:0,weatherTransition:0,
    nextWeatherIdx:1,
    wParticles,
    lightningTimer:0,lightningAlpha:0,
    // world
    tileMap,decos,stars,nebulae,planets,
    cursorPulse:0,dist:0,
  };
}

function mkWParticle(){
  return{
    x:Math.random()*5000,y:Math.random()*1000,
    vx:(Math.random()-.5)*1.5,vy:0,
    size:0,type:'none',life:Math.random(),
  };
}

function resetWParticle(p,type,wind){
  p.x=Math.random()*W;
  p.y=-10;
  p.type=type;
  if(type==='rain'){p.size=1.2+Math.random()*.8;p.vx=wind+(-1+Math.random()*2);p.vy=12+Math.random()*6;}
  else if(type==='snow'){p.size=2+Math.random()*3;p.vx=wind+(-0.5+Math.random());p.vy=1.2+Math.random()*1.5;}
  else if(type==='hail'){p.size=2.5+Math.random()*2.5;p.vx=wind+(-2+Math.random()*4);p.vy=9+Math.random()*5;}
  p.life=1;
}
