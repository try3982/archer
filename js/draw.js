// ══════════════════════════════════════════
//  DRAW ALL
// ══════════════════════════════════════════
function drawAll(g){
  cx.clearRect(0,0,W,H);
  const wt=WEATHER_TYPES[g.weatherIdx];
  const wn=WEATHER_TYPES[g.nextWeatherIdx];
  const t=g.weatherTransition;

  // ════ 우주 배경 ════
  // 베이스: 완전 검정
  cx.fillStyle='#02010a';cx.fillRect(0,0,W,H);

  // ── 성운 (nebula) ── 패럴랙스 0.04로 아주 느리게
  cx.save();
  for(const nb of g.nebulae){
    const nbRawX=nb.wx - g.camX*0.04;
    const nbRawY=nb.wy - g.camY*0.04;
    const nbWrap=WORLD_W*2;
    const sx2=((nbRawX%nbWrap)+nbWrap)%nbWrap - nbWrap/2 + W/2;
    const sy2=((nbRawY%nbWrap)+nbWrap)%nbWrap - nbWrap/2 + H/2;
    if(sx2<-nb.r-50||sx2>W+nb.r+50||sy2<-nb.r-50||sy2>H+nb.r+50)continue;
    const grad=cx.createRadialGradient(sx2,sy2,0,sx2,sy2,nb.r);
    grad.addColorStop(0,nb.col+'55');
    grad.addColorStop(.5,nb.col+'22');
    grad.addColorStop(1,'transparent');
    cx.globalAlpha=nb.a;cx.fillStyle=grad;
    cx.beginPath();cx.arc(sx2,sy2,nb.r,0,Math.PI*2);cx.fill();
  }
  cx.globalAlpha=1;cx.restore();

  // ── 별 3레이어 ──
  cx.save();
  const PARALLAX=[0.04,0.22,0.48];
  for(const s of g.stars){
    const pl=PARALLAX[s.layer];
    const rawX=(s.wx - g.camX*pl);
    const rawY=(s.wy - g.camY*pl);
    // 화면 wrap
    const sw=W+200,sh=H+200;
    const sx2=((rawX%sw)+sw)%sw - 100;
    const sy2=((rawY%sh)+sh)%sh - 100;
    cx.globalAlpha=s.a*(s.layer===0?.55:s.layer===1?.75:1);
    cx.fillStyle=s.col;
    cx.beginPath();cx.arc(sx2,sy2,s.r,0,Math.PI*2);cx.fill();
    // 밝은 별에 십자 빛망울
    if(s.layer===2&&s.r>2.5){
      cx.globalAlpha=s.a*.25;cx.strokeStyle=s.col;cx.lineWidth=.8;
      cx.beginPath();cx.moveTo(sx2-s.r*3,sy2);cx.lineTo(sx2+s.r*3,sy2);cx.stroke();
      cx.beginPath();cx.moveTo(sx2,sy2-s.r*3);cx.lineTo(sx2,sy2+s.r*3);cx.stroke();
    }
  }
  cx.globalAlpha=1;cx.restore();

  // ── 행성 ── 패럴랙스 0.65 (월드와 거의 같이 움직임)
  cx.save();
  for(const pl of g.planets){
    // 행성: 느린 패럴랙스로 화면에 반복 등장
    const rawPx=pl.wx-g.camX*.65, rawPy=pl.wy-g.camY*.65;
    const wrapW=WORLD_W*.65, wrapH=WORLD_H*.65;
    const px=((rawPx%wrapW)+wrapW)%wrapW - wrapW/2 + W/2;
    const py=((rawPy%wrapH)+wrapH)%wrapH - wrapH/2 + H/2;
    if(px<-pl.r-80||px>W+pl.r+80||py<-pl.r-80||py>H+pl.r+80)continue;
    // 링
    if(pl.ring){
      cx.save();cx.translate(px,py);cx.scale(1,.28);
      cx.strokeStyle=pl.col+'88';cx.lineWidth=pl.r*.22;
      cx.beginPath();cx.arc(0,0,pl.r*1.6,0,Math.PI*2);cx.stroke();
      cx.restore();
    }
    // 행성 본체
    const grad=cx.createRadialGradient(px-pl.r*.3,py-pl.r*.3,pl.r*.1,px,py,pl.r);
    grad.addColorStop(0,pl.col);grad.addColorStop(1,pl.col2);
    cx.fillStyle=grad;
    cx.beginPath();cx.arc(px,py,pl.r,0,Math.PI*2);cx.fill();
    // 대기광
    cx.strokeStyle=pl.col+'44';cx.lineWidth=pl.r*.12;
    cx.beginPath();cx.arc(px,py,pl.r*1.06,0,Math.PI*2);cx.stroke();
    // 표면 줄무늬
    cx.save();cx.beginPath();cx.arc(px,py,pl.r,0,Math.PI*2);cx.clip();
    cx.strokeStyle='rgba(255,255,255,.06)';cx.lineWidth=pl.r*.18;
    for(let i=-2;i<=2;i++){
      cx.beginPath();cx.moveTo(px-pl.r,py+i*pl.r*.35);cx.lineTo(px+pl.r,py+i*pl.r*.35);cx.stroke();
    }
    cx.restore();
  }
  cx.restore();

  // ── 우주 바닥면 (지면 느낌, 반투명 격자) ──
  cx.save();
  cx.strokeStyle='rgba(100,80,180,.055)';cx.lineWidth=.8;
  const gStep=120;
  const gOffX=(-g.camX)%gStep, gOffY=(-g.camY)%gStep;
  for(let x=gOffX;x<W;x+=gStep){cx.beginPath();cx.moveTo(x,0);cx.lineTo(x,H);cx.stroke();}
  for(let y=gOffY;y<H;y+=gStep){cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y);cx.stroke();}
  cx.restore();

  // ── World items ──
  for(const it of g.worldItems){
    if(it.picked)continue;
    const sx=it.wx-g.camX,sy=it.wy-g.camY;
    if(sx<-50||sx>W+50||sy<-50||sy>H+50)continue;
    drawWorldItem(it,sx,sy);
  }

  // ── Particles ──
  cx.save();
  for(const p of g.particles){
    cx.globalAlpha=p.life*.8;cx.fillStyle=p.col;
    cx.beginPath();cx.arc(p.wx-g.camX,p.wy-g.camY,Math.max(.5,p.r),0,Math.PI*2);cx.fill();
  }
  cx.restore();

  // ── Arrows ──
  for(const a of g.arrows)drawArrow(g,a);
  // ── 독침 투사체 ──
  cx.save();
  for(const p of (g.mProjectiles||[])){
    if(p.dead)continue;
    const px=p.wx-g.camX, py=p.wy-g.camY;
    if(px<-30||px>W+30||py<-30||py>H+30)continue;
    cx.save();cx.translate(px,py);cx.rotate(p.ang);
    // 독침 몸통 (녹색 타원)
    const grad=cx.createLinearGradient(-10,0,10,0);
    grad.addColorStop(0,'#4ade80');grad.addColorStop(.5,'#86efac');grad.addColorStop(1,'#16a34a');
    cx.fillStyle=grad;
    cx.beginPath();cx.ellipse(0,0,10,4,0,0,Math.PI*2);cx.fill();
    // 독 방울 (앞쪽)
    cx.fillStyle='#bbf7d0';
    cx.beginPath();cx.arc(9,0,3.5,0,Math.PI*2);cx.fill();
    // 독 방울 광택
    cx.fillStyle='rgba(255,255,255,.6)';
    cx.beginPath();cx.arc(8,-1,1.2,0,Math.PI*2);cx.fill();
    // 꼬리 (독 흔적)
    cx.globalAlpha=.35;
    const tGrad=cx.createLinearGradient(-18,0,-6,0);
    tGrad.addColorStop(0,'transparent');tGrad.addColorStop(1,'#4ade80');
    cx.fillStyle=tGrad;
    cx.beginPath();cx.ellipse(-11,0,8,2.5,0,0,Math.PI*2);cx.fill();
    // 수명에 따른 독 번짐 파티클 (20프레임마다)
    cx.restore();
    // 독 글로우
    cx.globalAlpha=(p.life/120)*.5;
    cx.strokeStyle='#4ade80';cx.lineWidth=1.5;
    cx.shadowColor='#4ade80';cx.shadowBlur=8;
    cx.beginPath();cx.arc(px,py,6,0,Math.PI*2);cx.stroke();
    cx.shadowBlur=0;cx.globalAlpha=1;
  }
  cx.restore();
  // ── Monsters ──
  for(const m of g.monsters)drawMonster(g,m);
  // ── Player ──
  drawPlayer(g);

  // ── Weather effects (drawn ON TOP of world) ──
  drawWeather(g,wt);

  // ── Weather ambient overlay ──
  if(wt.ambientAlpha>0){
    cx.save();cx.globalAlpha=wt.ambientAlpha*t*.6;
    cx.fillStyle=wt.ambientCol;cx.fillRect(0,0,W,H);cx.restore();
  }

  // ── Lightning flash ──
  if(wt.id==='thunder'&&g.lightningAlpha>0){
    cx.save();cx.globalAlpha=g.lightningAlpha*.5;
    cx.fillStyle='#c7d8ff';cx.fillRect(0,0,W,H);cx.restore();
  }

  // ── Fog overlay ──
  if(wt.id==='fog'){
    cx.save();
    const fv=wt.ambientAlpha*t;
    const fg=cx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*.6);
    fg.addColorStop(0,'rgba(30,30,50,0)');fg.addColorStop(.5,'rgba(40,38,60,'+fv*.4+')');
    fg.addColorStop(1,'rgba(20,18,35,'+fv+')');
    cx.fillStyle=fg;cx.fillRect(0,0,W,H);cx.restore();
  }

  // ── Popups ──
  cx.save();cx.textAlign='center';
  for(const p of g.popups){
    const sx=p.wx-g.camX,sy=p.wy-g.camY;
    cx.globalAlpha=p.life;
    if(p.big){cx.font='bold 20px "Fredoka One",cursive';cx.fillStyle=p.col||'#fde68a';cx.shadowColor=p.col||'#f59e0b';cx.shadowBlur=14;}
    else{cx.font='bold 15px "Fredoka One",cursive';cx.fillStyle='#fde68a';cx.shadowColor='#f59e0b';cx.shadowBlur=8;}
    cx.fillText(p.txt,sx,sy);
  }
  cx.shadowBlur=0;cx.globalAlpha=1;cx.textAlign='left';cx.restore();

  drawCursor(g);
  drawMinimap(g);
}

function lerpColor(a,b,t){
  const p=s=>parseInt(s,16);
  const r=c=>c.replace('#','');
  const ha=r(a),hb=r(b);
  const lr=(ch,i)=>Math.round(lerp(p(ch.slice(i,i+2)),p(hb.slice(i,i+2)),t)).toString(16).padStart(2,'0');
  return '#'+lr(ha,0)+lr(ha,2)+lr(ha,4);
}

