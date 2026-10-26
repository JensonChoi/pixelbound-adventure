import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, GameState } from '../src/core/Game.ts';
import { move, blocked } from '../src/core/Physics.ts';
import { body, Player } from '../src/entities/Entity.ts';
import { block, makeLevel, rect, key, cloneLevel } from '../src/world/Level.ts';
import { Input } from '../src/core/Input.ts';
import { LEVELS } from '../src/world/levels.ts';
function playing(id='1-1'){const g=new Game();g.load(id);g.state=GameState.PLAYING;g.levelIndex=Math.max(0,['1-1','1-2','1-3','1-4'].indexOf(id));g.player.grounded=true;return g;}
function tick(g,n=1){for(let i=0;i<n;i++)g.update();}
function hold(g,action,on=true){g.input.set(action,action,on);}
test('floor, wall, ceiling, and high velocity motion do not tunnel',()=>{
 const l=makeLevel('test','test','overworld',20);rect(l,0,13,20,2);rect(l,8,8,1,5);rect(l,2,8,3,1);
 const b=body(40,150);b.vy=80;move(b,l);assert.equal(b.y,192);assert.ok(b.grounded);
 b.vx=100;b.vy=.24;move(b,l);assert.equal(b.x,116);assert.equal(b.vx,0);
 b.x=40;b.y=155;b.vy=-40;move(b,l);assert.equal(b.y,144);assert.equal(b.vy,0);assert.ok(!blocked(l,b));
});
test('acceleration, run cap, friction, and reversal skid are gradual',()=>{
 const g=playing();hold(g,'right');tick(g,1);assert.ok(g.player.vx>0&&g.player.vx<1);tick(g,20);assert.ok(g.player.vx<=1.61);hold(g,'run');tick(g,25);assert.ok(g.player.vx>2.5);hold(g,'right',false);hold(g,'left');tick(g);assert.ok(g.player.skidding);assert.ok(g.player.vx>0);hold(g,'left',false);tick(g,40);assert.equal(g.player.vx,0);
});
test('holding jump produces a higher arc than tapping',()=>{
 function arc(held){const g=playing();g.enemies=[];hold(g,'jump');let top=g.player.y;for(let i=0;i<65;i++){if(i===1&&!held)hold(g,'jump',false);g.update();top=Math.min(top,g.player.y);}return top;}
 assert.ok(arc(true)<arc(false)-25);
});
test('question blocks grant one reward and restart restores geometry',()=>{
 const g=playing();const t=g.level.tiles[key(16,9)];g.hitBlock(16,9,t);g.hitBlock(16,9,t);assert.equal(g.coins,1);assert.equal(t.kind,'used');g.restart();assert.equal(g.lives,4);assert.equal(g.level.tiles[key(16,9)].kind,'question');assert.equal(g.enemies.length,LEVELS['1-1'].enemies.length);
});
test('small Mario bumps bricks; Super Mario breaks them with debris',()=>{
 const g=playing();g.hitBlock(20,9,g.level.tiles[key(20,9)]);assert.ok(g.level.tiles[key(20,9)]);g.player.setPower(1);g.hitBlock(20,9,g.level.tiles[key(20,9)]);assert.equal(g.level.tiles[key(20,9)],undefined);assert.equal(g.particles.filter(p=>!p.text).length,4);
});
test('a hidden block appears only when struck from below',()=>{
 const g=playing();g.enemies=[];g.player.x=64*16+2;g.player.y=150;g.player.vy=-4;tick(g,3);assert.equal(g.level.tiles[key(64,8)].kind,'used');assert.equal(g.pickups[0].kind,'life');
});
test('mushrooms emerge, collect and preserve feet while growing',()=>{
 const g=playing();g.hitBlock(21,9,g.level.tiles[key(21,9)]);assert.equal(g.pickups[0].kind,'power');tick(g,33);const item=g.pickups[0];assert.equal(item.emerge,0);g.player.x=item.x;g.player.y=item.y;tick(g);assert.equal(g.player.power,1);assert.equal(g.player.h,28);assert.equal(g.pickups.length,0);
});
test('powered blocks give flowers, fireballs are limited and hit walls',()=>{
 const g=playing();g.player.setPower(1);g.hitBlock(21,9,g.level.tiles[key(21,9)]);assert.equal(g.pickups[0].kind,'flower');g.player.setPower(2);for(let i=0;i<3;i++){g.player.fireCooldown=0;hold(g,'run',false);hold(g,'run');tick(g);}assert.equal(g.projectiles.length,2);
 g.projectiles=[{...body(28*16-8,185,6,6),vx:3.5,vy:0,life:100,hostile:false}];tick(g,3);assert.equal(g.projectiles.length,0);
});
test('Goomba stomps bounce, side contact damages, and recovery protects',()=>{
 const g=playing();const e=g.enemies[0];g.player.x=e.x;g.player.y=e.y-17;g.player.vy=2;g.player.grounded=false;tick(g);assert.ok(e.dead>0);assert.ok(g.player.vy<0);
 const h=playing();const enemy=h.enemies[0];h.player.setPower(2);h.player.x=enemy.x;h.player.y=enemy.y-12;tick(h);assert.equal(h.player.power,0);assert.ok(h.player.invulnerable>0);h.damage();assert.equal(h.state,GameState.PLAYING);
});
test('Koopas become stationary shells, can be kicked, and defeat enemies',()=>{
 const g=playing();g.enemies=[{...g.enemies[0],kind:'green',x:80,y:192,homeX:80}];const e=g.enemies[0];g.player.x=80;g.player.y=175;g.player.vy=2;g.player.grounded=false;tick(g);assert.equal(e.shell,true);assert.equal(e.vx,0);
 e.safe=0;g.player.x=70;g.player.y=192;g.player.vy=0;tick(g);assert.ok(e.vx>0);
 const target={...e,kind:'goomba',shell:false,x:e.x+15,vx:0,safe:0};g.enemies.push(target);g.player.x=40;tick(g,5);assert.ok(target.dead>0);
});
test('star defeats enemies and coin rollover adds a life',()=>{
 const g=playing();g.coins=99;g.coin(0,0);assert.equal(g.coins,0);assert.equal(g.lives,6);const e=g.enemies[0];g.player.star=60;g.player.x=e.x;g.player.y=e.y;tick(g);assert.ok(e.dead>0);assert.equal(g.state,GameState.PLAYING);
});
test('pause freezes timer, player, enemies and platforms',()=>{
 const g=playing('1-2');g.pause();const before=JSON.stringify({time:g.time,player:g.player,enemies:g.enemies,platforms:g.platforms});tick(g,120);assert.equal(JSON.stringify({time:g.time,player:g.player,enemies:g.enemies,platforms:g.platforms}),before);g.resume();tick(g);assert.ok(g.time<400);
});
test('falling, timeout, respawn, and game over consume lives exactly once',()=>{
 const g=playing();g.player.y=260;tick(g);assert.equal(g.state,GameState.PLAYER_DYING);assert.equal(g.lives,4);tick(g,111);assert.equal(g.state,GameState.LEVEL_INTRO);assert.equal(g.lives,4);tick(g,101);g.time=.01;tick(g);assert.equal(g.lives,3);tick(g,212);
 for(let remaining=2;remaining>=0;remaining--){g.damage();assert.equal(g.lives,remaining);tick(g,111);if(remaining>0){assert.equal(g.state,GameState.LEVEL_INTRO);tick(g,101);}}
 assert.equal(g.state,GameState.GAME_OVER);assert.equal(g.lives,0);
});
test('pipe round trip preserves used blocks and main level enemies',()=>{
 const g=playing();g.hitBlock(16,9,g.level.tiles[key(16,9)]);g.player.x=57*16+10;g.player.y=9*16-16;hold(g,'down');tick(g);assert.equal(g.state,GameState.PIPE);hold(g,'down',false);tick(g,125);assert.equal(g.level.id,'bonus');assert.equal(g.state,GameState.PLAYING);
 g.player.x=25*16+10;g.player.y=160-16;g.player.grounded=true;hold(g,'down');tick(g);hold(g,'down',false);tick(g,125);assert.equal(g.level.id,'1-1');assert.equal(g.level.tiles[key(16,9)].kind,'used');assert.equal(g.player.power,0);assert.ok(g.player.x>160*16);
});
test('flag sequence advances worlds, awards time once, and finale wins',()=>{
 const g=playing();g.player.x=g.level.goal;g.player.y=100;tick(g);assert.equal(g.state,GameState.LEVEL_COMPLETE);const score=g.score;tick(g,350);assert.equal(g.world,'1-2');assert.ok(g.score>score);assert.equal(g.completed[0],'1-1');
 const h=playing('1-4');h.player.x=h.level.goal;h.player.y=160;tick(h);assert.equal(h.state,GameState.LEVEL_COMPLETE);tick(h,300);assert.equal(h.state,GameState.VICTORY);assert.equal(h.level.tiles[key(112,11)],undefined);
});
test('camera never backtracks or exposes outside the level',()=>{
 const g=playing();g.enemies=[];g.player.x=600;tick(g);const camera=g.camera;g.player.x=300;tick(g);assert.equal(g.camera,camera);assert.equal(g.player.x,camera);g.player.x=g.level.width-1;tick(g);assert.ok(g.camera<=g.level.width-256);
});
test('all level destinations exist and definitions remain immutable',()=>{
 for(const l of Object.values(LEVELS)){assert.ok(l.width>=256);for(const pipe of l.pipes)assert.ok(LEVELS[pipe.target]);}const g=playing();g.hitBlock(16,9,g.level.tiles[key(16,9)]);assert.equal(LEVELS['1-1'].tiles[key(16,9)].kind,'question');
});
test('standing up under low ceilings is prevented',()=>{
 const g=playing();g.enemies=[];g.player.setPower(1);hold(g,'down');tick(g);assert.equal(g.player.h,16);block(g.level,2,11,'stone');hold(g,'down',false);tick(g);assert.equal(g.player.h,16);delete g.level.tiles[key(2,11)];tick(g);assert.equal(g.player.h,28);
});
test('moving platforms carry a standing player without sinking',()=>{
 const g=playing('1-2');g.enemies=[];const p=g.platforms[0];g.player.x=p.x+10;g.player.y=p.y-16;g.player.grounded=true;tick(g,20);assert.ok(Math.abs(g.player.y+16-p.y)<.01);assert.ok(g.player.grounded);
});
test('red Koopas turn at edges while green Koopas fall',()=>{
 for(const kind of ['red','green']){const g=playing();g.level=makeLevel('test','test','overworld',32);rect(g.level,4,10,4,1,'stone');const e={...g.enemies[0],kind,x:116,y:144,vx:.5,grounded:true};g.enemies=[e];g.player.x=40;g.player.y=192;g.player.star=999;for(let i=0;i<30;i++){g.player.y=192;g.update();}if(kind==='red')assert.ok(e.vx<0);else assert.ok(e.y>144);}
});
test('Piranha Plants wait while Mario stands on their pipe',()=>{
 const g=playing();const e=g.enemies.find(e=>e.kind==='plant');g.player.x=e.homeX;g.player.y=e.homeY-16;g.player.grounded=true;g.camera=e.x-100;tick(g,150);assert.ok(e.y>=e.homeY-3);assert.equal(g.lives,5);
});
test('Bowser takes five fireball hits and the axe still completes the course',()=>{
 const g=playing('1-4');const e=g.enemies.find(e=>e.kind==='bowser');g.player.x=e.x-80;g.camera=g.player.x-100;g.player.y=100;g.player.star=100;for(let i=0;i<5;i++){g.projectiles.push({...body(e.x+5,e.y+10,6,6),vx:0,vy:0,life:50,hostile:false});tick(g);}assert.ok(e.dead>0);assert.ok(g.score>=5000);g.player.x=g.level.goal;g.player.y=160;tick(g);assert.equal(g.state,GameState.LEVEL_COMPLETE);
});
test('star expiry restores vulnerability and pause freezes hazard angles',()=>{
 const g=playing('1-4');g.player.star=2;tick(g,2);assert.equal(g.player.star,0);const frame=g.frame;g.pause();tick(g,50);assert.equal(g.frame,frame);g.resume();g.damage();assert.equal(g.state,GameState.PLAYER_DYING);
});
test('growth under a low ceiling crouches instead of embedding Mario',()=>{
 const g=playing();g.enemies=[];block(g.level,2,11,'stone');g.pickups.push({...body(40,192,12,14),kind:'power',emerge:0,homeY:192});tick(g);assert.equal(g.player.power,1);assert.equal(g.player.h,16);assert.ok(!blocked(g.level,g.player));
});
test('input supports alternate sources and clears all held actions on blur',()=>{
 const g=playing();g.input.set('ArrowRight','right',true);g.input.set('KeyD','right',true);g.input.set('ArrowRight','right',false);assert.ok(g.input.down('right'));g.input.set('Space','jump',true);assert.ok(g.input.down('jump'));g.input.clear();assert.equal(g.input.held.size,0);assert.equal(g.input.pressed.size,0);
});
test('fixed-step simulation is identical at 30, 60, and 144 Hz',async()=>{
 const {GameLoop}=await import('../src/core/GameLoop.ts');const results=[];
 for(const fps of [30,60,144]){const g=playing();g.enemies=[];hold(g,'right');const loop=new GameLoop();for(let i=0;i<fps*2;i++)loop.advance(1000/fps,()=>g.update());results.push({x:g.player.x,y:g.player.y,time:g.time,frame:g.frame});}
 assert.deepEqual(results[0],results[1]);assert.deepEqual(results[1],results[2]);const loop=new GameLoop();let count=0;loop.advance(5000,()=>count++);assert.equal(count,6);
});
test('new games and play-again start with five lives',()=>{
 const g=new Game();assert.equal(g.lives,5);g.begin();assert.equal(g.lives,5);g.lives=1;g.change(GameState.GAME_OVER);hold(g,'start');tick(g);assert.equal(g.lives,5);assert.equal(g.state,GameState.LEVEL_INTRO);
});
test('pressing R while playing or paused cannot restart the level',()=>{
 const target=new EventTarget();const input=new Input(target);const g=playing();g.input=input;g.hitBlock(16,9,g.level.tiles[key(16,9)]);g.player.x=100;
 for(const paused of [false,true]){if(paused)g.pause();for(const type of ['keydown','keyup'])target.dispatchEvent(Object.assign(new Event(type,{cancelable:true}),{code:'KeyR'}));tick(g);assert.equal(g.lives,5);assert.equal(g.player.x,100);assert.equal(g.level.tiles[key(16,9)].kind,'used');assert.equal(g.state,paused?GameState.PAUSED:GameState.PLAYING);}
});
