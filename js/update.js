// ══════════════════════════════════════════
//  DOM CACHE — 매 프레임 getElementById 방지
// ══════════════════════════════════════════
const DOM={
  wb:null,hudWv:null,hudSc:null,
  dcFill:null,dcTxt:null,dashIcon:null,
  xpf:null,xpl:null,
};
function initDomCache(){
  DOM.wb=document.getElementById('wb');
  DOM.hudWv=document.getElementById('hudWv');
  DOM.hudSc=document.getElementById('hudSc');
  DOM.dcFill=document.getElementById('dashcdfill');
  DOM.dcTxt=document.getElementById('dashcdtxt');
  DOM.dashIcon=document.getElementById('dashicon');
  DOM.xpf=document.getElementById('xpf');
  DOM.xpl=document.getElementById('xpl');
}

// 레이저 방향 사전 계산 (매 프레임 cos/sin 재계산 방지)
const LASER_RAYS=16;
const LASER_COS=Array.from({length:LASER_RAYS},(_,i)=>Math.cos(i*(Math.PI*2/LASER_RAYS)));
const LASER_SIN=Array.from({length:LASER_RAYS},(_,i)=>Math.sin(i*(Math.PI*2/LASER_RAYS)));

// 상태 캐시 (변경 시에만 DOM 업데이트)
let _lastScore=-1, _lastDashState='', _lastDashCd=-1;

// ══════════════════════════════════════════
//  BANNER
// ══════════════════════════════════════════
let wbTimer=null;
function showBanner(txt){
  const el=DOM.wb||document.getElementById('wb');
  el.textContent=txt;el.classList.add('on');
  clearTimeout(wbTimer);wbTimer=setTimeout(()=>el.classList.remove('on'),2400);
}