// ══════════════════════════════════════════
//  DRAW WEATHER
// ══════════════════════════════════════════
function drawWeather(g,wt){
  if(wt.id==='clear')return;
  cx.save();
  for(const p of g.wParticles){
    if(p.type==='none')continue;
    if(p.type==='rain'||p.type==='thunder'){
      // 비: 가는 선, 매우 은은하게
      cx.globalAlpha=.18;
      cx.strokeStyle='rgba(180,210,255,1)';cx.lineWidth=p.size*.7;cx.lineCap='round';
      cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(p.x+p.vx*1.5,p.y+8);cx.stroke();
    } else if(p.type==='snow'){
      // 눈: 작고 부드럽게, 십자선 없이
      cx.globalAlpha=.22;
      cx.fillStyle='rgba(220,235,255,1)';
      cx.beginPath();cx.arc(p.x,p.y,p.size*.7,0,Math.PI*2);cx.fill();
    } else if(p.type==='hail'){
      // 우박: 반투명 작은 알갱이
      cx.globalAlpha=.25;
      cx.fillStyle='rgba(190,230,215,1)';
      cx.beginPath();cx.arc(p.x,p.y,p.size*.8,0,Math.PI*2);cx.fill();
    }
  }
  cx.globalAlpha=1;cx.restore();

  // 번개: 빠른 순간 플래시만, 선은 그리지 않음
  if(wt.id==='thunder'&&g.lightningAlpha>0.6){
    cx.save();cx.globalAlpha=g.lightningAlpha*.18;
    cx.fillStyle='#d0e0ff';cx.fillRect(0,0,W,H);
    cx.restore();
  }
}

// ══════════════════════════════════════════
//  DRAW DECORATIONS (dark fantasy)
// ══════════════════════════════════════════
function drawDeco(d,sx,sy){
  cx.save();cx.translate(sx,sy);cx.scale(d.sz,d.sz);
  if(d.type==='deadTree'){
    // trunk
    cx.fillStyle='#1a1208';cx.fillRect(-3,0,6,20);
    // branches
    cx.strokeStyle='#1a1208';cx.lineWidth=2.5;cx.lineCap='round';
    cx.beginPath();cx.moveTo(0,-5);cx.lineTo(-18,-22);cx.stroke();
    cx.beginPath();cx.moveTo(0,-5);cx.lineTo(16,-18);cx.stroke();
    cx.beginPath();cx.moveTo(-9,-13);cx.lineTo(-22,-10);cx.stroke();
    cx.beginPath();cx.moveTo(8,-11);cx.lineTo(20,-8);cx.stroke();
    cx.beginPath();cx.moveTo(0,0);cx.lineTo(0,-28);cx.stroke();
  } else if(d.type==='rock'){
    cx.fillStyle='#1c1c1c';
    cx.beginPath();cx.ellipse(0,2,16,11,0,0,Math.PI*2);cx.fill();
    cx.fillStyle='#282828';
    cx.beginPath();cx.ellipse(-3,-1,11,8,-.3,0,Math.PI*2);cx.fill();
    cx.fillStyle='rgba(255,255,255,.04)';
    cx.beginPath();cx.ellipse(-5,-3,5,3,-.3,0,Math.PI*2);cx.fill();
  } else if(d.type==='mushroom'){
    // stem
    cx.fillStyle='#c4a882';cx.fillRect(-3,0,6,10);
    // cap
    cx.fillStyle='#8b1a1a';
    cx.beginPath();cx.ellipse(0,-2,12,8,0,0,Math.PI*2);cx.fill();
    // spots
    cx.fillStyle='rgba(255,200,200,.5)';
    [[-5,-3],[2,-5],[-1,-1]].forEach(([ox,oy])=>{cx.beginPath();cx.arc(ox,oy,2,0,Math.PI*2);cx.fill();});
  } else if(d.type==='bone'){
    cx.strokeStyle='#c0b090';cx.lineWidth=2.5;cx.lineCap='round';
    cx.beginPath();cx.moveTo(-12,-4);cx.lineTo(12,4);cx.stroke();
    [[-12,-4],[12,4]].forEach(([bx,by])=>{
      cx.beginPath();cx.arc(bx,by,4,0,Math.PI*2);cx.fillStyle='#c0b090';cx.fill();
    });
  } else if(d.type==='crystal'){
    cx.fillStyle='rgba(80,40,120,.7)';
    cx.beginPath();cx.moveTo(0,-20);cx.lineTo(6,-8);cx.lineTo(4,0);cx.lineTo(-4,0);cx.lineTo(-6,-8);cx.closePath();cx.fill();
    cx.fillStyle='rgba(140,80,200,.5)';
    cx.beginPath();cx.moveTo(0,-18);cx.lineTo(4,-8);cx.lineTo(0,-2);cx.lineTo(-4,-8);cx.closePath();cx.fill();
    cx.strokeStyle='rgba(180,120,255,.6)';cx.lineWidth=1;
    cx.beginPath();cx.moveTo(0,-20);cx.lineTo(6,-8);cx.lineTo(4,0);cx.lineTo(-4,0);cx.lineTo(-6,-8);cx.closePath();cx.stroke();
  }
  cx.restore();
}

