import test from 'node:test';
import assert from 'node:assert/strict';
import {MotionClock,createParticles,sceneAt,particleAt,DURATION} from '../apps/docs/motion-model.mjs';
test('pause, hidden tab and offscreen freeze active time without resume jumps',()=>{for(const flag of ['paused','visible','foreground']){const clock=new MotionClock();clock.frame(1000);clock.frame(1016);const before=clock.time;clock.set({[flag]:flag==='paused'});clock.frame(20000);assert.equal(clock.time,before);clock.set({[flag]:flag!=='paused'});clock.frame(30000);assert.equal(clock.time,before);clock.frame(30016);assert.ok(Math.abs(clock.time-before-.016)<1e-9);}});
test('stable particle identity, finite bounds, and continuous phase/loop boundaries',()=>{const particles=createParticles();assert.deepEqual(particles,createParticles());assert.ok(particles.length>500);for(const t of [0,7,9,11,14,16,19,21,24]){for(const p of particles){const position=particleAt(p,t);assert.ok(Number.isFinite(position.x)&&Number.isFinite(position.y));assert.ok(position.x>=0&&position.x<=720&&position.y>=0&&position.y<=380);}}
for(const t of [7,11,16,21,24])for(const p of particles){const before=particleAt(p,t-1e-5),after=particleAt(p,t+1e-5);assert.ok(Math.hypot(before.x-after.x,before.y-after.y)<.1,`jump at ${t}`);}
for(const p of particles){const a=particleAt(p,0),b=particleAt(p,DURATION);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<1e-8);}
assert.equal(sceneAt(0).spread,0);assert.equal(sceneAt(12).spread,1);assert.equal(sceneAt(23).spread,0);
});
test('copy crossfades stay bounded and the foreground clock caps long frames',()=>{for(let t=0;t<24;t+=.01){const s=sceneAt(t);assert.ok(s.blend>=0&&s.blend<=1);}const clock=new MotionClock();clock.frame(0);clock.frame(100000);assert.equal(clock.time,.05);});