// ══════════════════════════════════════════
//  UPDATE
// ══════════════════════════════════════════
function update(g){
  g.frame++;
  g.cursorPulse=(g.cursorPulse+.07)%(Math.PI*2);

  updateWeather(g);

  // camera lerp
  const tcx=g.wx-W/2,tcy=g.wy-H/2;
  g.camX+=(tcx-g.camX)*.1;g.camY+=(tcy-g.camY)*.1;
  // 무한 맵: 카메라 클램프 없음

  // move player
  const twx=mx+g.camX,twy=my+g.camY;
  const dx=twx-g.wx,dy=twy-g.wy,dl=Math.sqrt(dx*dx+dy*dy);
  const prevX=g.wx,prevY=g.wy;
  if(dl>8){
    const spdBonus=hasItem(g,'speed')?1.6:1;
    const dashMult=g.isDashing?3.0:1;
    const baseSpd=7.8*spdBonus*dashMult;
    const spd=Math.min(Math.min(baseSpd,g.isDashing?18:13.5)*(dl>120?1:.6),dl);
    g.wx+=dx/dl*spd;g.wy+=dy/dl*spd;
    // 무한 맵: 경계 없음
    const mdx=g.wx-prevX,mdy=g.wy-prevY;
    g.dist+=Math.sqrt(mdx*mdx+mdy*mdy);
    g.isMoving=true;
    g.moveDir=Math.atan2(mdy,mdx);
    g.runCycle=(g.runCycle+0.24)%(Math.PI*2);
    // 머리카락 출렁임: 이동방향 반대로 탄성 적용
    g.hairVel+=(Math.sin(g.runCycle)*4-g.hairBob)*0.18;
    g.hairVel*=0.72;
    g.hairBob+=g.hairVel;
    // foot dust
    g.dustTimer++;
    if(g.dustTimer>=12){
      g.dustTimer=0;
      const fa=g.moveDir+Math.PI;
      burst(g,g.wx+Math.cos(fa)*8,g.wy+Math.sin(fa)*8,'#5a4a30',3);
    }
  } else {
    g.isMoving=false;
    // 멈출 때 머리카락 서서히 복원
    g.hairVel*=0.85;
    g.hairBob*=0.88;
  }

  // face nearest monster
  let nearM=null,nearD=Infinity;
  for(const m of g.monsters){const d=(m.wx-g.wx)**2+(m.wy-g.wy)**2;if(d<nearD){nearD=d;nearM=m;}}
  g.pface=nearM?Math.atan2(nearM.wy-g.wy,nearM.wx-g.wx):Math.atan2(twy-g.wy,twx-g.wx);
  if(g.piframe>0)g.piframe--;

  // auto shoot
  if(g.shootCd>0)g.shootCd--;
  if(g.shootCd<=0&&nearM){
    const lv=g.lv||1;const sp=0.28;
    if(lv>=10){
      fireArrow(g,g.pface-sp*2.5);fireArrow(g,g.pface-sp*1.5);fireArrow(g,g.pface-sp*.5);
      fireArrow(g,g.pface+sp*.5);fireArrow(g,g.pface+sp*1.5);fireArrow(g,g.pface+sp*2.5);
    } else if(lv>=9){
      fireArrow(g,g.pface-sp*2);fireArrow(g,g.pface-sp);fireArrow(g,g.pface);
      fireArrow(g,g.pface+sp);fireArrow(g,g.pface+sp*2);
    } else if(lv>=7){
      fireArrow(g,g.pface-sp);fireArrow(g,g.pface);fireArrow(g,g.pface+sp);
    } else if(lv>=3){
      fireArrow(g,g.pface-sp*.5);fireArrow(g,g.pface+sp*.5);
    } else {
      fireArrow(g,g.pface);
    }
    if(hasItem(g,'multi')){fireArrow(g,g.pface-.38);fireArrow(g,g.pface+.38);}
    playFireSound();
    g.shootCd=getShootRate(g);
    g.shootAnim=10;
  }
  if(g.shootAnim>0)g.shootAnim--;

  // 레이저: 매 프레임 16방향 레이저로 닿는 몬스터 즉사 (cos/sin 사전계산 배열 사용)
  if(hasItem(g,'laser')){
    const range2=600*600;
    for(const m of g.monsters){
      if(m.dead)continue;
      const mdx=m.wx-g.wx, mdy=m.wy-g.wy;
      if(mdx*mdx+mdy*mdy>range2)continue;
      for(let i=0;i<LASER_RAYS;i++){
        if(Math.abs(LASER_COS[i]*mdy-LASER_SIN[i]*mdx)<m.r){killMonster(g,m);burst(g,m.wx,m.wy,'#ef4444',6);break;}
      }
    }
  }

  // active items
  for(const ai of g.activeItems)ai.timer--;
  const expiredKeys=g.activeItems.filter(ai=>ai.timer<=0).map(ai=>ai.key);
  if(expiredKeys.includes('shield'))g.shieldHp=0;
  g.activeItems=g.activeItems.filter(ai=>ai.timer>0);
  updateItemBar(g);

  // ── 무한 스폰: 경과 시간 + 레벨 + 아이템 수에 따라 빨라짐 ──
  if(g.frame%60===0){
    g.elapsed++;
    g.difficulty=3+g.elapsed*.018;
    const mm=String(Math.floor(g.elapsed/60)).padStart(2,'0');
    const ss=String(g.elapsed%60).padStart(2,'0');
    document.getElementById('hudWv').textContent=mm+':'+ss;
  }
  // 대시 쿨다운 & 지속시간 업데이트
  if(g.isDashing){
    g.dashTimer--;
    if(g.dashTimer<=0)g.isDashing=false;
  }
  if(g.dashCd>0)g.dashCd--;
  // 대시 HUD 업데이트 (상태 변경 시에만 DOM 갱신)
  const curDashState=g.isDashing?'dash':g.dashCd>0?'cd':'ready';
  const curDashCd=g.dashCd;
  if(curDashState!==_lastDashState||curDashCd!==_lastDashCd){
    _lastDashState=curDashState;_lastDashCd=curDashCd;
    if(g.isDashing){
      DOM.dcFill.style.width='100%';DOM.dcFill.style.background='linear-gradient(90deg,#f59e0b,#fde68a)';
      DOM.dcTxt.textContent='DASH!';DOM.dashIcon.style.filter='drop-shadow(0 0 10px #fde68a)';
    } else if(g.dashCd>0){
      DOM.dcFill.style.width=((1-g.dashCd/300)*100)+'%';DOM.dcFill.style.background='linear-gradient(90deg,#7c3aed,#a78bfa)';
      DOM.dcTxt.textContent=Math.ceil(g.dashCd/60)+'s';DOM.dashIcon.style.filter='drop-shadow(0 0 4px #6d28d9)';
    } else {
      DOM.dcFill.style.width='100%';DOM.dcFill.style.background='linear-gradient(90deg,#7c3aed,#a78bfa)';
      DOM.dcTxt.textContent='준비';DOM.dashIcon.style.filter='drop-shadow(0 0 8px #a78bfa)';
    }
  }

  // 스폰 압박 = 기본 난이도 + 레벨 보너스 + 아이템 보너스
  // 레벨 1마다 +0.4, 아이템 1개당 +0.8
  const lvBonus=(g.lv-1)*1.5;
  const itemBonus=g.activeItems.length*0.8;
  const spawnPressure=g.difficulty+lvBonus+itemBonus; // 캡 제거 — 레벨/시간에 비례해 무한 증가
  g.spawnTimer++;
  const spawnIntv=Math.max(4,Math.floor(70/spawnPressure));
  const monsterCap=Math.min(60+g.lv*18,400); // 레벨당 +18마리, 최대 400
  if(g.spawnTimer>=spawnIntv){g.spawnTimer=0;if(g.monsters.length<monsterCap)spawnMonster(g);}

  // spawn world items
  g.itemSpawnTimer++;
  // 아이템 스폰: 기본 간격 + 몬스터 많을수록 더 자주
  const monsterBonus=Math.floor(g.monsters.filter(m=>!m.dead).length/3);
  const itemIntv=Math.max(60,200-g.elapsed*2-monsterBonus*12);
  if(g.itemSpawnTimer>=itemIntv&&g.worldItems.length<12){g.itemSpawnTimer=0;spawnWorldItem(g);}
  for(const it of g.worldItems){it.age++;it.bob+=.06;}

  // pickup
  for(const it of g.worldItems){
    if(it.picked)continue;
    if((g.wx-it.wx)**2+(g.wy-it.wy)**2<(CFG_PR+it.r)**2){
      it.picked=true;pickupItem(g,it.key,it.wx,it.wy);
    }
  }
  g.worldItems=g.worldItems.filter(it=>!it.picked&&it.age<1200);

  // arrows
  for(const a of g.arrows){
    a.wx+=a.vx;a.wy+=a.vy;a.life--;
    if(a.dead)continue;
    for(const m of g.monsters){
      if(m.dead)continue;
      if((a.wx-m.wx)**2+(a.wy-m.wy)**2<(m.r)**2){
        const item=a.item;
        if(!a.pierce||(a.pierce&&a.hits>0))a.dead=true;
        a.hits++;
        burst(g,a.wx,a.wy,item?ITEM_DEFS[item].color:'#fde68a',5);
        if(item==='slow')m.slow=200;
        if(item==='explosive'){
          explosionBurst(g,a.wx,a.wy);
          for(const m2 of g.monsters){
            if(m2.dead)continue;
            if((m2.wx-a.wx)**2+(m2.wy-a.wy)**2<80**2){const exDmg=Math.ceil(2*(g.lvAtk||1));m2.hp-=exDmg;if(m2.hp<=0)killMonster(g,m2);}
          }
        }
        const arrowDmg=Math.ceil(1*(g.lvAtk||1));
        m.hp-=arrowDmg;m.hitFlash=10;
        if(m.hp<=0)killMonster(g,m);
        if(a.pierce&&a.hits>=3)a.dead=true;
        if(!a.pierce)break;
      }
    }
  }

  // monsters
  for(const m of g.monsters){
    if(m.dead)continue;
    m.anim++;m.wob+=.06;
    const spdMul=m.slow>0?.32:1;
    if(m.slow>0)m.slow--;
    const mdx=g.wx-m.wx,mdy=g.wy-m.wy,md=Math.sqrt(mdx*mdx+mdy*mdy)||1;
    const perp={x:-mdy/md,y:mdx/md},wob=Math.sin(m.wob)*(m.boss?.5:.28);
    // 원거리 몬스터 (spitter): 사정거리 안이면 사격
    if(m.ranged&&md<m.shootRange*.85){
      m.wx+=perp.x*wob*spdMul;
      m.wy+=perp.y*wob*spdMul;
      if(m.mShootCd>0){m.mShootCd--;}
      else{
        const ang=Math.atan2(mdy,mdx);
        g.mProjectiles=g.mProjectiles||[];
        g.mProjectiles.push({
          wx:m.wx+Math.cos(ang)*m.r,wy:m.wy+Math.sin(ang)*m.r,
          vx:Math.cos(ang)*3.8,vy:Math.sin(ang)*3.8,
          ang,life:120,dead:false,
          dmg:Math.ceil(8*Math.min(g.difficulty,5)),
        });
        m.mShootCd=m.mShootInterval;
        burst(g,m.wx,m.wy,'#84cc16',4);
      }
    } else {
      // ── 근접 공격 사이클: chase → windup → lunge → recover ──
      const atkRange=CFG_PR+m.r+20;
      if(m.atkPhase==='chase'){
        // 접근
        let tx=g.wx,ty=g.wy;
        if(m.behavior==='predict'){
          const predDist=Math.min(md,m.spd*30);
          tx=g.wx+Math.cos(g.moveDir||0)*predDist;
          ty=g.wy+Math.sin(g.moveDir||0)*predDist;
        } else if(m.behavior==='flank'){
          const flankAng=Math.atan2(mdy,mdx)+m.flankSign*(Math.PI/3)*(md>200?1:.3);
          tx=g.wx+Math.cos(flankAng)*60;
          ty=g.wy+Math.sin(flankAng)*60;
        }
        const tdx=tx-m.wx,tdy=ty-m.wy,td=Math.sqrt(tdx*tdx+tdy*tdy)||1;
        m.wx+=((tdx/td)*m.spd+perp.x*wob)*spdMul;
        m.wy+=((tdy/td)*m.spd+perp.y*wob)*spdMul;
        // 공격 범위 진입 시 windup 시작
        if(md<atkRange){m.atkPhase='windup';m.atkTimer=12;}
      } else if(m.atkPhase==='windup'){
        // 예비동작: 약간 뒤로 빠짐
        m.wx-=(mdx/md)*m.spd*0.5*spdMul;
        m.wy-=(mdy/md)*m.spd*0.5*spdMul;
        m.atkTimer--;
        if(m.atkTimer<=0){
          // 돌진 목표를 플레이어 현재 위치로 고정
          m.atkTargetX=g.wx;m.atkTargetY=g.wy;
          m.atkPhase='lunge';m.atkTimer=12;
        }
      } else if(m.atkPhase==='lunge'){
        // 돌진
        const ldx=m.atkTargetX-m.wx,ldy=m.atkTargetY-m.wy,ld=Math.sqrt(ldx*ldx+ldy*ldy)||1;
        m.wx+=ldx/ld*m.spd*3.5*spdMul;
        m.wy+=ldy/ld*m.spd*3.5*spdMul;
        m.atkTimer--;
        // 히트 판정
        if(md<CFG_PR+m.r*.8&&g.piframe===0){
          const dmgTbl={ghoul:5,wraith:4,vampire:8,crawler:6,revenant:12,golem:18,lich:15,spitter:10};
          const dmg=Math.ceil((dmgTbl[m.type]||6)*Math.min(g.difficulty,5));
          if(g.shieldHp>0){
            g.shieldHp--;g.piframe=40;
            burst(g,g.wx,g.wy,'#e2e8f0',18);
            g.popups.push({wx:g.wx,wy:g.wy-30,txt:'SHIELD!',life:1,col:'#e2e8f0',big:true});
            if(g.shieldHp<=0){g.activeItems=g.activeItems.filter(i=>i.key!=='shield');updateItemBar(g);}
          } else {
            g.php=Math.max(0,g.php-dmg);g.piframe=25;
            burst(g,g.wx,g.wy,'#f87171',14);
            g.popups.push({wx:g.wx,wy:g.wy-30,txt:'-'+dmg,life:1,col:'#f87171',big:true});
            updateHpHud(g);if(g.php<=0){endGame(g);return;}
          }
          m.atkPhase='recover';m.atkTimer=25;
        } else if(m.atkTimer<=0){m.atkPhase='recover';m.atkTimer=40;}
      } else if(m.atkPhase==='recover'){
        // 공격 후 딜레이
        m.atkTimer--;
        if(m.atkTimer<=0)m.atkPhase='chase';
      }
    }
  }

  for(const p of g.particles){p.wx+=p.vx;p.wy+=p.vy;p.vy+=.08;p.vx*=.97;p.life-=p.decay;p.r*=.97;}
  for(const p of g.popups){p.wy-=.9;p.life-=.018;}
  g.arrows=g.arrows.filter(a=>!a.dead&&a.life>0);
  g.monsters=g.monsters.filter(m=>!m.dead);
  g.particles=g.particles.filter(p=>p.life>0&&p.r>.5);
  g.popups=g.popups.filter(p=>p.life>0);

  // 독침 투사체 업데이트
  g.mProjectiles=g.mProjectiles||[];
  for(const p of g.mProjectiles){
    if(p.dead)continue;
    p.wx+=p.vx;p.wy+=p.vy;p.life--;
    // 플레이어 피격 체크
    const pdx=g.wx-p.wx,pdy=g.wy-p.wy;
    if(pdx*pdx+pdy*pdy<(CFG_PR+6)**2&&g.piframe===0){
      p.dead=true;
      if(g.shieldHp>0){
        g.shieldHp--;
        burst(g,g.wx,g.wy,'#e2e8f0',10);
        g.popups.push({wx:g.wx,wy:g.wy-30,txt:'SHIELD!',life:1,col:'#e2e8f0',big:true});
        if(g.shieldHp<=0){g.activeItems=g.activeItems.filter(i=>i.key!=='shield');updateItemBar(g);}
      } else {
        g.php=Math.max(0,g.php-p.dmg);
        g.piframe=50;
        burst(g,g.wx,g.wy,'#84cc16',12);
        g.popups.push({wx:g.wx,wy:g.wy-30,txt:'-'+p.dmg,life:1,col:'#84cc16',big:true});
        updateHpHud(g);if(g.php<=0){endGame(g);return;}
      }
    }
  }
  g.mProjectiles=g.mProjectiles.filter(p=>!p.dead&&p.life>0);
  if(g.score!==_lastScore){_lastScore=g.score;DOM.hudSc.textContent='⭐ '+g.score;}
  for(const s of g.stars){s.a+=s.da;if(s.a<.04)s.da=Math.abs(s.da);if(s.a>.95)s.da=-Math.abs(s.da);}
}

