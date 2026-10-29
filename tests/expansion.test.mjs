import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Game, GameState } from '../src/core/Game.ts';
import { LEVELS, PROGRESSION } from '../src/world/levels.ts';
import { blocked } from '../src/core/Physics.ts';

const keys = ['left', 'right', 'jump', 'run', 'down', 'up'];
function playing(id) { const g = new Game(); g.load(id); g.time = g.level.time; g.state = GameState.PLAYING; return g; }
function ticks(g, count = 1) { for (let i = 0; i < count; i++) g.update(); }
function replay(g, path, inspect = () => {}) {
    for (const step of JSON.parse(fs.readFileSync(path, 'utf8'))) {
        for (const key of keys) g.input.set(key, key, step.keys.includes(key));
        for (let i = 0; i < step.frames; i++) { g.update(); inspect(g); assert.notEqual(g.state, GameState.PLAYER_DYING); assert.notEqual(g.state, GameState.GAME_OVER); if (g.state === GameState.LEVEL_COMPLETE) return; }
    }
}
for (const world of [4, 3, 2]) test(`1-2 ceiling route physically reaches the World ${world} warp`, () => {
    const g = playing('1-2');
    let roof = false, lift = false, chamber = false;
    replay(g, `tests/fixtures/warp-1-2-to-${world}.json`, () => {
        if (g.level.id !== '1-2') return;
        roof ||= g.player.x > 129 * 16 && g.player.y + g.player.h <= 65;
        lift ||= g.platforms.some(p => p.x === 128 * 16 && g.player.grounded && Math.abs(g.player.y + g.player.h - p.y) < 1);
        chamber ||= g.player.x > 149 * 16 && g.player.y > 80;
    });
    assert.ok(roof); assert.ok(lift); assert.ok(chamber);
    assert.equal(g.world, `${world}-1`); assert.equal(g.state, GameState.LEVEL_INTRO);
    assert.equal(g.player.x, LEVELS[`${world}-1`].spawn.x); assert.equal(g.camera, 0);
    assert.equal(g.time, LEVELS[`${world}-1`].time); assert.equal(g.lives, 5);
});
test('warp order and persistent state are correct for every power state', () => {
    assert.deepEqual(LEVELS['1-2'].pipes.filter(p=>p.warp).map(p=>p.target), ['4-1','3-1','2-1']);
    for (const power of [0,1,2]) for (const link of LEVELS['1-2'].pipes.filter(p=>p.warp)) {
        const g=playing('1-2'); g.score=12345;g.coins=73;g.lives=4;g.time=17;g.player.setPower(power);
        g.player.x=link.x+10;g.player.y=link.y-g.player.h;g.player.grounded=true;
        g.input.set('down','down',true);ticks(g);assert.equal(g.state,GameState.PIPE);ticks(g,60);
        assert.equal(g.world,link.target);assert.equal(g.player.power,power);assert.equal(g.score,12345);assert.equal(g.coins,73);assert.equal(g.lives,4);assert.deepEqual(g.completed,[]);assert.equal(g.camera,0);assert.ok(!blocked(g.level,g.player));assert.equal(g.time,g.level.time);
    }
});
test('invalid loads and invalid or misaligned pipe entries leave the run intact', () => {
    const g=playing('1-2');const level=g.level;assert.equal(g.load('9-9'),false);assert.equal(g.level,level);
    const link=g.level.pipes[0];g.player.x=link.x-16;g.player.y=link.y-16;g.player.grounded=true;g.input.set('down','down',true);ticks(g);assert.equal(g.state,GameState.PLAYING);
    link.target='missing';g.player.x=link.x+10;g.player.y=link.y-16;g.player.grounded=true;ticks(g);assert.equal(g.state,GameState.PLAYING);
});

