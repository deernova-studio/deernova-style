import {MotionClock,PHASES,createParticles,sceneAt,poseAt,particleAt} from './motion-model.mjs';
export function createDeer(canvas,button){
  const ctx=canvas.getContext('2d');
  if(!ctx){button.disabled=true;return ()=>{};}
  const particles=createParticles(),clock=new MotionClock(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  clock.set({paused:reduced.matches,foreground:!document.hidden});
  const copy=document.querySelectorAll('[data-scene-copy]'),steps=document.querySelectorAll('[data-scene-step]');
  let raf=null,width=0,height=0,dpr=1,scale=1,offsetX=0,offsetY=0,atlas,themeColor='',lastPhase=-1;
  function makeAtlas(){
    themeColor=getComputedStyle(canvas).color;
    atlas=document.createElement('canvas');atlas.width=6*20*dpr;atlas.height=20*dpr;
    const a=atlas.getContext('2d');a.scale(dpr,dpr);a.fillStyle=themeColor;a.font='8px ui-monospace, SFMono-Regular, Menlo, monospace';a.textAlign='center';a.textBaseline='middle';
    [...'.:+*x#'].forEach((glyph,i)=>a.fillText(glyph,i*20+10,10));
  }
  function draw(){
    if(!width||!height)return;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);ctx.translate(offsetX,offsetY);ctx.scale(scale,scale);
    const scene=sceneAt(clock.time),pose=poseAt(clock.time);
    for(const p of particles){const point=particleAt(p,clock.time,scene,pose);ctx.globalAlpha=point.alpha;ctx.drawImage(atlas,p.glyph*20*dpr,0,20*dpr,20*dpr,point.x-10,point.y-10,20,20);}
    ctx.globalAlpha=1;
    copy.forEach((el,i)=>{el.style.opacity=i===scene.phase?String(scene.blend):i===scene.from?String(1-scene.blend):'0';});
    if(lastPhase!==scene.phase){lastPhase=scene.phase;canvas.dataset.phase=PHASES[scene.phase].id;steps.forEach((el,i)=>{if(i===scene.phase)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});}
  }
  function frame(now){raf=null;clock.frame(now);draw();if(clock.running)raf=requestAnimationFrame(frame);}
  function reconcile(){if(raf!==null){cancelAnimationFrame(raf);raf=null;}if(clock.running)raf=requestAnimationFrame(frame);button.setAttribute('aria-pressed',String(clock.paused));button.textContent=clock.paused?'继续播放 ▷':'暂停动画 Ⅱ';draw();}
  function resize(){const bounds=canvas.getBoundingClientRect();width=bounds.width;height=bounds.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);scale=Math.min(width/720,height/380);offsetX=(width-720*scale)/2;offsetY=(height-380*scale)/2;makeAtlas();draw();}
  const onPause=()=>{clock.set({paused:!clock.paused});reconcile();};
  const onReduced=()=>{if(reduced.matches)clock.set({paused:true});reconcile();};
  const onVisibility=()=>{clock.set({foreground:!document.hidden});reconcile();};
  button.addEventListener('click',onPause);reduced.addEventListener('change',onReduced);document.addEventListener('visibilitychange',onVisibility);
  const observer=new IntersectionObserver(([entry])=>{clock.set({visible:entry.isIntersecting});reconcile();},{threshold:0});observer.observe(canvas);
  const sizing=new ResizeObserver(resize);sizing.observe(canvas);
  const theme=new MutationObserver(()=>{makeAtlas();draw();});theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  const systemTheme=matchMedia('(prefers-color-scheme:dark)'),onTheme=()=>{makeAtlas();draw();};systemTheme.addEventListener('change',onTheme);
  resize();reconcile();
  return ()=>{if(raf!==null)cancelAnimationFrame(raf);observer.disconnect();sizing.disconnect();theme.disconnect();button.removeEventListener('click',onPause);reduced.removeEventListener('change',onReduced);document.removeEventListener('visibilitychange',onVisibility);systemTheme.removeEventListener('change',onTheme);};
}