function fireArrow(g,ang){
  const spd=12.5+(g.lv-1)*1.2;  // 레벨당 화살 속도 +1.2
  // buff 아이템(speed/shield/atkspeed)은 화살에 영향 없음 — projectile 타입만 사용
  const firstItem=g.activeItems.length?g.activeItems[0]:null;
  const key=(firstItem&&ITEM_DEFS[firstItem.key].type==='projectile')?firstItem.key:null;
  g.arrows.push({wx:g.wx+Math.cos(ang)*26,wy:g.wy+Math.sin(ang)*26,
    vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,ang,life:110,dead:false,
    item:key,pierce:key==='pierce',explosive:key==='explosive',hits:0});
}

function killMonster(g,m){
  if(m.dead)return;m.dead=true;
  const def=MONSTER_DEF[m.type]||{xp:10};
  const pts=Math.ceil(def.xp*g.difficulty);
  g.score+=pts;gainXp(g,def.xp);
  deathBurst(g,m.wx,m.wy,m.type);
  playDieSound();
  g.popups.push({wx:m.wx,wy:m.wy-m.r,txt:'+'+pts,life:1,col:'#fde68a'});
  // 레벨 비례 즉시 재생성: 레벨 5 이상부터 확률 증가
  const respawnChance=Math.min(0.2+(g.lv-1)*0.1,0.95);
  const monsterCapK=Math.min(60+g.lv*18,400);
  if(Math.random()<respawnChance&&g.monsters.length<monsterCapK)spawnMonster(g);
}