// ══════════════════════════════════════════
//  DRAW PLAYER — 귀여운 여전사 (머리 출렁임)
// ══════════════════════════════════════════
function drawPlayer(g){
  const sx=g.wx-g.camX, sy=g.wy-g.camY;
  if(g.piframe>0&&(g.piframe/5|0)%2===1)return;

  const run=g.runCycle;
  const moving=g.isMoving;
  const facing=g.pface;
  const bodyDir=moving?g.moveDir:facing;
  const hair=g.hairBob;

  // 방향벡터 (몸통)
  const fwX=Math.cos(bodyDir), fwY=Math.sin(bodyDir);
  const rpX=-Math.sin(bodyDir), rpY=Math.cos(bodyDir);
  // 방향벡터 (얼굴)
  const efX=Math.cos(facing), efY=Math.sin(facing);
  const erX=-Math.sin(facing), erY=Math.cos(facing);

  const legSwing=moving?Math.sin(run)*9:0;
  const armSwing=moving?Math.sin(run+Math.PI)*6:0;

  // ─ 그림자 ─
  cx.save();cx.translate(sx,sy+12);
  cx.beginPath();cx.ellipse(0,0,14,4.5,0,0,Math.PI*2);
  cx.fillStyle='rgba(0,0,0,.25)';cx.fill();cx.restore();

  // ─ 아이템 오라 ─
  if(g.activeItems.length){
    const def=ITEM_DEFS[g.activeItems[0].key];
    cx.save();cx.translate(sx,sy);
    cx.strokeStyle=def.color+'44';cx.lineWidth=2;cx.shadowColor=def.color;cx.shadowBlur=10;
    cx.beginPath();cx.arc(0,0,27,0,Math.PI*2);cx.stroke();
    cx.shadowBlur=0;cx.restore();
  }
  // ─ 보호막 비주얼 (육각형 방어막) ─
  if(g.shieldHp>0){
    cx.save();cx.translate(sx,sy);
    const sa=g.frame*.02;
    cx.strokeStyle='rgba(226,232,240,0.7)';cx.lineWidth=2.5;
    cx.shadowColor='#e2e8f0';cx.shadowBlur=14;
    cx.beginPath();
    for(let i=0;i<6;i++){
      const a=sa+i*Math.PI/3;
      i===0?cx.moveTo(Math.cos(a)*32,Math.sin(a)*32):cx.lineTo(Math.cos(a)*32,Math.sin(a)*32);
    }
    cx.closePath();cx.stroke();
    // 내구도 표시 (작은 점)
    for(let i=0;i<g.shieldHp;i++){
      const a=-Math.PI/2+i*Math.PI*.4;
      cx.fillStyle='#e2e8f0';cx.beginPath();cx.arc(Math.cos(a)*36,Math.sin(a)*36,3,0,Math.PI*2);cx.fill();
    }
    cx.shadowBlur=0;cx.restore();
  }
  // ─ 이동 증가: 발 아래 속도선 ─
  if(g.isMoving&&hasItem(g,'speed')){
    cx.save();cx.translate(sx,sy);
    const bd=g.moveDir+Math.PI;
    cx.strokeStyle='rgba(103,232,249,0.5)';cx.lineWidth=1.5;cx.lineCap='round';
    for(let i=0;i<3;i++){
      const ox=Math.cos(bd+Math.PI/2)*(i-1)*6;
      const oy=Math.sin(bd+Math.PI/2)*(i-1)*6;
      cx.globalAlpha=0.5-i*.1;
      cx.beginPath();
      cx.moveTo(ox+Math.cos(bd)*8,oy+Math.sin(bd)*8);
      cx.lineTo(ox+Math.cos(bd)*22,oy+Math.sin(bd)*22);
      cx.stroke();
    }
    cx.globalAlpha=1;cx.restore();
  }
  // 대시 이펙트 — 황금 속도선 + 잔상
  if(g.isDashing&&g.isMoving){
    cx.save();cx.translate(sx,sy);
    const bd2=g.moveDir+Math.PI;
    // 넓은 황금 광선
    cx.shadowColor='#fde68a';cx.shadowBlur=16;
    cx.strokeStyle='rgba(253,230,138,0.85)';cx.lineWidth=2.5;cx.lineCap='round';
    for(let i=0;i<5;i++){
      const spread=(i-2)*8;
      const ox2=Math.cos(bd2+Math.PI/2)*spread;
      const oy2=Math.sin(bd2+Math.PI/2)*spread;
      cx.globalAlpha=0.7-Math.abs(i-2)*.15;
      const len=28+Math.abs(i-2)*6;
      cx.beginPath();
      cx.moveTo(ox2+Math.cos(bd2)*10,oy2+Math.sin(bd2)*10);
      cx.lineTo(ox2+Math.cos(bd2)*(10+len),oy2+Math.sin(bd2)*(10+len));
      cx.stroke();
    }
    cx.shadowBlur=0;cx.globalAlpha=1;
    // 링 잔상
    cx.strokeStyle='rgba(253,186,64,0.4)';cx.lineWidth=1.5;
    cx.beginPath();cx.arc(Math.cos(bd2)*18,Math.sin(bd2)*18,10,0,Math.PI*2);cx.stroke();
    cx.restore();
  }

  cx.save();cx.translate(sx,sy);

  // ━━━ 다리 ━━━
  // 다리 끝점
  const lx1=rpX*4.5+fwX*legSwing,  ly1=rpY*4.5+fwY*legSwing+9;
  const lx2=-rpX*4.5-fwX*legSwing, ly2=-rpY*4.5-fwY*legSwing+9;

  // 스타킹 (밝은 라벤더)
  cx.strokeStyle='#c4b5fd';cx.lineWidth=5;cx.lineCap='round';
  cx.beginPath();cx.moveTo(rpX*2.5,rpY*2.5+5);cx.lineTo(lx1,ly1-3);cx.stroke();
  cx.beginPath();cx.moveTo(-rpX*2.5,-rpY*2.5+5);cx.lineTo(lx2,ly2-3);cx.stroke();
  // 부츠 (짙은 자주)
  cx.strokeStyle='#4c1d95';cx.lineWidth=5;cx.lineCap='round';
  cx.beginPath();cx.moveTo(lx1,ly1-3);cx.lineTo(lx1+fwX*.5,ly1+fwY*.5+3);cx.stroke();
  cx.beginPath();cx.moveTo(lx2,ly2-3);cx.lineTo(lx2+fwX*.5,ly2+fwY*.5+3);cx.stroke();
  // 부츠 발끝
  cx.fillStyle='#3b0764';
  cx.beginPath();cx.ellipse(lx1+fwX*2,ly1+fwY*2+2,5,3,bodyDir,0,Math.PI*2);cx.fill();
  cx.beginPath();cx.ellipse(lx2+fwX*2,ly2+fwY*2+2,5,3,bodyDir,0,Math.PI*2);cx.fill();

  // ━━━ 치마 ━━━
  // 앞치마 레이어 (보디 방향으로 약간 부풀림)
  cx.save();cx.rotate(bodyDir+Math.PI/2);
  cx.fillStyle='#6d28d9';
  cx.beginPath();
  cx.moveTo(-11,2);cx.quadraticCurveTo(-14,10,-10,16);
  cx.lineTo(10,16);cx.quadraticCurveTo(14,10,11,2);cx.closePath();cx.fill();
  // 치마 주름
  cx.strokeStyle='#5b21b6';cx.lineWidth=1.2;
  cx.beginPath();cx.moveTo(-5,2);cx.lineTo(-6,16);cx.stroke();
  cx.beginPath();cx.moveTo(0,2);cx.lineTo(0,16);cx.stroke();
  cx.beginPath();cx.moveTo(5,2);cx.lineTo(6,16);cx.stroke();
  // 치마 밑단 흰 레이스
  cx.strokeStyle='rgba(255,255,255,.35)';cx.lineWidth=2;
  cx.beginPath();cx.moveTo(-10,15);cx.lineTo(10,15);cx.stroke();
  cx.restore();

  // ━━━ 몸통 (갑옷+코르셋) ━━━
  cx.save();cx.rotate(bodyDir+Math.PI/2);
  // 기본 몸
  cx.beginPath();cx.ellipse(0,-1,9,11,0,0,Math.PI*2);cx.fillStyle='#7c3aed';cx.fill();
  // 가슴 갑옷 판
  cx.beginPath();cx.ellipse(0,-3,6.5,7.5,0,0,Math.PI*2);cx.fillStyle='#9333ea';cx.fill();
  // 갑옷 중앙 선 장식
  cx.strokeStyle='rgba(230,210,255,.5)';cx.lineWidth=1;
  cx.beginPath();cx.moveTo(0,-10);cx.lineTo(0,4);cx.stroke();
  // 리본/버클
  cx.fillStyle='#fbbf24';
  cx.beginPath();cx.moveTo(-4,4);cx.lineTo(0,1);cx.lineTo(4,4);cx.lineTo(0,7);cx.closePath();cx.fill();
  // 어깨 퍼프 (둥근 느낌)
  cx.fillStyle='#8b5cf6';
  cx.beginPath();cx.ellipse(-9,-5,5,4,-.4,0,Math.PI*2);cx.fill();
  cx.beginPath();cx.ellipse( 9,-5,5,4, .4,0,Math.PI*2);cx.fill();
  cx.restore();

  // ━━━ 왼팔 (흔들림) ━━━
  const laBx=-rpX*8-fwX*1, laBy=-rpY*8-fwY*1-3;
  const laEx=laBx+fwX*armSwing-rpX*2, laEy=laBy+fwY*armSwing-rpY*2+6;
  // 피부
  cx.strokeStyle='#fcd34d';cx.lineWidth=4.5;cx.lineCap='round';
  cx.beginPath();cx.moveTo(laBx,laBy);cx.lineTo(laEx,laEy);cx.stroke();
  // 소매
  cx.strokeStyle='#8b5cf6';cx.lineWidth=5;cx.lineCap='round';cx.globalAlpha=.6;
  cx.beginPath();cx.moveTo(laBx,laBy);cx.lineTo(laBx+fwX*armSwing*.4-rpX,laBy+fwY*armSwing*.4-rpY+3);cx.stroke();
  cx.globalAlpha=1;
  // 손
  cx.fillStyle='#fde68a';cx.beginPath();cx.arc(laEx,laEy,3.2,0,Math.PI*2);cx.fill();

  // ━━━ 머리카락 뒷단 (먼저 그려야 얼굴 뒤에 위치) ━━━
  const hx=(-efX*4), hy=(-efY*4-10);  // 머리 중심 (로컬)
  const hairOffX=-efX*hair*.4, hairOffY=-efY*hair*.4;

  // 긴 포니테일 3가닥 — 이동 반대방향으로 흔들
  const strands=[
    {ox:erX*4,oy:erY*4,  len:22, w:5, col:'#1a1a1a'},
    {ox:0,    oy:0,       len:26, w:6, col:'#0d0d0d'},
    {ox:-erX*4,oy:-erY*4,len:20, w:4, col:'#1a1a1a'},
  ];
  strands.forEach(s=>{
    const sx2=hx+s.ox, sy2=hy+s.oy;
    const ctrl1x=sx2-efX*8+hairOffX, ctrl1y=sy2-efY*8+hairOffY;
    const endx=sx2-efX*s.len+hairOffX*1.8, endy=sy2-efY*s.len+hairOffY*1.8;
    cx.beginPath();cx.moveTo(sx2,sy2);
    cx.quadraticCurveTo(ctrl1x,ctrl1y,endx,endy);
    cx.strokeStyle=s.col;cx.lineWidth=s.w;cx.lineCap='round';cx.stroke();
    // 끝단 어두운 회색
    cx.beginPath();cx.arc(endx,endy,s.w*.4,0,Math.PI*2);cx.fillStyle='#3a3a3a';cx.fill();
  });

  // ━━━ 머리 ━━━
  // 뒷머리 볼륨 (원)
  cx.beginPath();cx.arc(hx,hy,12,0,Math.PI*2);cx.fillStyle='#111111';cx.fill();

  // 얼굴 (조금 더 앞쪽, 살구색)
  const fx=hx+efX*2, fy=hy+efY*2;
  cx.beginPath();cx.arc(fx,fy,9.5,0,Math.PI*2);
  cx.fillStyle='#fcd9b0';cx.fill();  // 살구빛 피부

  // 입 (작고 귀엽게)
  cx.strokeStyle='#e88080';cx.lineWidth=1.3;cx.lineCap='round';
  cx.beginPath();
  cx.moveTo(fx+erX*2.2+efX*6,fy+erY*2.2+efY*6);
  cx.quadraticCurveTo(fx+efX*7,fy+efY*7+1,fx-erX*2.2+efX*6,fy-erY*2.2+efY*6);cx.stroke();
  // 입술 하이라이트
  cx.fillStyle='rgba(248,168,168,.5)';
  cx.beginPath();cx.ellipse(fx+efX*6.5,fy+efY*6.5,1.8,1,facing,0,Math.PI*2);cx.fill();

  // 눈 (크고 소녀 스타일)
  const ebx=fx+efX*4.5, eby=fy+efY*4.5;
  // 눈 흰자
  cx.fillStyle='#fff8f8';
  cx.beginPath();cx.ellipse(ebx+erX*3.2,eby+erY*3.2, 3.5,2.8,facing,0,Math.PI*2);cx.fill();
  cx.beginPath();cx.ellipse(ebx-erX*3.2,eby-erY*3.2, 3.5,2.8,facing,0,Math.PI*2);cx.fill();
  // 홍채 (보라색)
  cx.fillStyle='#7c3aed';
  cx.beginPath();cx.ellipse(ebx+erX*3.2,eby+erY*3.2, 2.5,2.2,facing,0,Math.PI*2);cx.fill();
  cx.beginPath();cx.ellipse(ebx-erX*3.2,eby-erY*3.2, 2.5,2.2,facing,0,Math.PI*2);cx.fill();
  // 동공
  cx.fillStyle='#1e0040';
  cx.beginPath();cx.ellipse(ebx+erX*3.2+efX*.5,eby+erY*3.2+efY*.5, 1.5,1.4,facing,0,Math.PI*2);cx.fill();
  cx.beginPath();cx.ellipse(ebx-erX*3.2+efX*.5,eby-erY*3.2+efY*.5, 1.5,1.4,facing,0,Math.PI*2);cx.fill();
  // 눈 반짝이 (두 개)
  cx.fillStyle='#fff';
  cx.beginPath();cx.arc(ebx+erX*3.2+efX*.3,eby+erY*3.2+efY*.3,1.1,0,Math.PI*2);cx.fill();
  cx.beginPath();cx.arc(ebx-erX*3.2+efX*.3,eby-erY*3.2+efY*.3,1.1,0,Math.PI*2);cx.fill();
  cx.beginPath();cx.arc(ebx+erX*3.2+efX*1.2+erX*.8,eby+erY*3.2+efY*1.2+erY*.8,.55,0,Math.PI*2);cx.fill();
  cx.beginPath();cx.arc(ebx-erX*3.2+efX*1.2-erX*.8,eby-erY*3.2+efY*1.2-erY*.8,.55,0,Math.PI*2);cx.fill();
  // 속눈썹 위
  cx.strokeStyle='#3b0764';cx.lineWidth=1.4;cx.lineCap='round';
  [-1.5,0,1.5].forEach(t=>{
    const ex=ebx+erX*3.2+erX*t*1.1, ey=eby+erY*3.2+erY*t*1.1;
    cx.beginPath();cx.moveTo(ex-efX*2.2,ey-efY*2.2);cx.lineTo(ex-efX*3.2+erX*t*.4,ey-efY*3.2+erY*t*.4);cx.stroke();
  });
  [-1.5,0,1.5].forEach(t=>{
    const ex=ebx-erX*3.2+erX*t*1.1, ey=eby-erY*3.2+erY*t*1.1;
    cx.beginPath();cx.moveTo(ex-efX*2.2,ey-efY*2.2);cx.lineTo(ex-efX*3.2+erX*t*.4,ey-efY*3.2+erY*t*.4);cx.stroke();
  });

  // 볼터치 (핑크)
  cx.fillStyle='rgba(251,113,133,.32)';
  cx.beginPath();cx.ellipse(ebx+erX*6.2,eby+erY*6.2, 4,2.5,facing,0,Math.PI*2);cx.fill();
  cx.beginPath();cx.ellipse(ebx-erX*6.2,eby-erY*6.2, 4,2.5,facing,0,Math.PI*2);cx.fill();

  // 코 (작은 점)
  cx.fillStyle='#e8a878';
  cx.beginPath();cx.arc(fx+efX*7.5,fy+efY*7.5, 1.2,0,Math.PI*2);cx.fill();

  // 앞머리 (얼굴 위를 덮는 검은 머리)
  cx.fillStyle='#111111';
  cx.beginPath();
  cx.arc(hx,hy,10.5,facing-Math.PI*.1,facing+Math.PI*.95);cx.fill();
  // 앞머리 안쪽 밝은 부분 (어두운 회색 하이라이트)
  cx.fillStyle='#2a2a2a';
  cx.beginPath();cx.arc(hx+efX*3,hy+efY*3,6.5,facing+Math.PI*.1,facing+Math.PI*.8);cx.fill();

  // 머리핀 (별 모양 작게)
  cx.fillStyle='#fde68a';cx.shadowColor='#f59e0b';cx.shadowBlur=5;
  const pinX=hx+erX*7+efX*3, pinY=hy+erY*7+efY*3;
  for(let i=0;i<5;i++){
    const a=i*Math.PI*.4-Math.PI/2;
    const r2=i%2===0?4:2;
    const px=pinX+Math.cos(a)*r2, py=pinY+Math.sin(a)*r2;
    if(i===0)cx.beginPath();else if(i===1)cx.lineTo(px,py);
    cx.lineTo(px,py);
  }
  cx.closePath();cx.fill();
  cx.shadowBlur=0;

  cx.restore(); // main translate

  // ━━━ 오른팔 + 활 (facing 방향 독립) ━━━
  cx.save();cx.translate(sx,sy);cx.rotate(facing);
  const drawBack=g.shootAnim>0?(g.shootAnim/10)*9:0;

  // 소매
  cx.strokeStyle='#8b5cf6';cx.lineWidth=6;cx.lineCap='round';cx.globalAlpha=.7;
  cx.beginPath();cx.moveTo(7,-1);cx.lineTo(13,-1);cx.stroke();
  cx.globalAlpha=1;
  // 팔 피부
  cx.strokeStyle='#fcd34d';cx.lineWidth=4.5;cx.lineCap='round';
  cx.beginPath();cx.moveTo(9,-1);cx.lineTo(20,-2);cx.stroke();
  // 손
  cx.fillStyle='#fde68a';cx.beginPath();cx.arc(20,-2,3.2,0,Math.PI*2);cx.fill();

  // 활 (약간 아기자기하게)
  cx.strokeStyle='#78350f';cx.lineWidth=3;cx.lineCap='round';
  cx.beginPath();cx.arc(23,-1,13,-Math.PI*.7,Math.PI*.7);cx.stroke();
  // 활 중앙 그립
  cx.strokeStyle='#92400e';cx.lineWidth=5;
  cx.beginPath();cx.arc(23,-1,13,-Math.PI*.13,Math.PI*.13);cx.stroke();
  // 작은 꽃 장식
  cx.fillStyle='#fbbf24';cx.globalAlpha=.8;
  cx.beginPath();cx.arc(23,-14,2.5,0,Math.PI*2);cx.fill();
  cx.beginPath();cx.arc(23,12,2.5,0,Math.PI*2);cx.fill();
  cx.globalAlpha=1;

  // 시위
  cx.strokeStyle='rgba(255,240,210,.85)';cx.lineWidth=1.2;
  const strX=23-drawBack;
  cx.beginPath();cx.moveTo(23,-1-12);cx.lineTo(strX-1,-1);cx.lineTo(23,-1+12);cx.stroke();

  // 시위에 걸린 화살
  if(g.shootCd>getShootRate(g)*.25){
    cx.strokeStyle='#92400e';cx.lineWidth=2;cx.lineCap='round';
    cx.beginPath();cx.moveTo(strX-1,-1);cx.lineTo(23+13,-1);cx.stroke();
    cx.fillStyle='#9ca3af';
    cx.beginPath();cx.moveTo(23+15,-1);cx.lineTo(23+10,-3.5);cx.lineTo(23+10,1.5);cx.closePath();cx.fill();
    cx.fillStyle='#ec4899'; // 분홍 깃털
    cx.beginPath();cx.moveTo(strX-1,-1);cx.lineTo(strX-7,-4.5);cx.lineTo(strX-4,-1);cx.lineTo(strX-7,2.5);cx.closePath();cx.fill();
  }
  // 플레이어 머리 위 HP바
  const phbW=44,phbH=6,phbX=sx-phbW/2,phbY=sy-CFG_PR-22;
  cx.fillStyle='rgba(0,0,0,.6)';cx.beginPath();cx.roundRect(phbX,phbY,phbW,phbH,phbH/2);cx.fill();
  const pHpPct=g.php/g.maxHp;
  cx.fillStyle=pHpPct>.5?'#4ade80':pHpPct>.25?'#facc15':'#f87171';
  cx.beginPath();cx.roundRect(phbX,phbY,phbW*pHpPct,phbH,phbH/2);cx.fill();
  cx.restore();
}

