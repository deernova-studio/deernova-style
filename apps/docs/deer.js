// A small articulated silhouette, sampled into real text. No images or font assets.
export function createDeer(element, button) {
  const cols = 120, rows = 48;
  const canvas = document.createElement('canvas');
  canvas.width = 260; canvas.height = 168;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches, visible = true, time = 0, last = 0, raf;
  const ellipse = (x,y,rx,ry,angle=0) => {ctx.beginPath();ctx.ellipse(x,y,rx,ry,angle,0,Math.PI*2);ctx.fill();};
  const shape = points => {ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();};
  const line = (points,width) => {ctx.lineWidth=width;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();};
  function draw(t) {
    ctx.clearRect(0,0,260,168);ctx.fillStyle='#111';ctx.strokeStyle='#111';ctx.lineCap='round';ctx.lineJoin='round';
    const p=t*2.2, leap=Math.max(0,Math.sin(p));
    ctx.save();ctx.translate(9+Math.sin(p)*2,14-leap*10);
    // Far legs, with a soft galloping gait.
    for(const [x,offset,rear] of [[77,Math.PI,true],[139,Math.PI+.7,false],[66,0,true],[130,.7,false]]){
      const swing=Math.sin(p+offset), fold=Math.max(0,Math.cos(p+offset));
      const kneeX=x+(rear?-8:4)+swing*10, kneeY=120-fold*7;
      const footX=x+swing*25+(rear?-7:9), footY=147-fold*13;
      line([[x,99],[kneeX,kneeY],[footX,footY]],rear?4.5:3.8);
      line([[footX,footY],[footX+5,footY+1]],3.5);
    }
    ellipse(100,91,43,18,-.08);ellipse(67,91,15,18,-.2);ellipse(135,86,17,22,.15);
    shape([[134,94],[144,65],[151,46],[164,43],[164,66],[153,94],[143,103]]);
    ellipse(166,45,14,9,.18);shape([[172,41],[191,46],[191,51],[176,54],[163,52]]);
    // Ears, alert but relaxed.
    shape([[157,40],[145,28],[155,29],[165,40]]);shape([[174,40],[188,31],[185,39],[177,45]]);
    // Branching antlers give the silhouette its character.
    line([[160,37],[155,25],[150,15],[151,3]],2.5);
    line([[155,25],[141,19],[137,10]],2);line([[150,15],[140,7],[140,1]],1.5);
    line([[163,36],[170,22],[175,11],[174,1]],2.3);
    line([[170,22],[184,17],[190,8]],1.8);line([[175,11],[183,5],[183,0]],1.5);
    // Tail and eye.
    shape([[56,83],[44,73],[43,80],[56,91]]);
    ctx.fillStyle='#fff';ellipse(175,44,1.3,1.3);
    ctx.restore();
    const pixels=ctx.getImageData(0,0,260,168).data;
    const chars='.:+*x#@';let output='';
    for(let y=0;y<rows;y++){
      for(let x=0;x<cols;x++){
        const sx=Math.floor((x+.5)*260/cols), sy=Math.floor((y+.5)*168/rows);
        const a=pixels[(sy*260+sx)*4+3];
        if(a>55){const grain=(Math.sin(x*27.13+y*13.7)*43758.5)%1;const shade=.35+.3*Math.sin(x*.035+y*.09)+Math.abs(grain)*.35;output+=chars[Math.min(chars.length-1,Math.floor(shade*chars.length))];}
        else if(y===46 && x>24+leap*3 && x<92-leap*3)output+=x%3===0?'.':' ';
        else output+=' ';
      }
      output+='\n';
    }
    element.textContent=output;
  }
  function label(){button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'播放动画 ▷':'暂停动画 Ⅱ';}
  function tick(now){if(!paused&&visible&&!document.hidden&&now-last>85){time+=last?Math.min((now-last)/1000,.12):0;draw(time);last=now;}raf=requestAnimationFrame(tick);}
  button.addEventListener('click',()=>{paused=!paused;last=0;label();});
  reduced.addEventListener('change',()=>{paused=reduced.matches;label();if(paused)draw(0);});
  new IntersectionObserver(([e])=>{visible=e.isIntersecting;last=0;}).observe(element);
  document.addEventListener('visibilitychange',()=>{last=0;});
  draw(0);label();raf=requestAnimationFrame(tick);
  return ()=>cancelAnimationFrame(raf);
}