test('registry contains 32 playable stages and every connected room is valid', () => {
    assert.equal(PROGRESSION.length,32);assert.equal(new Set(PROGRESSION).size,32);
    for(const id of PROGRESSION) {
        const g=playing(id);assert.equal(g.world,id);assert.ok(!blocked(g.level,g.player),id);assert.ok(g.level.goal<g.level.width || g.level.pipes.length>0,id);
        assert.ok(g.level.enemies.length>0,id);assert.ok(g.level.coins.length>0 || Object.values(g.level.tiles).some(t=>t.item),id);
    }
    for(const l of Object.values(LEVELS))for(const p of [...l.pipes,...(l.vines??[])])assert.ok(LEVELS[p.target],`${l.id} to ${p.target}`);
});
test('every progression boundary preserves power and final castle alone wins', () => {
    for(const [index,id] of PROGRESSION.entries()) {
        const g=playing(id==='8-4'?'8-4-brimstone':id);g.player.setPower(2);g.coins=23;g.time=0;g.enemies=[];g.state=GameState.LEVEL_COMPLETE;g.flagStage=3;g.stateTicks=101;
        if(g.level.ending){g.castlePhase='dialogue';g.input.set('start','start',true);}
        ticks(g);assert.equal(g.player.power,2);assert.equal(g.coins,23);assert.equal(g.lives,5);assert.deepEqual(g.completed,[id]);
        if(index===31)assert.equal(g.state,GameState.VICTORY);else {assert.equal(g.world,PROGRESSION[index+1]);assert.equal(g.state,GameState.LEVEL_INTRO);assert.equal(g.time,g.level.time);assert.equal(g.camera,0);}
    }
});
test('water has repeated swim strokes, sinking, collision, and resets on exit', () => {
    const g=playing('2-2');g.player.y=100;g.player.vy=0;ticks(g,10);assert.ok(g.player.y>100);
    g.input.set('jump','jump',true);ticks(g);assert.ok(g.player.vy<0);const first=g.player.vy;ticks(g,10);assert.ok(g.player.vy>first);
    g.input.set('jump','jump',false);ticks(g);g.input.set('jump','jump',true);ticks(g);assert.equal(g.player.vy,first);
    g.load('2-2-exit');assert.equal(g.player.swimming,false);
});
for (const id of ['7-2', '8-4-water']) {
    test(`${id} has two open tile rows above the shared underwater column`, () => {
        for (const x of [110, 111]) {
            assert.ok(LEVELS[id].tiles[`${x},2`]);
            for (const y of [3, 4]) assert.equal(LEVELS[id].tiles[`${x},${y}`], undefined);
            assert.ok(LEVELS[id].tiles[`${x},5`]);
        }
    });
    for (const character of ['pip', 'rowan']) for (const power of [0, 1, 2]) {
        test(`${character} with power ${power} can swim through the ${id} column passage`, () => {
            const g = new Game(); g.selectCharacter(character); g.load(id); g.change(GameState.PLAYING); g.player.setPower(power);
            g.player.x = 108 * 16; g.player.y = 80 - g.player.h;
            g.input.set('right', 'right', true);
            for (let frame = 0; frame < 90 && g.player.x < 113 * 16; frame++) {
                g.input.set('jump', 'jump', frame % 20 === 0);
                ticks(g);
                assert.equal(g.state, GameState.PLAYING);
                assert.equal(g.player.power, power);
                assert.equal(g.player.h, power ? 28 : 16);
                assert.equal(g.lives, 5);
                assert.ok(!blocked(g.level, g.player));
            }
            assert.ok(g.player.x >= 113 * 16, 'player must fully cross the column');
            assert.equal(g.selectedCharacter, character);
        });
    }
}
test('maze failures rewind position and camera without duplicating state', () => {
    for(const id of ['4-4','7-4']) {
        const g=playing(id),gate=g.level.mazes[0];const enemies=g.enemies;const score=g.score;
        g.player.x=gate.x-13;g.player.y=gate.minY===0?192:64;g.player.vx=2;g.camera=gate.x-150;g.input.set('right','right',true);ticks(g);
        assert.equal(g.player.x,gate.returnX);assert.equal(g.camera,Math.max(0,gate.returnX-104));assert.equal(g.enemies.length,enemies.length);assert.equal(g.score,score);assert.equal(g.mazePassed.length,0);
    }
});
test('lava kills immediately even with star power and underwater death restarts its stage', () => {
    const g=playing('2-4');const lava=g.level.lava[0];g.player.star=300;g.player.x=lava.x;g.player.y=lava.y-10;ticks(g);assert.equal(g.state,GameState.PLAYER_DYING);assert.equal(g.lives,4);
    const h=playing('8-4-water');h.die();ticks(h,111);assert.equal(h.world,'8-4');assert.equal(h.level.id,'8-4');assert.equal(h.player.power,0);
});
test('all new mechanics freeze when paused', () => {
    const g=playing('4-2');g.vines[0]=1;g.pause();const before=JSON.stringify({p:g.player,v:g.vines,e:g.enemies,platforms:g.platforms,t:g.time,frame:g.frame});ticks(g,100);assert.equal(JSON.stringify({p:g.player,v:g.vines,e:g.enemies,platforms:g.platforms,t:g.time,frame:g.frame}),before);
});
// Fixture authoring is separate from validation: these runs never patch player state.
for(const id of PROGRESSION.filter(id=>!id.startsWith('1-'))) {
    const path=`tests/fixtures/route-${id}.json`;
    test(`ordinary-input replay completes ${id}`,()=>{const g=playing(id);replay(g,path);assert.equal(g.state,GameState.LEVEL_COMPLETE);assert.equal(g.lives,5);});
}