// ══════════════════════════════════════════
//  DRAW MONSTERS — 7종 다크 판타지
// ══════════════════════════════════════════
function drawMonster(g,m){
  const sx=m.wx-g.camX,sy=m.wy-g.camY;
  if(sx<-80||sx>W+80||sy<-80||sy>H+80)return;
  const{r,type,anim,boss}=m;
  const bob=Math.sin(anim*.1)*2.5;
  const sl=m.slow>0;
  // 걷기 사이클 — 이동 중이면 흔들, 아니면 0
  const walk=Math.sin(anim*.22); // -1~1 반복
  const walk2=Math.sin(anim*.22+Math.PI); // 반대 위상

  cx.save();cx.translate(sx,sy+bob);
  // shadow
  cx.beginPath();cx.ellipse(0,r-2,r*.65,r*.2,0,0,Math.PI*2);
  cx.fillStyle='rgba(0,0,0,.3)';cx.fill();

  if(type==='ghoul'){
    // 구울: 녹색 부패한 좀비 느낌
    cx.beginPath();cx.ellipse(0,0,r*.85,r,0,0,Math.PI*2);
    cx.fillStyle=sl?'#93c5fd':'#2d5a3a';cx.fill();
    cx.strokeStyle=sl?'#3b82f6':'#1a3d26';cx.lineWidth=1.5;cx.stroke();
    // 갈비뼈 선
    cx.strokeStyle='rgba(0,0,0,.4)';cx.lineWidth=1;
    [-r*.3,-r*.1,r*.1,r*.3].forEach(ly=>{
      cx.beginPath();cx.moveTo(-r*.6,ly);cx.lineTo(r*.6,ly);cx.stroke();
    });
    // 머리
    cx.beginPath();cx.arc(0,-r*.7,r*.5,0,Math.PI*2);cx.fillStyle='#3a6b48';cx.fill();
    // 눈
    cx.fillStyle='#b8ff94';
    cx.beginPath();cx.ellipse(-r*.22,-r*.75,r*.15,r*.12,-.2,0,Math.PI*2);cx.fill();
    cx.beginPath();cx.ellipse(r*.22,-r*.75,r*.15,r*.12,.2,0,Math.PI*2);cx.fill();
    cx.fillStyle='#1a3d00';
    cx.beginPath();cx.arc(-r*.22,-r*.75,r*.07,0,Math.PI*2);cx.fill();
    cx.beginPath();cx.arc(r*.22,-r*.75,r*.07,0,Math.PI*2);cx.fill();
    // 입 (날카로운 이빨)
    cx.strokeStyle='#1a3d26';cx.lineWidth=1.2;
    cx.beginPath();cx.moveTo(-r*.25,-r*.55);cx.lineTo(r*.25,-r*.55);cx.stroke();
    cx.fillStyle='#eee';
    [-.2,-.07,.06,.19].forEach(tx=>{
      cx.beginPath();cx.moveTo(r*tx,-r*.55);cx.lineTo(r*(tx+.06),-r*.45);cx.lineTo(r*(tx+.13),-r*.55);cx.fill();
    });
    // 팔 — walk 위상으로 앞뒤 스윙
    const gArmL=walk*r*.35, gArmR=walk2*r*.35;
    cx.strokeStyle='#2d5a3a';cx.lineWidth=4;cx.lineCap='round';
    cx.beginPath();cx.moveTo(-r*.7,-r*.1);cx.lineTo(-r*.9+gArmL,r*.3+gArmL*.3);cx.stroke();
    cx.beginPath();cx.moveTo(r*.7,-r*.1);cx.lineTo(r*.9+gArmR,r*.3+gArmR*.3);cx.stroke();
    // 발톱
    cx.strokeStyle='#c8e6c9';cx.lineWidth=1.5;
    const gClawLx=-r*.9+gArmL, gClawLy=r*.3+gArmL*.3;
    const gClawRx=r*.9+gArmR,  gClawRy=r*.3+gArmR*.3;
    [[gClawLx,gClawLy,-1],[gClawRx,gClawRy,1]].forEach(([cx2,cy2,s])=>{
      cx.beginPath();cx.moveTo(cx2,cy2);cx.lineTo(cx2+s*r*.2,cy2-r*.2);cx.stroke();
      cx.beginPath();cx.moveTo(cx2,cy2);cx.lineTo(cx2+s*r*.05,cy2+r*.2);cx.stroke();
    });
    // 다리 — 반대 위상
    cx.strokeStyle='#2d5a3a';cx.lineWidth=5;cx.lineCap='round';
    const gLegLy=r*.8+walk*r*.2,  gLegRy=r*.8+walk2*r*.2;
    const gLegLx=walk*r*.15,      gLegRx=walk2*r*.15;
    cx.beginPath();cx.moveTo(-r*.3,r*.4);cx.lineTo(-r*.35+gLegLx,gLegLy);cx.stroke();
    cx.beginPath();cx.moveTo(r*.3,r*.4);cx.lineTo(r*.35+gLegRx,gLegRy);cx.stroke();
    // 발
    cx.fillStyle='#2d5a3a';
    cx.beginPath();cx.ellipse(-r*.35+gLegLx,gLegLy+r*.05,r*.18,r*.1,gLegLx*.05,0,Math.PI*2);cx.fill();
    cx.beginPath();cx.ellipse(r*.35+gLegRx,gLegRy+r*.05,r*.18,r*.1,gLegRx*.05,0,Math.PI*2);cx.fill();

  } else if(type==='wraith'){
    // 망령: 반투명 보라, 아지랑이처럼 아래가 흐릿
    const wg=cx.createRadialGradient(0,-r*.2,r*.1,0,r*.3,r*1.2);
    wg.addColorStop(0,sl?'rgba(100,100,255,.85)':'rgba(120,60,180,.85)');
    wg.addColorStop(.6,sl?'rgba(60,60,200,.5)':'rgba(80,30,140,.5)');
    wg.addColorStop(1,'rgba(40,10,80,0)');
    cx.fillStyle=wg;cx.beginPath();cx.ellipse(0,0,r,r*1.3,0,0,Math.PI*2);cx.fill();
    // 몸 물결
    cx.strokeStyle=sl?'rgba(150,150,255,.3)':'rgba(180,100,255,.3)';cx.lineWidth=1;
    for(let i=0;i<4;i++){
      const wy2=r*.2+i*r*.25;
      cx.beginPath();cx.moveTo(-r*.7,wy2);
      cx.quadraticCurveTo(-r*.2,wy2-r*.1+Math.sin(anim*.08+i)*(r*.06),r*.7,wy2);cx.stroke();
    }
    // 눈 (3개)
    cx.fillStyle=sl?'#93c5fd':'#e879f9';cx.shadowColor=sl?'#60a5fa':'#e879f9';cx.shadowBlur=10;
    [[-r*.3,-r*.4],[0,-r*.55],[r*.3,-r*.4]].forEach(([ex,ey])=>{
      cx.beginPath();cx.arc(ex,ey,r*.12,0,Math.PI*2);cx.fill();
    });
    cx.shadowBlur=0;
    // 손 (작은 클로)
    cx.strokeStyle=sl?'rgba(100,100,255,.6)':'rgba(180,100,255,.6)';cx.lineWidth=2;cx.lineCap='round';
    [[-r*.8,r*.1],[ r*.8,r*.1]].forEach(([hx,hy])=>{
      cx.beginPath();cx.moveTo(hx,hy);cx.lineTo(hx-r*.2*Math.sign(hx),hy-r*.15);cx.stroke();
      cx.beginPath();cx.moveTo(hx,hy);cx.lineTo(hx-r*.25*Math.sign(hx),hy+r*.05);cx.stroke();
    });

  } else if(type==='vampire'){
    // 뱀파이어: 창백한 얼굴, 망토, 뾰족 귀
    // 망토
    cx.fillStyle=sl?'#1e40af':'#1a0808';
    cx.beginPath();cx.moveTo(-r*.7,-r*.3);cx.lineTo(-r,r);cx.lineTo(r,r);cx.lineTo(r*.7,-r*.3);cx.closePath();cx.fill();
    cx.fillStyle=sl?'#1e3a8a':'#0f0404';
    cx.beginPath();cx.moveTo(-r*.5,-r*.3);cx.lineTo(-r*.6,r*.8);cx.lineTo(r*.6,r*.8);cx.lineTo(r*.5,-r*.3);cx.closePath();cx.fill();
    // 몸
    cx.beginPath();cx.ellipse(0,-r*.1,r*.5,r*.55,0,0,Math.PI*2);cx.fillStyle='#2d0808';cx.fill();
    // 흰 셔츠
    cx.beginPath();cx.ellipse(0,-r*.15,r*.3,r*.35,0,0,Math.PI*2);cx.fillStyle='#e8ddd0';cx.fill();
    // 머리
    cx.beginPath();cx.arc(0,-r*.75,r*.45,0,Math.PI*2);cx.fillStyle='#d4b8b8';cx.fill();
    // 뾰족 귀
    cx.fillStyle='#c0a0a0';
    cx.beginPath();cx.moveTo(-r*.38,-r*.82);cx.lineTo(-r*.55,-r*1.15);cx.lineTo(-r*.22,-r*.9);cx.closePath();cx.fill();
    cx.beginPath();cx.moveTo(r*.38,-r*.82);cx.lineTo(r*.55,-r*1.15);cx.lineTo(r*.22,-r*.9);cx.closePath();cx.fill();
    // 눈
    cx.fillStyle=sl?'#93c5fd':'#dc2626';cx.shadowColor=sl?'#60a5fa':'#dc2626';cx.shadowBlur=8;
    cx.beginPath();cx.ellipse(-r*.18,-r*.78,r*.1,r*.07,0,0,Math.PI*2);cx.fill();
    cx.beginPath();cx.ellipse(r*.18,-r*.78,r*.1,r*.07,0,0,Math.PI*2);cx.fill();
    cx.shadowBlur=0;
    // 송곳니
    cx.fillStyle='#fff';
    cx.beginPath();cx.moveTo(-r*.08,-r*.59);cx.lineTo(-r*.04,-r*.48);cx.lineTo(0,-r*.59);cx.fill();
    cx.beginPath();cx.moveTo(0,-r*.59);cx.lineTo(r*.04,-r*.48);cx.lineTo(r*.08,-r*.59);cx.fill();
    // 피 방울
    cx.fillStyle='#dc2626';
    cx.beginPath();cx.arc(-r*.04,-r*.46,r*.04,0,Math.PI*2);cx.fill();
    // 팔 — 망토 밖으로 나온 창백한 손
    cx.strokeStyle=sl?'#93c5fd':'#c8a0a0';cx.lineWidth=3;cx.lineCap='round';
    const vArmL=walk*r*.25, vArmR=walk2*r*.25;
    cx.beginPath();cx.moveTo(-r*.65,r*.1);cx.lineTo(-r*.85+vArmL,r*.55);cx.stroke();
    cx.beginPath();cx.moveTo(r*.65,r*.1);cx.lineTo(r*.85+vArmR,r*.55);cx.stroke();
    cx.fillStyle=sl?'#bfdbfe':'#d4b8b8';
    cx.beginPath();cx.arc(-r*.85+vArmL,r*.55,r*.1,0,Math.PI*2);cx.fill();
    cx.beginPath();cx.arc(r*.85+vArmR,r*.55,r*.1,0,Math.PI*2);cx.fill();
    // 다리 (망토 밑단에서 살짝 나옴)
    cx.strokeStyle=sl?'#1e40af':'#1a0808';cx.lineWidth=4;cx.lineCap='round';
    cx.beginPath();cx.moveTo(-r*.25,r*.75);cx.lineTo(-r*.3+walk*r*.12,r*1.05);cx.stroke();
    cx.beginPath();cx.moveTo(r*.25,r*.75);cx.lineTo(r*.3+walk2*r*.12,r*1.05);cx.stroke();

  } else if(type==='crawler'){
    // 크롤러: 거미처럼 낮고 빠름, 다리 8개
    const legAng=Math.sin(anim*.3);
    cx.fillStyle=sl?'#374151':'#1c0f05';
    // 몸통
    cx.beginPath();cx.ellipse(0,0,r*.9,r*.7,0,0,Math.PI*2);cx.fill();
    cx.fillStyle=sl?'#4b5563':'#2d1a08';
    cx.beginPath();cx.ellipse(-r*.2,0,r*.5,r*.45,0,0,Math.PI*2);cx.fill();
    // 머리
    cx.beginPath();cx.arc(r*.5,0,r*.35,0,Math.PI*2);cx.fillStyle=sl?'#374151':'#1c0f05';cx.fill();
    // 눈 (6개)
    cx.fillStyle=sl?'#93c5fd':'#ef4444';cx.shadowColor=sl?'#60a5fa':'#ef4444';cx.shadowBlur=6;
    [[r*.38,-r*.12],[r*.55,-r*.08],[r*.38,r*.08]].forEach(([ex,ey],i)=>{
      cx.beginPath();cx.arc(ex,ey,r*.07,0,Math.PI*2);cx.fill();
      cx.beginPath();cx.arc(ex,ey+r*.18,r*.06,0,Math.PI*2);cx.fill();
    });
    cx.shadowBlur=0;
    // 다리 8개
    cx.strokeStyle=sl?'#6b7280':'#3d2008';cx.lineWidth=2;cx.lineCap='round';
    for(let i=0;i<4;i++){
      const ang=(i/4-.5)*Math.PI*.9;
      const swing=(i%2===0?1:-1)*legAng*8;
      cx.beginPath();cx.moveTo(-r*.1,0);
      cx.lineTo(-r*.1+Math.cos(ang+Math.PI)*(r*.6), Math.sin(ang+Math.PI)*r*.5+swing);
      cx.lineTo(-r*.1+Math.cos(ang+Math.PI)*(r*1.1), Math.sin(ang+Math.PI)*r*.4+swing*1.5);
      cx.stroke();
      cx.beginPath();cx.moveTo(-r*.1,0);
      cx.lineTo(-r*.1+Math.cos(-ang)*(r*.6), Math.sin(-ang)*r*.5-swing);
      cx.lineTo(-r*.1+Math.cos(-ang)*(r*1.1), Math.sin(-ang)*r*.4-swing*1.5);
      cx.stroke();
    }
    // 독침
    cx.strokeStyle=sl?'#86efac':'#65a30d';cx.lineWidth=2;
    cx.beginPath();cx.moveTo(-r*.8,0);cx.lineTo(-r*1.2,-r*.3);cx.stroke();
    cx.fillStyle=sl?'#86efac':'#65a30d';
    cx.beginPath();cx.moveTo(-r*1.25,-r*.35);cx.lineTo(-r*1.1,-r*.2);cx.lineTo(-r*1.05,-r*.38);cx.closePath();cx.fill();

  } else if(type==='revenant'){
    // 리버넌트: 갑옷 입은 망자
    // 갑옷
    cx.fillStyle=sl?'#1e3a8a':'#0d0d1a';
    cx.beginPath();cx.ellipse(0,0,r*.8,r,0,0,Math.PI*2);cx.fill();
    cx.strokeStyle=sl?'#3b82f6':'#1e1e4a';cx.lineWidth=2;cx.stroke();
    // 갑옷 줄무늬
    cx.strokeStyle=sl?'rgba(100,150,255,.3)':'rgba(50,50,120,.5)';cx.lineWidth=1.5;
    cx.beginPath();cx.moveTo(-r*.5,-r*.5);cx.lineTo(-r*.5,r*.5);cx.stroke();
    cx.beginPath();cx.moveTo(r*.5,-r*.5);cx.lineTo(r*.5,r*.5);cx.stroke();
    cx.beginPath();cx.moveTo(-r*.5,0);cx.lineTo(r*.5,0);cx.stroke();
    // 투구
    cx.beginPath();cx.arc(0,-r*.65,r*.42,0,Math.PI*2);cx.fillStyle=sl?'#1e40af':'#10102a';cx.fill();
    cx.strokeStyle=sl?'#3b82f6':'#2020508';cx.lineWidth=1.5;cx.stroke();
    // 투구 바이저 (눈 슬릿)
    cx.fillStyle=sl?'#60a5fa':'#6366f1';cx.shadowColor=sl?'#60a5fa':'#6366f1';cx.shadowBlur=12;
    cx.fillRect(-r*.25,-r*.7,r*.18,r*.06);cx.fillRect(r*.07,-r*.7,r*.18,r*.06);
    cx.shadowBlur=0;
    // 어깨 갑옷
    cx.fillStyle=sl?'#1e3a8a':'#12122e';
    cx.beginPath();cx.ellipse(-r*.75,-r*.15,r*.3,r*.22,-.3,0,Math.PI*2);cx.fill();
    cx.beginPath();cx.ellipse(r*.75,-r*.15,r*.3,r*.22,.3,0,Math.PI*2);cx.fill();
    // 팔 — 왼팔 스윙
    cx.fillStyle=sl?'#1e3a8a':'#0d0d1a';
    cx.beginPath();cx.ellipse(-r*.75+walk*r*.15,-r*.15,r*.28,r*.2,-.3+walk*.2,0,Math.PI*2);cx.fill();
    cx.strokeStyle=sl?'#3b82f6':'#1e1e4a';cx.lineWidth=1.5;cx.stroke();
    // 검 팔 — anim으로 찌르는 동작
    const swordSwing=walk*r*.12;
    cx.strokeStyle='#8892b0';cx.lineWidth=3;cx.lineCap='round';
    cx.beginPath();cx.moveTo(r*.6,-r*.3+swordSwing);cx.lineTo(r*.9,r*.4+swordSwing);cx.stroke();
    cx.strokeStyle='#92400e';cx.lineWidth=5;
    cx.beginPath();cx.moveTo(r*.65,-r*.05+swordSwing);cx.lineTo(r*.98,-r*.05+swordSwing);cx.stroke();
    // 다리
    cx.fillStyle=sl?'#1e3a8a':'#0d0d1a';
    cx.beginPath();cx.ellipse(-r*.3+walk*r*.15,r*.85,r*.22,r*.3,walk*.15,0,Math.PI*2);cx.fill();
    cx.beginPath();cx.ellipse(r*.3+walk2*r*.15,r*.85,r*.22,r*.3,walk2*.15,0,Math.PI*2);cx.fill();
    cx.strokeStyle=sl?'#3b82f6':'#1e1e4a';cx.lineWidth=1;cx.stroke();

  } else if(type==='golem'){
    // 골렘: 거대한 바위 몬스터
    cx.fillStyle=sl?'#374151':'#1a1a1a';
    cx.beginPath();cx.ellipse(0,0,r*.95,r,0,0,Math.PI*2);cx.fill();
    // 바위 텍스처 (불규칙 다각형들)
    cx.fillStyle=sl?'#4b5563':'#252525';
    const cracks=[[-r*.3,-r*.4,r*.25,r*.3],[r*.1,-r*.5,-r*.2,r*.2],[r*.3,r*.1,-r*.1,-r*.3]];
    cracks.forEach(([x1,y1,x2,y2])=>{
      cx.beginPath();cx.moveTo(x1,y1);cx.lineTo((x1+x2)/2+r*.1,(y1+y2)/2);cx.lineTo(x2,y2);cx.stroke();
    });
    cx.strokeStyle=sl?'#6b7280':'#333';cx.lineWidth=1.5;
    // 이끼
    cx.fillStyle=sl?'#4b5563':'#1a3020';
    [[r*.2,-r*.6],[- r*.3,r*.2],[r*.4,r*.3]].forEach(([mx,my])=>{
      cx.beginPath();cx.ellipse(mx,my,r*.15,r*.1,Math.random(),0,Math.PI*2);cx.fill();
    });
    // 눈 (바위 틈새의 빛)
    cx.fillStyle=sl?'#93c5fd':'#f97316';cx.shadowColor=sl?'#60a5fa':'#f97316';cx.shadowBlur=15;
    cx.beginPath();cx.ellipse(-r*.28,-r*.25,r*.15,r*.1,-.1,0,Math.PI*2);cx.fill();
    cx.beginPath();cx.ellipse(r*.28,-r*.25,r*.15,r*.1,.1,0,Math.PI*2);cx.fill();
    cx.shadowBlur=0;
    // 입 균열
    cx.strokeStyle='rgba(0,0,0,.8)';cx.lineWidth=2;
    cx.beginPath();cx.moveTo(-r*.3,r*.15);cx.lineTo(-r*.1,r*.2);cx.lineTo(r*.1,r*.18);cx.lineTo(r*.3,r*.15);cx.stroke();
    // 팔 — 묵직하게 느리게 스윙 (walk*.5)
    const gArmSwingL=walk*r*.2, gArmSwingR=walk2*r*.2;
    cx.fillStyle=sl?'#374151':'#1a1a1a';
    cx.beginPath();cx.ellipse(-r*1.05,r*.1+gArmSwingL,r*.3,r*.22,-.4+walk*.1,0,Math.PI*2);cx.fill();
    cx.strokeStyle=sl?'#6b7280':'#282828';cx.lineWidth=1.5;cx.stroke();
    cx.beginPath();cx.ellipse(r*1.05,r*.1+gArmSwingR,r*.3,r*.22,.4+walk2*.1,0,Math.PI*2);cx.fill();
    cx.strokeStyle=sl?'#6b7280':'#282828';cx.lineWidth=1.5;cx.stroke();
    // 주먹
    cx.fillStyle=sl?'#4b5563':'#252525';
    cx.beginPath();cx.arc(-r*1.1,r*.38+gArmSwingL,r*.2,0,Math.PI*2);cx.fill();
    cx.beginPath();cx.arc(r*1.1,r*.38+gArmSwingR,r*.2,0,Math.PI*2);cx.fill();
    // 다리 (짧고 굵게)
    cx.fillStyle=sl?'#374151':'#1a1a1a';
    cx.beginPath();cx.ellipse(-r*.3+walk*r*.1,r*.9,r*.28,r*.35,walk*.1,0,Math.PI*2);cx.fill();
    cx.beginPath();cx.ellipse(r*.3+walk2*r*.1,r*.9,r*.28,r*.35,walk2*.1,0,Math.PI*2);cx.fill();

  } else if(type==='lich'){
    // 리치: 마법사형 언데드 (보스도 동일 타입)
    const sc=boss?1:1;
    cx.save();if(boss){const p=.94+Math.sin(anim*.06)*.06;cx.scale(p,p);}

    // 보스 오라
    if(boss){
      const aura=cx.createRadialGradient(0,0,r*.3,0,0,r*2);
      aura.addColorStop(0,'rgba(100,0,160,.3)');aura.addColorStop(1,'rgba(60,0,100,0)');
      cx.fillStyle=aura;cx.beginPath();cx.arc(0,0,r*2,0,Math.PI*2);cx.fill();
    }

    // 로브
    const robeFill=sl?'#1e3a8a':'#150520';
    cx.beginPath();
    cx.moveTo(-r*.5,-r*.4);cx.lineTo(-r*.7,r*.6);cx.quadraticCurveTo(0,r*.9,r*.7,r*.6);cx.lineTo(r*.5,-r*.4);
    cx.quadraticCurveTo(0,-r*.7,-r*.5,-r*.4);cx.fillStyle=robeFill;cx.fill();
    // 로브 문양
    cx.strokeStyle=sl?'rgba(100,150,255,.4)':'rgba(120,50,200,.5)';cx.lineWidth=1;
    cx.beginPath();cx.moveTo(-r*.3,0);cx.lineTo(0,-r*.3);cx.lineTo(r*.3,0);cx.lineTo(0,r*.3);cx.closePath();cx.stroke();

    // 두개골 얼굴
    cx.beginPath();cx.arc(0,-r*.6,r*.4,0,Math.PI*2);cx.fillStyle='#c8c0b0';cx.fill();
    cx.strokeStyle='#8a8070';cx.lineWidth=1.2;cx.stroke();
    // 눈 소켓 — 어두운 구멍
    cx.fillStyle='#000';
    cx.beginPath();cx.ellipse(-r*.17,-r*.65,r*.14,r*.18,-.1,0,Math.PI*2);cx.fill();
    cx.beginPath();cx.ellipse(r*.17,-r*.65,r*.14,r*.18,.1,0,Math.PI*2);cx.fill();
    // 눈 불꽃
    cx.fillStyle=sl?'#93c5fd':'#a855f7';cx.shadowColor=sl?'#60a5fa':'#a855f7';cx.shadowBlur=14;
    cx.beginPath();cx.arc(-r*.17,-r*.65,r*.07,0,Math.PI*2);cx.fill();
    cx.beginPath();cx.arc(r*.17,-r*.65,r*.07,0,Math.PI*2);cx.fill();
    cx.shadowBlur=0;
    // 코뼈
    cx.strokeStyle='#8a8070';cx.lineWidth=1;
    cx.beginPath();cx.moveTo(-r*.05,-r*.55);cx.lineTo(0,-r*.48);cx.lineTo(r*.05,-r*.55);cx.stroke();
    // 이빨
    cx.fillStyle='#d0c8b8';
    [-.22,-.1,.02,.14].forEach(tx=>{
      cx.beginPath();cx.moveTo(r*tx,-r*.42);cx.lineTo(r*(tx+.05),-r*.34);cx.lineTo(r*(tx+.1),-r*.42);cx.fill();
    });
    // 왕관 (보스)
    if(boss){
      cx.fillStyle='#fde68a';cx.strokeStyle='#f59e0b';cx.lineWidth=1.5;
      const cy=-r*1.08,cw=r*.55;
      cx.beginPath();cx.moveTo(-cw,cy+8);
      [-cw,-cw*.5,0,cw*.5,cw].forEach((bx,i)=>{if(i%2===0)cx.lineTo(bx,cy);else cx.lineTo(bx,cy+8);});
      cx.lineTo(cw,cy+8);cx.closePath();cx.fill();cx.stroke();
      ['#f87171','#a855f7','#38bdf8'].forEach((gc,i)=>{
        cx.fillStyle=gc;cx.beginPath();cx.arc(-cw*.5+i*cw*.5,cy+3,3.5,0,Math.PI*2);cx.fill();
      });
    }
    // 왼팔 — 뼈 팔, 주문 제스처
    const lichArmL=walk*r*.18;
    cx.strokeStyle=sl?'#93c5fd':'#c8c0b0';cx.lineWidth=2.5;cx.lineCap='round';
    cx.beginPath();cx.moveTo(-r*.45,-r*.1);cx.lineTo(-r*.75+lichArmL,r*.3+lichArmL*.2);cx.stroke();
    cx.beginPath();cx.moveTo(-r*.75+lichArmL,r*.3+lichArmL*.2);cx.lineTo(-r*.9+lichArmL*1.5,r*.55+lichArmL*.1);cx.stroke();
    // 손가락 (3개)
    cx.lineWidth=1.2;
    [-1,0,1].forEach(fi=>{
      cx.beginPath();cx.moveTo(-r*.9+lichArmL*1.5,r*.55+lichArmL*.1);
      cx.lineTo(-r*.9+lichArmL*1.5+fi*r*.08,r*.72+lichArmL*.05);cx.stroke();
    });
    // 마법 지팡이 — walk로 약간 기울어짐
    const staffSwing=walk*r*.1;
    cx.strokeStyle='#5b21b6';cx.lineWidth=3;cx.lineCap='round';
    cx.beginPath();cx.moveTo(r*.5,-r*.2+staffSwing);cx.lineTo(r*.7,r*.5+staffSwing);cx.stroke();
    cx.fillStyle='#a855f7';cx.shadowColor='#a855f7';cx.shadowBlur=12;
    cx.beginPath();cx.arc(r*.48,-r*.24+staffSwing,r*.12,0,Math.PI*2);cx.fill();
    cx.shadowBlur=0;
    // 마법 파티클 효과 (anim 기반)
    if(boss){
      for(let i=0;i<4;i++){
        const pa=anim*.07+i*Math.PI*.5;
        const pr=r*1.4;
        cx.fillStyle=['#a855f7','#7c3aed','#e879f9','#fde68a'][i];
        cx.globalAlpha=.6+Math.sin(anim*.1+i)*.3;
        cx.beginPath();cx.arc(Math.cos(pa)*pr,Math.sin(pa)*pr,4,0,Math.PI*2);cx.fill();
      }
      cx.globalAlpha=1;
    }
    cx.restore();
  }

  // 슬로우 얼음 오버레이
  if(m.slow>0){
    cx.globalAlpha=Math.min(.35,m.slow/200*.35);
    cx.fillStyle='#bfdbfe';
    cx.beginPath();cx.arc(0,0,r+3,0,Math.PI*2);cx.fill();
    cx.globalAlpha=1;
  }

  if(type==='spitter'){
    const sl2=m.slow>0;
    // 몸통 - 녹색 독뱀
    cx.beginPath();cx.ellipse(0,0,r*.9,r,0,0,Math.PI*2);
    cx.fillStyle=sl2?'#93c5fd':'#1e4d0a';cx.fill();
    cx.strokeStyle=sl2?'#3b82f6':'#166534';cx.lineWidth=1.5;cx.stroke();
    // 비늘 무늬
    cx.save();cx.beginPath();cx.ellipse(0,0,r*.9,r,0,0,Math.PI*2);cx.clip();
    cx.strokeStyle='rgba(74,222,128,.25)';cx.lineWidth=1.2;
    for(let i=-1;i<=1;i++){
      cx.beginPath();cx.arc(i*r*.4,0,r*.38,0,Math.PI);cx.stroke();
      cx.beginPath();cx.arc(i*r*.4,r*.5,r*.28,Math.PI,Math.PI*2);cx.stroke();
    }
    cx.restore();
    // 독 주머니 (배)
    cx.beginPath();cx.ellipse(0,r*.18,r*.48,r*.3,0,0,Math.PI*2);
    cx.fillStyle='rgba(134,239,172,.2)';cx.fill();
    // 눈
    [[-r*.36,-r*.28],[r*.36,-r*.28]].forEach(([ex,ey])=>{
      cx.beginPath();cx.ellipse(ex,ey,r*.2,r*.25,0,0,Math.PI*2);cx.fillStyle='#fef08a';cx.fill();
      cx.beginPath();cx.ellipse(ex,ey,r*.08,r*.15,0,0,Math.PI*2);cx.fillStyle='#14532d';cx.fill();
      cx.fillStyle='rgba(255,255,255,.55)';cx.beginPath();cx.arc(ex+r*.05,ey-r*.05,r*.05,0,Math.PI*2);cx.fill();
    });
    // 짧은 팔다리 (4개, 옆에서 버둥)
    cx.strokeStyle=sl?'#86efac':'#166534';cx.lineWidth=3;cx.lineCap='round';
    const spLeg=walk*r*.2;
    [[-r*.7,-r*.3],[-r*.7,r*.2],[r*.7,-r*.3],[r*.7,r*.2]].forEach(([lx,ly],i)=>{
      const sw=(i%2===0?walk:walk2)*r*.25;
      cx.beginPath();cx.moveTo(lx,ly);cx.lineTo(lx+(lx>0?1:-1)*r*.4+sw,ly+r*.35);cx.stroke();
    });
    // 갈라진 혀
    cx.strokeStyle='#fb7185';cx.lineWidth=1.6;cx.lineCap='round';
    const tongueWag=Math.sin(anim*.4)*r*.06;
    cx.beginPath();cx.moveTo(0,r*.78);cx.lineTo(0,r*1.12);cx.stroke();
    cx.beginPath();cx.moveTo(0,r*1.12);cx.lineTo(-r*.2+tongueWag,r*1.32);cx.stroke();
    cx.beginPath();cx.moveTo(0,r*1.12);cx.lineTo(r*.2+tongueWag,r*1.32);cx.stroke();
    // 발사 직전 독 차오름
    if(m.mShootCd<20){
      const charge=1-(m.mShootCd/20);
      cx.globalAlpha=charge*.8;
      cx.fillStyle='#4ade80';cx.shadowColor='#4ade80';cx.shadowBlur=10;
      cx.beginPath();cx.arc(0,r*.75,r*.25*charge+3,0,Math.PI*2);cx.fill();
      cx.shadowBlur=0;cx.globalAlpha=1;
    }
  }

  // 피격 플래시
  if(m.hitFlash>0){
    m.hitFlash--;
    cx.globalAlpha=m.hitFlash/10*0.7;
    cx.fillStyle='#ffffff';
    cx.beginPath();cx.ellipse(0,0,r,r*1.1,0,0,Math.PI*2);cx.fill();
    cx.globalAlpha=1;
  }

  // HP 바 (항상 표시)
  {
    const bw=r*2.3,bh=boss?7:4,bx=-r*1.15,by=-r-(boss?22:15);
    cx.fillStyle='rgba(0,0,0,.55)';cx.beginPath();cx.roundRect(bx,by,bw,bh,bh/2);cx.fill();
    const pct=m.hp/m.maxHp;
    cx.fillStyle=pct>.5?'#4ade80':pct>.25?'#facc15':'#f87171';
    cx.beginPath();cx.roundRect(bx,by,bw*pct,bh,bh/2);cx.fill();
  }
  cx.restore();
}

