// ══════════════════════════════════════════
//  PARTICLES
// ══════════════════════════════════════════
function burst(g,wx,wy,col,n=8,big=false){
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2,spd=(big?2:1.5)+Math.random()*(big?6:4);
    g.particles.push({wx,wy,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,
      r:(big?4:2)+Math.random()*(big?6:4),life:1,decay:.025+Math.random()*.025,col});
  }
}
function deathBurst(g,wx,wy,type){
  const P={
    ghoul:['#4a7c59','#6aad7a','#a0d8b0'],
    wraith:['#8b5cf6','#c4b5fd','#ddd6fe'],
    vampire:['#dc2626','#f87171','#fca5a5'],
    crawler:['#92400e','#d97706','#fde68a'],
    revenant:['#3730a3','#6366f1','#a5b4fc'],
    golem:['#6b7280','#9ca3af','#e5e7eb'],
    lich:['#7c3aed','#c026d3','#f0abfc','#fde68a'],
  };
  const p=P[type]||['#fff'];
  for(let i=0;i<(type==='lich'?40:24);i++){
    const col=p[Math.random()*p.length|0];
    const a=Math.random()*Math.PI*2,spd=1+Math.random()*7;
    g.particles.push({wx,wy,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,
      r:3+Math.random()*6,life:1,decay:.02+Math.random()*.02,col});
  }
}
function explosionBurst(g,wx,wy){
  burst(g,wx,wy,'#fde68a',8,true);
  burst(g,wx,wy,'#f97316',10,true);
  burst(g,wx,wy,'#fff',4,true);
}