for (const world of [5,6,7,8]) test(`4-2 secret route reaches World ${world} through ordinary inputs`, () => {
    const g=playing('4-2');let vine=false,climbed=false,sky=false,roof=false,lift=false,revealed=false;
    replay(g,`tests/fixtures/warp-4-2-to-${world}.json`,()=>{
        if(g.level.id==='4-2') {
            vine ||= g.vines[0]>0;climbed ||= g.player.climbing!==null;
            revealed ||= ['40,9','42,8','44,7'].every(k=>g.level.tiles[k].kind==='used');
            roof ||= g.player.x>129*16 && g.player.y+g.player.h<=65;
            lift ||= g.platforms.some(p=>p.x===128*16 && p.dy<0 && g.player.grounded && Math.abs(g.player.y+g.player.h-p.y)<1);
        }
        sky ||= g.level.id==='4-2-sky';
    });
    if(world===5){assert.ok(roof);assert.ok(lift);assert.equal(sky,false);}else{assert.ok(vine);assert.ok(revealed);assert.ok(climbed);assert.ok(sky);}
    assert.equal(g.world,`${world}-1`);assert.equal(g.state,GameState.LEVEL_INTRO);assert.equal(g.camera,0);assert.equal(g.player.x,40);assert.equal(g.time,g.level.time);assert.equal(g.lives,5);
});
test('4-2 warp ordering and all warp powers preserve the session',()=>{
    assert.deepEqual(LEVELS['4-2-sky'].pipes.map(p=>p.target),['6-1','7-1','8-1']);
    for(const area of ['4-2','4-2-sky'])for(const link of LEVELS[area].pipes.filter(p=>p.warp))for(const power of [0,1,2]){
        const g=playing(area);g.score=4500;g.coins=67;g.player.setPower(power);g.player.x=link.x+10;g.player.y=link.y-g.player.h;g.player.grounded=true;g.input.set('down','down',true);ticks(g,61);
        assert.equal(g.world,link.target);assert.equal(g.score,4500);assert.equal(g.coins,67);assert.equal(g.player.power,power);assert.equal(g.highestWorldReached,Number(link.target[0]));assert.equal(g.enemies.length,LEVELS[link.target].enemies.length);
    }
});
test('8-4 replay visits every castle room and triggers final victory',()=>{
    const g=playing('8-4'),visited=new Set();replay(g,'tests/fixtures/route-8-4.json',()=>visited.add(g.level.id));
    assert.deepEqual([...visited],['8-4','8-4-hall','8-4-water','8-4-brimstone']);g.input.clear();ticks(g,600);assert.equal(g.castlePhase,'dialogue');assert.equal(g.state,GameState.LEVEL_COMPLETE);
    g.input.set('start','start',true);ticks(g);assert.equal(g.state,GameState.VICTORY);assert.ok(g.completed.includes('8-4'));
    g.returnToTitle();assert.equal(g.state,GameState.TITLE);g.begin();assert.equal(g.lives,5);assert.equal(g.world,'1-1');assert.equal(g.highestWorldReached,1);
});

