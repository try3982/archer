// ══════════════════════════════════════════
//  WEATHER UPDATE
// ══════════════════════════════════════════
function updateWeather(g){
  g.weatherTimer++;
  if(g.weatherTimer>=WEATHER_DUR){
    g.weatherTimer=0;
    g.weatherIdx=g.nextWeatherIdx;
    g.nextWeatherIdx=Math.floor(Math.random()*WEATHER_TYPES.length);
    g.weatherTransition=0;
    // update badge
    const w=WEATHER_TYPES[g.weatherIdx];
    const badge=document.getElementById('weatherbadge');
    badge.textContent=w.icon+' '+w.label;
    badge.style.opacity='1';
    setTimeout(()=>badge.style.opacity='0',3000);
  }
  g.weatherTransition=Math.min(1,g.weatherTransition+.008);
  const wt=WEATHER_TYPES[g.weatherIdx];
  const wind=wt.id==='rain'?-1.5:wt.id==='hail'?2:0.3;

  // thunder lightning
  if(wt.id==='thunder'){
    g.lightningTimer--;
    if(g.lightningTimer<=0){
      g.lightningAlpha=1;
      g.lightningTimer=60+Math.random()*180;
    }
    g.lightningAlpha=Math.max(0,g.lightningAlpha-.06);
  }

  // update weather particles
  const needParts=wt.id==='rain'||wt.id==='snow'||wt.id==='hail'||wt.id==='thunder';
  const partType=wt.id==='thunder'?'rain':wt.id;
  for(const p of g.wParticles){
    if(!needParts){p.type='none';continue;}
    if(p.type==='none'||p.type!==partType) resetWParticle(p,partType,wind);
    p.x+=p.vx;p.y+=p.vy;
    if(wt.id==='snow')p.vx+=Math.sin(g.frame*.02+p.y*.1)*.04;
    if(p.y>H+20||p.x<-20||p.x>W+20) resetWParticle(p,partType,wind);
  }
}