// ══════════════════════════════════════════
//  DRAW WORLD ITEM
// ══════════════════════════════════════════
function drawWorldItem(it,sx,sy){
  const def=ITEM_DEFS[it.key];
  const bob=Math.sin(it.bob)*5;
  const pulse=Math.sin(it.bob*1.3);      // 0.3초 주기 맥박
  const spin=it.bob*0.7;                  // 공전 각도
  const col=def.color;
  cx.save();cx.translate(sx,sy+bob);

  // ── 외부 오라 (맥박) ──
  const oraR=28+pulse*5;
  const ora=cx.createRadialGradient(0,0,8,0,0,oraR);
  ora.addColorStop(0,col+'44');ora.addColorStop(.6,col+'18');ora.addColorStop(1,col+'00');
  cx.fillStyle=ora;cx.beginPath();cx.arc(0,0,oraR,0,Math.PI*2);cx.fill();

  // ── 공전 별빛 파티클 4개 ──
  cx.save();
  for(let i=0;i<4;i++){
    const a=spin+i*Math.PI*.5;
    const pr=20+pulse*3;
    const starX=Math.cos(a)*pr, starY=Math.sin(a)*pr;
    const starAlpha=0.5+Math.sin(it.bob+i*1.2)*.4;
    cx.globalAlpha=starAlpha;
    cx.fillStyle=col;
    cx.shadowColor=col;cx.shadowBlur=8;
    // 작은 마름모 별
    cx.save();cx.translate(starX,starY);cx.rotate(a+spin*.5);
    const ss=2.5+pulse*.8;
    cx.beginPath();cx.moveTo(0,-ss);cx.lineTo(ss*.5,0);cx.lineTo(0,ss);cx.lineTo(-ss*.5,0);cx.closePath();cx.fill();
    cx.restore();
  }
  cx.shadowBlur=0;cx.globalAlpha=1;cx.restore();

  // ── 아이템별 전용 링 효과 ──
  const ringR=22+pulse*1.5;
  if(it.key==='explosive'){
    // 폭발: 톱니 링
    cx.strokeStyle=col;cx.lineWidth=1.5;cx.globalAlpha=.7;
    cx.save();cx.rotate(spin*.3);
    cx.beginPath();
    for(let i=0;i<12;i++){
      const a=i/12*Math.PI*2;
      const r2=i%2===0?ringR:ringR-5;
      i===0?cx.moveTo(Math.cos(a)*r2,Math.sin(a)*r2):cx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);
    }
    cx.closePath();cx.stroke();cx.restore();
    cx.globalAlpha=1;
  } else if(it.key==='shield'){
    // 보호막: 육각형 링
    cx.strokeStyle=col;cx.lineWidth=2;cx.globalAlpha=.65+pulse*.2;
    cx.save();cx.rotate(spin*.15);
    cx.beginPath();
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2;i===0?cx.moveTo(Math.cos(a)*ringR,Math.sin(a)*ringR):cx.lineTo(Math.cos(a)*ringR,Math.sin(a)*ringR);}
    cx.closePath();cx.shadowColor=col;cx.shadowBlur=6;cx.stroke();
    cx.shadowBlur=0;cx.restore();cx.globalAlpha=1;
  } else if(it.key==='pierce'){
    // 관통: 번개 링
    cx.strokeStyle=col;cx.lineWidth=1.5;cx.globalAlpha=.6+pulse*.3;
    cx.shadowColor=col;cx.shadowBlur=12;
    cx.save();cx.rotate(spin*.2);
    cx.beginPath();cx.arc(0,0,ringR,0,Math.PI*2);cx.setLineDash([6,4]);cx.stroke();
    cx.setLineDash([]);cx.restore();
    cx.shadowBlur=0;cx.globalAlpha=1;
  } else if(it.key==='multi'){
    // 멀티샷: 작은 화살 3개 공전
    cx.save();cx.rotate(spin*.25);
    for(let i=0;i<3;i++){
      const a=i/3*Math.PI*2;
      cx.save();cx.translate(Math.cos(a)*ringR,Math.sin(a)*ringR);cx.rotate(a+Math.PI/2);
      cx.strokeStyle=col;cx.lineWidth=1.5;cx.lineCap='round';
      cx.beginPath();cx.moveTo(0,-5);cx.lineTo(0,5);cx.stroke();
      cx.fillStyle=col;cx.beginPath();cx.moveTo(0,-7);cx.lineTo(-2.5,-3);cx.lineTo(2.5,-3);cx.closePath();cx.fill();
      cx.restore();
    }
    cx.restore();
  } else if(it.key==='rapid'||it.key==='atkspeed'){
    // 연사/공속: 빠르게 회전하는 링
    cx.strokeStyle=col;cx.lineWidth=2;cx.globalAlpha=.55+pulse*.3;
    cx.save();cx.rotate(spin*1.5);
    cx.beginPath();cx.arc(0,0,ringR,0,Math.PI*1.3);cx.shadowColor=col;cx.shadowBlur=8;cx.stroke();
    cx.rotate(Math.PI);
    cx.beginPath();cx.arc(0,0,ringR,0,Math.PI*.7);cx.stroke();
    cx.shadowBlur=0;cx.restore();cx.globalAlpha=1;
  } else if(it.key==='speed'){
    // 이속: 물결 링
    cx.strokeStyle=col;cx.lineWidth=1.5;cx.globalAlpha=.6+pulse*.25;
    cx.save();cx.rotate(spin*.4);
    cx.beginPath();
    for(let i=0;i<=36;i++){
      const a=i/36*Math.PI*2;
      const wr=ringR+Math.sin(a*4+it.bob)*4;
      i===0?cx.moveTo(Math.cos(a)*wr,Math.sin(a)*wr):cx.lineTo(Math.cos(a)*wr,Math.sin(a)*wr);
    }
    cx.closePath();cx.shadowColor=col;cx.shadowBlur=6;cx.stroke();
    cx.shadowBlur=0;cx.restore();cx.globalAlpha=1;
  } else if(it.key==='slow'){
    // 슬로우: 얼음결정 링
    cx.strokeStyle=col;cx.lineWidth=1.2;cx.globalAlpha=.65;
    for(let i=0;i<6;i++){
      const a=i/6*Math.PI*2+spin*.1;
      cx.save();cx.translate(Math.cos(a)*18,Math.sin(a)*18);cx.rotate(a);
      cx.beginPath();cx.moveTo(0,-6);cx.lineTo(0,6);cx.stroke();
      cx.beginPath();cx.moveTo(-3,-2);cx.lineTo(3,2);cx.stroke();
      cx.beginPath();cx.moveTo(3,-2);cx.lineTo(-3,2);cx.stroke();
      cx.restore();
    }
    cx.globalAlpha=1;
  } else {
    // 기본: 반짝이는 원형 링
    cx.strokeStyle=col;cx.lineWidth=2;cx.globalAlpha=.5+pulse*.3;
    cx.shadowColor=col;cx.shadowBlur=10;
    cx.beginPath();cx.arc(0,0,ringR,0,Math.PI*2);cx.stroke();
    cx.shadowBlur=0;cx.globalAlpha=1;
  }

  // ── 아이콘 배경 원 ──
  cx.shadowColor=col;cx.shadowBlur=20+pulse*8;
  cx.fillStyle='rgba(10,5,25,.9)';cx.strokeStyle=col;cx.lineWidth=2.5;
  cx.beginPath();cx.arc(0,0,18,0,Math.PI*2);cx.fill();cx.stroke();
  cx.shadowBlur=0;

  // ── 아이콘 ──
  cx.font='18px serif';cx.textAlign='center';cx.textBaseline='middle';
  cx.fillText(def.icon,0,1);

  // ── 라벨 ──
  cx.font='bold 9px "Fredoka One",cursive';cx.textBaseline='alphabetic';
  cx.fillStyle=col;cx.globalAlpha=.85;cx.fillText(def.label,0,30);
  cx.globalAlpha=1;cx.textAlign='left';cx.textBaseline='alphabetic';

  // ── 소멸 타이머 호 ──
  if(it.age>600){
    const pct=1-(it.age-600)/600;
    cx.strokeStyle=col+'99';cx.lineWidth=2.5;
    cx.beginPath();cx.arc(0,0,21,-Math.PI/2,-Math.PI/2+Math.PI*2*pct);cx.stroke();
  }

  // ── 빨간 화살표 (위아래 움직임) ──
  const arrowBob=Math.sin(it.bob*2)*5;
  const arrowY=-52+arrowBob;
  cx.save();
  cx.shadowColor='#ef4444';cx.shadowBlur=8;
  cx.fillStyle='#ef4444';
  cx.beginPath();
  cx.moveTo(0,arrowY+14);
  cx.lineTo(-7,arrowY);
  cx.lineTo(-3,arrowY);
  cx.lineTo(-3,arrowY-10);
  cx.lineTo(3,arrowY-10);
  cx.lineTo(3,arrowY);
  cx.lineTo(7,arrowY);
  cx.closePath();
  cx.fill();
  cx.shadowBlur=0;
  cx.restore();

  cx.restore();
}

