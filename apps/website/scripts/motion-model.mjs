export const DURATION = 24;
const TAU = Math.PI * 2;
export const clamp = x => Math.max(0, Math.min(1, x));
export const smooth = x => {x=clamp(x); return x*x*x*(x*(x*6-15)+10);};
export const PHASES = [
  {id:'run',label:'奔跑',title:'奔跑，向着旷野。',description:'一只鹿，一段不必着急的旅程。'},
  {id:'scatter',label:'散开',title:'散开，成为星光。',description:'同一组字符，走向更远的地方。'},
  {id:'stars',label:'星空',title:'停留，在星空里。',description:'各有位置，也彼此相连。'},
  {id:'assemble',label:'组装',title:'聚拢，再次出发。',description:'每一点星光，都记得来时的方向。'}
];
export function sceneAt(time) {
  const t=((time%DURATION)+DURATION)%DURATION;
  const phase=t<7?0:t<11?1:t<16?2:t<21?3:0;
  const spread=t<7?0:t<11?smooth((t-7)/4):t<16?1:t<21?1-smooth((t-16)/5):0;
  let from=phase, blend=1;
  for(const [boundary,previous,next] of [[7,0,1],[11,1,2],[16,2,3],[21,3,0]]) {
    if(t>=boundary&&t<boundary+.7){from=previous;blend=smooth((t-boundary)/.7);break;}
  }
  return {t,phase,from,blend,spread};
}
// Active time only: the first frame after any suspension never catches up wall time.
export class MotionClock {
  time=0;last=null;paused=false;visible=true;foreground=true;
  get running(){return !this.paused&&this.visible&&this.foreground;}
  set(flags){Object.assign(this,flags);this.last=null;}
  frame(now){if(!this.running){this.last=null;return this.time;}if(this.last!==null)this.time=(this.time+Math.max(0,Math.min((now-this.last)/1000,.05)))%DURATION;this.last=now;return this.time;}
}
function random(index,salt=0){const v=Math.sin(index*127.1+salt*311.7+12.34)*43758.5453;return v-Math.floor(v);}
function polygon(x,y,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [xi,yi]=points[i],[xj,yj]=points[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
const polygons=[[[134,94],[144,65],[151,46],[164,43],[164,66],[153,94],[143,103]],[[172,41],[191,46],[191,51],[176,54],[163,52]],[[157,40],[145,28],[155,29],[165,40]],[[174,40],[188,31],[185,39],[177,45]],[[56,83],[44,73],[43,80],[56,91]]];
const antlers=[[[160,37],[155,25],[150,15],[151,3]],[[155,25],[141,19],[137,10]],[[150,15],[140,7],[140,1]],[[163,36],[170,22],[175,11],[174,1]],[[170,22],[184,17],[190,8]],[[175,11],[183,5],[183,0]]];
const ellipses=[[100,91,43,18],[67,91,15,18],[135,86,17,22],[166,45,14,9]];
function inBody(x,y){if(ellipses.some(([cx,cy,rx,ry])=>((x-cx)/rx)**2+((y-cy)/ry)**2<=1)||polygons.some(p=>polygon(x,y,p)))return true;for(const points of antlers)for(let i=1;i<points.length;i++){const [a,b]=[points[i-1],points[i]],dx=b[0]-a[0],dy=b[1]-a[1],u=clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy));if(Math.hypot(x-a[0]-u*dx,y-a[1]-u*dy)<1.25)return true;}return false;}
export function createParticles(){
  const particles=[];
  const add=p=>{const id=particles.length;const angle=id*2.399963229728653,r=Math.sqrt(random(id,1)),arc=random(id,2)*TAU;particles.push({...p,id,glyph:Math.floor(random(id,3)*6),starX:360+Math.cos(angle)*r*305,starY:190+Math.sin(angle)*r*145,curveX:Math.cos(arc)*45,curveY:Math.sin(arc)*35,twinkle:random(id,4)*TAU,starAlpha:random(id,6)>.82?.4+random(id,7)*.45:.025,alpha:.45+random(id,5)*.5});};
  for(let y=1;y<111;y+=2)for(let x=41;x<194;x+=2)if(inBody(x,y)&&Math.hypot(x-175,y-44)>1.6)add({part:'body',x,y});
  for(let leg=0;leg<4;leg++)for(let segment=0;segment<2;segment++)for(let u=0;u<=1;u+=1/14)for(const offset of [-1,1])add({part:'leg',leg,segment,u,offset});
  return particles;
}
export function poseAt(time){
  // Exactly 20 strides per scene loop; all oscillators share the 24-second period.
  const stride=TAU*time/1.2,bob=-3*Math.cos(stride*2),drift=3*Math.sin(TAU*time/DURATION);
  const legs=[[77,Math.PI,true],[139,Math.PI+.65,false],[66,0,true],[130,.65,false]].map(([x,offset,rear])=>{
    const p=stride+offset,swing=Math.sin(p),fold=(1+Math.cos(p))/2;
    return [[x,98],[x+(rear?-8:4)+swing*10,120-fold*8],[x+swing*25+(rear?-7:9),148-fold*18]];
  });
  return {bob,drift,legs};
}
export function particleAt(p,time,scene=sceneAt(time),pose=poseAt(time)){
  let x=p.x,y=p.y;
  if(p.part==='leg'){const a=pose.legs[p.leg][p.segment],b=pose.legs[p.leg][p.segment+1],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);x=a[0]+dx*p.u-dy/length*p.offset;y=a[1]+dy*p.u+dx/length*p.offset;}
  const deerX=360+(x-120+pose.drift)*2.5,deerY=190+(y-78+pose.bob)*2.1;
  const drift=TAU*time/DURATION,starX=p.starX+Math.sin(drift+p.twinkle)*3,starY=p.starY+Math.cos(drift+p.twinkle)*2;
  const s=scene.spread,arc=Math.sin(Math.PI*s);
  return {x:deerX*(1-s)+starX*s+p.curveX*arc,y:deerY*(1-s)+starY*s+p.curveY*arc,alpha:p.alpha*(1-s)+s*p.starAlpha*(.82+.18*Math.sin(drift*2+p.twinkle))};
}