test('enemy defenses distinguish shells, spikes, bullets, and aquatic creatures',()=>{
    const make=(kind)=>{const g=playing('1-1');const e={...g.enemies[0],kind,x:100,y:192,homeX:100,homeY:192,vx:0};g.enemies=[e];g.player.x=100;g.player.y=176;g.player.vy=1;return [g,e];};
    const [buzzy,e]=make('buzzy');ticks(buzzy);assert.equal(e.shell,true);assert.equal(e.dead,0);
    buzzy.player.x=40;buzzy.projectiles.push({x:e.x,y:e.y,w:6,h:6,vx:0,vy:0,grounded:false,life:50,hostile:false});ticks(buzzy);assert.equal(e.dead,0);
    const [spiny]=make('spiny');ticks(spiny);assert.equal(spiny.state,GameState.PLAYER_DYING);
    const [bullet,b]=make('bullet');ticks(bullet);assert.ok(b.dead>0);assert.equal(bullet.state,GameState.PLAYING);
    const [cheep,c]=make('cheep');cheep.projectiles.push({x:c.x,y:c.y,w:6,h:6,vx:0,vy:0,grounded:false,life:50,hostile:false});cheep.player.x=40;ticks(cheep);assert.ok(c.dead>0);
});
test('Lakitu eggs hatch, Hammer Bros throw arcs, and cannons avoid point-blank fire',()=>{
    const g=playing('4-1');const lakitu=g.enemies.find(e=>e.kind==='lakitu');g.player.x=lakitu.x-40;g.camera=g.player.x-100;lakitu.phase=169;ticks(g);assert.equal(g.enemies.filter(e=>e.kind==='egg').length,1);
    const egg=g.enemies.find(e=>e.kind==='egg');egg.x=g.player.x+64;egg.y=192;egg.vy=1;ticks(g);assert.equal(egg.kind,'spiny');
    const h=playing('3-1');const bro=h.enemies.find(e=>e.kind==='hammerBro');h.player.x=bro.x-80;h.camera=h.player.x-100;bro.phase=84;ticks(h);const hammer=h.projectiles.find(p=>p.kind==='hammer');assert.ok(hammer);const y=hammer.y,vy=hammer.vy;ticks(h,3);assert.ok(hammer.y<y);assert.ok(hammer.vy>vy);
    const k=playing('5-1');const cannon=k.level.cannons[0];k.player.x=cannon.x+20;k.camera=k.player.x-100;k.frame=cannon.period-1;ticks(k);assert.equal(k.enemies.filter(e=>e.kind==='bullet').length,0);
    k.player.x=cannon.x-100;k.camera=k.player.x-100;k.frame=cannon.period-1;ticks(k);assert.equal(k.enemies.filter(e=>e.kind==='bullet').length,1);
});
test('vine attachment allows descent and jump detachment without altering land physics',()=>{
    const g=playing('4-2');g.vines[0]=32;const vine=g.level.vines[0];g.player.x=vine.x-6;g.player.y=48;g.camera=600;g.input.set('up','up',true);ticks(g);assert.equal(g.player.climbing,0);assert.equal(g.player.vx,0);
    g.input.set('up','up',false);g.input.set('down','down',true);const y=g.player.y;ticks(g,3);assert.ok(g.player.y>y);
    g.input.set('down','down',false);g.input.set('jump','jump',true);ticks(g);assert.equal(g.player.climbing,null);assert.ok(g.player.vy<0);
});
for (const character of ['pip', 'rowan']) for (const power of [0, 1, 2]) {
    test(`${character} with power ${power} can climb the 4-2 vine while standing on its block`, () => {
        const g = new Game(); g.selectCharacter(character); g.load('4-2'); g.change(GameState.PLAYING);
        const vine = g.level.vines[0];
        g.hitBlock(44, 4, g.level.tiles['44,4']);
        g.player.setPower(power); g.player.x = vine.x - g.player.w / 2; g.player.y = vine.bottom - g.player.h;
        g.player.grounded = true; g.camera = 600;
        ticks(g, 32); assert.equal(g.vines[0], vine.bottom - vine.top);
        assert.equal(g.player.y + g.player.h, vine.bottom);
        g.input.set('up', 'up', true); ticks(g);
        assert.equal(g.player.climbing, 0); assert.equal(g.player.vy, 0);
        for (let i = 0; i < 40 && g.level.id === '4-2'; i++) ticks(g);
        assert.equal(g.level.id, '4-2-sky'); assert.equal(g.state, GameState.LEVEL_INTRO);
        assert.equal(g.player.power, power); assert.equal(g.selectedCharacter, character);
        assert.ok(!blocked(g.level, g.player));
    });
}
test('balance lifts move oppositely and falling platforms carry their passenger',()=>{
    for(const kind of ['balance','falling']){
        const g=playing('3-3');const platform=g.platforms.find(p=>p.kind===kind);g.player.x=platform.x+8;g.player.y=platform.y-16;g.player.grounded=true;g.camera=Math.max(0,g.player.x-104);const y=platform.y;
        ticks(g,10);assert.ok(platform.y>y);assert.ok(Math.abs(g.player.y+g.player.h-platform.y)<.01);assert.equal(g.state,GameState.PLAYING);
        if(kind==='balance'){const other=g.platforms.find(p=>p!==platform && p.pair===platform.pair);assert.ok(other.y<other.originY);}
    }
});
test('wrong final-castle pipes return to the first room without changing stage or timer',()=>{
    const g=playing('8-4-hall');const link=g.level.pipes[0];g.player.x=link.x+10;g.player.y=link.y-16;g.player.grounded=true;g.score=100;g.time=123;g.input.set('down','down',true);ticks(g,125);
    assert.equal(g.level.id,'8-4');assert.equal(g.world,'8-4');assert.equal(g.score,100);assert.equal(g.lives,5);assert.ok(g.time>122 && g.time<123);assert.equal(g.state,GameState.PLAYING);
});
test('expanded water, enemies, lifts, and castle hazards remain deterministic across render rates',async()=>{
    const {GameLoop}=await import('../src/core/GameLoop.ts');
    for(const id of ['2-2','4-1','3-3','7-4']){
        const results=[];
        for(const fps of [30,60,144]){const g=playing(id),loop=new GameLoop();g.input.set('right','right',true);for(let i=0;i<fps*4;i++)loop.advance(1000/fps,()=>g.update());results.push({player:g.player,enemies:g.enemies,platforms:g.platforms,frame:g.frame,time:g.time,state:g.state});}
        assert.deepEqual(results[0],results[1],id);assert.deepEqual(results[1],results[2],id);
    }
});