// ══════════════════════════════════════════
//  DRAW ARROW
// ══════════════════════════════════════════
function drawArrow(g,a){
  const sx=a.wx-g.camX,sy=a.wy-g.camY;
  const def=a.item?ITEM_DEFS[a.item]:null;
  if(def&&def.projectile){
    // 아이템 화살: 아이템 색으로 글로우
    cx.save();cx.translate(sx,sy);
    cx.shadowColor=def.color;cx.shadowBlur=14;
    cx.strokeStyle=def.color+'88';cx.lineWidth=6;cx.lineCap='round';
    cx.beginPath();cx.moveTo(-8,0);cx.lineTo(8,0);cx.stroke();
    cx.shadowBlur=0;cx.restore();
    def.projectile.draw({wx:sx,wy:sy,ang:a.ang});
  } else {
    cx.save();cx.translate(sx,sy);cx.rotate(a.ang);

    // ── 꼬리 잔상 (빛 흔적) ──
    const trailGrad=cx.createLinearGradient(-28,0,-8,0);
    trailGrad.addColorStop(0,'rgba(253,230,138,0)');
    trailGrad.addColorStop(.5,'rgba(253,186,64,.18)');
    trailGrad.addColorStop(1,'rgba(255,220,120,.45)');
    cx.fillStyle=trailGrad;
    cx.beginPath();cx.ellipse(-18,0,10,3,0,0,Math.PI*2);cx.fill();

    // ── 화살 본체 글로우 (외부 번짐) ──
    cx.shadowColor='#fde68a';cx.shadowBlur=10;
    cx.strokeStyle='rgba(253,230,138,.35)';cx.lineWidth=6;cx.lineCap='round';
    cx.beginPath();cx.moveTo(-11,0);cx.lineTo(11,0);cx.stroke();
    cx.shadowBlur=0;

    // ── 화살대 ──
    cx.strokeStyle='#92400e';cx.lineWidth=2.8;cx.lineCap='round';
    cx.beginPath();cx.moveTo(-11,0);cx.lineTo(11,0);cx.stroke();

    // ── 화살촉 ──
    const tipGrad=cx.createLinearGradient(7,0,14,0);
    tipGrad.addColorStop(0,'#a8a29e');tipGrad.addColorStop(1,'#e7e5e4');
    cx.fillStyle=tipGrad;
    cx.shadowColor='#fff';cx.shadowBlur=6;
    cx.beginPath();cx.moveTo(13,0);cx.lineTo(7,-3);cx.lineTo(7,3);cx.closePath();cx.fill();
    cx.shadowBlur=0;

    // ── 깃털 ──
    cx.fillStyle='#dc2626';
    cx.beginPath();cx.moveTo(-11,0);cx.lineTo(-18,-4);cx.lineTo(-14,0);cx.lineTo(-18,4);cx.closePath();cx.fill();
    // 깃털 하이라이트
    cx.fillStyle='rgba(255,160,160,.5)';
    cx.beginPath();cx.moveTo(-12,0);cx.lineTo(-17,-2.5);cx.lineTo(-15,0);cx.closePath();cx.fill();

    // ── 화살 중심 밝은 코어선 ──
    cx.strokeStyle='rgba(255,245,200,.7)';cx.lineWidth=1;cx.lineCap='round';
    cx.beginPath();cx.moveTo(-8,0);cx.lineTo(9,0);cx.stroke();

    cx.restore();
  }
}

