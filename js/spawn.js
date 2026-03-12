// ══════════════════════════════════════════
//  SPAWNING
// ══════════════════════════════════════════
function edgeSpawnW(g){
  const pad=60,side=Math.random()*4|0;
  if(side===0)return{wx:g.camX-pad+Math.random()*W,wy:g.camY-pad};
  if(side===1)return{wx:g.camX+W+pad,wy:g.camY+Math.random()*H};
  if(side===2)return{wx:g.camX-pad+Math.random()*W,wy:g.camY+H+pad};
  return{wx:g.camX-pad,wy:g.camY+Math.random()*H};
}

// spitter 스폰: 8마리당 1마리 체크는 spawnMonster에서 처리
function pickMonsterType(elapsed){
  // elapsed(초) 기준으로 점점 강한 몬스터 등장
  // 시작부터 w2(다양한 몬스터), 시간에 따라 강해짐
  let pool=MONSTER_POOL.w2;
  if(elapsed>=180)pool=[...MONSTER_POOL.w7,...MONSTER_POOL.w10];  // 3분+
  else if(elapsed>=100)pool=MONSTER_POOL.w7;   // 1분40초
  else if(elapsed>=45) pool=MONSTER_POOL.w4;   // 45초
  return pool[Math.floor(Math.random()*pool.length)];
}

function spawnMonster(g){
  const{wx,wy}=edgeSpawnW(g);
  const el=g.elapsed;
  // 10마리당 1마리 보스(spitter)
  const useSpitter=(g.spawnCount%10===9);
  g.spawnCount=(g.spawnCount||0)+1;
  const type=useSpitter?'spitter':pickMonsterType(el);
  const def=MONSTER_DEF[type];
  const sM=Math.min(1.2+el*.003, 2.5);  // 속도 최대 2.5배
  const hp=useSpitter?3:Math.min(Math.ceil(def.hp*(1+el*.002)),2);
  const behaviors=['direct','direct','flank','predict'];
  const m={
    wx,wy,type,boss:false,
    r:def.r,hp,maxHp:hp,
    spd:def.spd*sM,slow:0,
    anim:Math.random()*100,wob:Math.random()*Math.PI*2,dead:false,
    behavior:behaviors[Math.floor(Math.random()*behaviors.length)],
    flankSign:Math.random()<.5?1:-1,
  };
  // 원거리 몬스터 전용 상태
  if(def.ranged){
    m.ranged=true;m.shootRange=def.shootRange;
    m.mShootCd=Math.floor(Math.random()*def.shootInterval); // 랜덤 초기 쿨다운
    m.mShootInterval=def.shootInterval;
  }
  g.monsters.push(m);
}

function spawnBoss(g,wx,wy){
  const hp=Math.ceil(12+g.elapsed*.08);
  g.monsters.push({
    wx,wy,type:'lich',boss:true,
    r:42,hp,maxHp:hp,spd:.5+g.elapsed*.001,slow:0,
    anim:0,wob:0,dead:false,
  });
  showBanner('☠️ LICH KING ☠️');
}

function spawnWorldItem(g){
  const ang=Math.random()*Math.PI*2,dist=200+Math.random()*400;
  const wx=g.wx+Math.cos(ang)*dist;
  const wy=g.wy+Math.sin(ang)*dist;
  const key=ITEM_KEYS[Math.random()*ITEM_KEYS.length|0];
  g.worldItems.push({wx,wy,key,r:22,bob:Math.random()*Math.PI*2,picked:false,age:0});
}