function gainXp(g,amt){
  g.xp+=amt;
  if(g.xp>=g.xpNext){
    g.xp-=g.xpNext;g.lv++;
    g.xpNext=Math.ceil(80*1.32**(g.lv-1));
    g.lvAtk=1+(g.lv-1)*0.25;               // 공격력: 레벨당 +25%
    // 레벨업 시 기존 몬스터 속도 증가 (+8%)
    for(const m of g.monsters){m.spd*=1.08;}
    // 레벨업 시 체력 회복
    g.php=Math.min(g.maxHp,g.php+20);
    updateHpHud(g);
    showLvUp(g.lv);
  }
  const pct=Math.min(g.xp/g.xpNext*100,100);
  DOM.xpf.style.width=pct+'%';
  DOM.xpl.textContent='Lv.'+g.lv+'  ·  '+g.xp+' / '+g.xpNext+' XP';
}

let lvT=null;
function showLvUp(lv){
  const f=document.getElementById('luf'),t=document.getElementById('lut');
  t.textContent='LEVEL '+lv+'!';f.style.background='rgba(168,85,247,.16)';t.style.opacity='1';
  clearTimeout(lvT);lvT=setTimeout(()=>{f.style.background='';t.style.opacity='0';},900);
}

function pickupItem(g,key,wx,wy){
  const def=ITEM_DEFS[key];
  g.activeItems=g.activeItems.filter(i=>i.key!==key);
  g.activeItems.unshift({key,timer:def.duration,maxTimer:def.duration});
  if(g.activeItems.length>3)g.activeItems=g.activeItems.slice(0,3);
  // 보호막 장착 시 내구도 초기화
  if(key==='shield') g.shieldHp=def.shieldHp;
  playItemSound();
  burst(g,wx,wy,def.color,16,true);
  g.popups.push({wx,wy:wy-30,txt:def.label+'!',life:1,col:def.color,big:true});
  const pf=document.getElementById('pf');
  pf.style.background=def.color+'33';pf.style.opacity='1';
  setTimeout(()=>pf.style.opacity='0',220);
}