// ══════════════════════════════════════════
//  DRAW CURSOR
// ══════════════════════════════════════════
function drawCursor(g){
  const pulse=Math.sin(g.cursorPulse),cr=9+pulse*2;
  const col=g.activeItems.length?ITEM_DEFS[g.activeItems[0].key].color:'rgba(253,230,138,1)';
  cx.save();cx.translate(mx,my);
  cx.strokeStyle=col.replace('1)','0.55)');cx.lineWidth=1.5;cx.beginPath();cx.arc(0,0,cr,0,Math.PI*2);cx.stroke();
  cx.strokeStyle=col.replace('1)','0.7)');cx.lineWidth=1;
  cx.beginPath();cx.moveTo(-15,0);cx.lineTo(-cr-2,0);cx.stroke();
  cx.beginPath();cx.moveTo(15,0);cx.lineTo(cr+2,0);cx.stroke();
  cx.beginPath();cx.moveTo(0,-15);cx.lineTo(0,-cr-2);cx.stroke();
  cx.beginPath();cx.moveTo(0,15);cx.lineTo(0,cr+2);cx.stroke();
  cx.fillStyle=col;cx.beginPath();cx.arc(0,0,2.2,0,Math.PI*2);cx.fill();
  cx.restore();
}

// ══════════════════════════════════════════
//  MINIMAP
// ══════════════════════════════════════════
function drawMinimap(g){
  // 무한맵: 플레이어 중심으로 주변 800px 범위 표시
  const mw=110,mh=80,mx2=W-mw-12,my2=H-mh-12;
  const VIEW=800; // 미니맵이 커버하는 월드 범위
  const scx=mw/VIEW, scy=mh/VIEW;
  // 플레이어가 미니맵 정중앙
  const pcx=mx2+mw/2, pcy=my2+mh/2;
  cx.save();cx.globalAlpha=.75;
  cx.fillStyle='rgba(2,1,16,.90)';cx.strokeStyle='rgba(120,100,220,.25)';cx.lineWidth=1;
  cx.beginPath();cx.roundRect(mx2,my2,mw,mh,6);cx.fill();cx.stroke();
  // 클리핑
  cx.beginPath();cx.roundRect(mx2,my2,mw,mh,6);cx.clip();
  for(const it of g.worldItems){
    if(it.picked)continue;
    const rx=(it.wx-g.wx)*scx, ry=(it.wy-g.wy)*scy;
    if(Math.abs(rx)>mw/2||Math.abs(ry)>mh/2)continue;
    cx.fillStyle=ITEM_DEFS[it.key].color;
    cx.beginPath();cx.arc(pcx+rx,pcy+ry,2.5,0,Math.PI*2);cx.fill();
  }
  for(const m of g.monsters){
    if(m.dead)continue;
    const rx=(m.wx-g.wx)*scx, ry=(m.wy-g.wy)*scy;
    if(Math.abs(rx)>mw/2+4||Math.abs(ry)>mh/2+4)continue;
    cx.fillStyle=m.boss?'#e879f9':'#ef4444';
    cx.beginPath();cx.arc(pcx+rx,pcy+ry,m.boss?3.5:1.5,0,Math.PI*2);cx.fill();
  }
  cx.fillStyle='#fde68a';cx.shadowColor='#f59e0b';cx.shadowBlur=5;
  cx.beginPath();cx.arc(pcx,pcy,3.5,0,Math.PI*2);cx.fill();
  cx.shadowBlur=0;
  cx.restore();
}
