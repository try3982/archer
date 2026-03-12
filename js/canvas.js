// ══════════════════════════════════════════
//  CANVAS SETUP
// ══════════════════════════════════════════
const CV=document.getElementById('c');
const cx=CV.getContext('2d');
let W,H;
function rsz(){W=CV.width=window.innerWidth;H=CV.height=window.innerHeight;}
rsz();window.addEventListener('resize',rsz);