function updateHpHud(g){
  const pct=Math.max(0,g.php/g.maxHp*100);
  const bar=document.getElementById('hudHpBar');
  const lbl=document.getElementById('hudHpNum');
  bar.style.width=pct+'%';
  // 색상: 초록→노랑→빨강
  bar.style.background=pct>60?'linear-gradient(90deg,#4ade80,#22d3ee)':
    pct>30?'linear-gradient(90deg,#facc15,#fb923c)':
    'linear-gradient(90deg,#f87171,#e11d48)';
  bar.style.boxShadow=pct>60?'0 0 8px #4ade80':pct>30?'0 0 8px #facc15':'0 0 10px #f87171';
  lbl.textContent=Math.ceil(g.php)+' / '+g.maxHp;
  lbl.style.color=pct>60?'#86efac':pct>30?'#fde68a':'#fca5a5';
}

// 아이템바 DOM 캐시 (초기화 후 세팅)
const ITEM_DOM={ic:[],ib:[],sl:[]};
function initItemDomCache(){
  for(let i=0;i<3;i++){
    ITEM_DOM.ic[i]=document.getElementById('ii'+i);
    ITEM_DOM.ib[i]=document.getElementById('ib'+i);
    ITEM_DOM.sl[i]=document.getElementById('is'+i);
  }
}
function updateItemBar(g){
  for(let i=0;i<3;i++){
    const ai=g.activeItems[i];
    const ic=ITEM_DOM.ic[i],ib=ITEM_DOM.ib[i],sl=ITEM_DOM.sl[i];
    if(ai){
      const def=ITEM_DEFS[ai.key];
      ic.textContent=def.icon;ib.style.width=(ai.timer/ai.maxTimer*100)+'%';ib.style.background=def.color;
      sl.classList.add('active');sl.style.borderColor=def.color+'66';
    } else {
      ic.textContent='—';ib.style.width='0%';sl.classList.remove('active');sl.style.borderColor='';
    }
  }
}
