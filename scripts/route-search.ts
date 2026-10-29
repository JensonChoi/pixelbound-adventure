import { Game, GameState } from '../src/core/Game';
import { Player } from '../src/entities/Entity';
import { Input, type Action } from '../src/core/Input';
import fs from 'node:fs';
const [id, mode = 'complete', output = `/tmp/route-${id}.json`, prefixPath = '', targetArg = '', yArg = '192'] = process.argv.slice(2);
const actions: Action[][] = [['right','run','jump'], ['right','run'], ['jump'], [], ['left','run','jump'], ['left','run'], ['down'], ['right','jump'], ['right'], ['up'], ['left']];
const keys: Action[] = ['left', 'right', 'jump', 'run', 'down', 'up'];
const g = new Game(); g.load(id); g.time = g.level.time; g.state = GameState.PLAYING;
type Step = { keys: Action[]; frames: number };
const prefix: Step[] = prefixPath ? JSON.parse(fs.readFileSync(prefixPath, 'utf8')) : [];
function play(game: Game, step: Step) {
    for (const key of keys) game.input.set(key, key, step.keys.includes(key));
    for (let i = 0; i < step.frames; i++) {
        game.update();
        if (game.state === GameState.PLAYER_DYING || game.state === GameState.LEVEL_COMPLETE || game.state === GameState.VICTORY) break;
    }
}
for (const step of prefix) play(g, step);
function copy(game: Game) {
    const next = Object.assign(Object.create(Game.prototype), game) as Game;
    next.player = Object.assign(new Player(), game.player);
    next.input = new Input(); next.input.held = new Set(game.input.held); next.input.pressed = new Set(game.input.pressed);
    // Reconstruct input sources using the same keys as replay.
    for (const key of next.input.held) next.input.set(key, key, true);
    next.input.pressed.clear();
    next.level = { ...game.level, tiles: Object.fromEntries(Object.entries(game.level.tiles).map(([k,v]) => [k,{...v}])), coins: game.level.coins.map(c=>({...c})) };
    next.enemies = game.enemies.map(e=>({...e})); next.pickups=game.pickups.map(e=>({...e})); next.platforms=game.platforms.map(e=>({...e})); next.projectiles=game.projectiles.map(e=>({...e})); next.particles=[]; next.completed=[...game.completed]; next.vines=[...game.vines]; next.mazePassed=[...game.mazePassed];
    // Area snapshots must be independent when a route returns through a pipe.
    (next as any).saved = structuredClone((game as any).saved);
    return next;
}
const target = Number(targetArg), targetY = Number(yArg);
function won(game: Game) {
    if (mode === 'vine') return game.vines[0] > 0;
    if (mode === 'lift') return game.platforms.some(p => p.x === target && p.dy < 0 && game.player.grounded && Math.abs(game.player.y + game.player.h - p.y) < 1 && game.player.x + game.player.w > p.x && game.player.x < p.x + p.width);
    if (mode === 'complete') return game.state === GameState.LEVEL_COMPLETE;
    if (mode.startsWith('warp:')) return game.world === mode.slice(5) && game.state === GameState.LEVEL_INTRO;
    if (mode.startsWith('area:')) return game.level.id === mode.slice(5);
    return game.level.id === id && Math.abs(game.player.x - target) < 10 && Math.abs(game.player.y - targetY) < 18 && game.player.grounded;
}
function score(game: Game) {
    if (won(game)) return 1e9;
    if (mode === 'vine') { const revealed=[['40,9'],['42,8'],['44,7']].filter(([k])=>game.level.tiles[k]?.kind==='used').length; return -Math.abs(game.player.x-704)*.5 - Math.abs(game.player.y-96)*.4 + revealed*80; }
    if (mode === 'area:4-2-sky') return -Math.abs(game.player.x-706)*2 - game.player.y + (game.player.climbing!==null?100:0);
    if (mode === 'lift') { const platform = game.platforms.find(p=>p.x===target)!; return -Math.abs(game.player.x - target)*2 - Math.abs(game.player.y + game.player.h - platform.y); }
    if (mode === 'point') return -Math.abs(game.player.x - target) * 2 - Math.abs(game.player.y - targetY) * .9 + game.player.power * 5;
    if (mode.startsWith('warp:')) {
        const link = game.level.pipes.find(p=>p.warp && p.target===mode.slice(5));
        if (!link) return -10000;
        return -Math.abs(game.player.x - (link.x+10))*2 - Math.abs(game.player.y - (link.y-game.player.h))*.3 + (game.state===GameState.PIPE?200:0);
    }
    const areas = id === '8-4' ? ['8-4', '8-4-hall', '8-4-water', '8-4-brimstone'] : [id, `${id}-exit`];
    const area = areas.indexOf(game.level.id);
    if (area < 0) return -10000;
    let progress = game.player.x;
    if (game.level.goal > game.level.width) {
        const next = areas[area + 1];
        const link = game.level.pipes.find(p=>p.target===next);
        if (link) progress = link.x - Math.abs(game.player.x - (link.x+10))*2 - Math.abs(game.player.y + game.player.h - link.y)*.2 + (game.state===GameState.PIPE?200:0);
    }
    const gate = game.level.mazes?.find((_,i)=>!game.mazePassed.includes(i));
    if (gate && gate.x-game.player.x < 180) {
        const feet = game.player.y+game.player.h;
        progress -= Math.max(0,gate.minY-feet,feet-gate.maxY)*2;
    }
    return progress + area * 5000 + game.mazePassed.length * 500 + game.player.power * 30 - Math.max(0,game.player.y-200)*3;
}
let beam=[{game:g, route:prefix, score:score(g)}];
const width=Number(process.env.BEAM ?? 50), max=Number(process.env.STEPS ?? 350);
for(let depth=0;depth<max;depth++) {
    const candidates=[];
    for(const parent of beam) for(const keys of actions) {
        const game=copy(parent.game), step={keys,frames:8}; play(game,step);
        if(game.state===GameState.PLAYER_DYING || game.state===GameState.GAME_OVER || game.lives<5 || game.player.y>248)continue;
        const route=[...parent.route,step];
        if(won(game)){fs.writeFileSync(output,JSON.stringify(route));console.log('FOUND',id,mode,route.length,game.level.id,game.player.x,game.player.y);process.exit(0);}
        candidates.push({game,route,score:score(game)});
    }
    candidates.sort((a,b)=>b.score-a.score);
    const seen=new Set();beam=[];
    for(const item of candidates){const p=item.game.player;const k=[item.game.level.id,item.game.state,Math.round(p.x/6),Math.round(p.y/6),Math.round(p.vx),Math.round(p.vy),p.grounded,item.game.input.down('jump'),item.game.mazePassed.length,Math.floor(item.game.frame/60),p.power].join(':');if(seen.has(k))continue;seen.add(k);beam.push(item);if(beam.length>=width)break;}
    if(!beam.length)break;
    if(depth%25===0)console.log(depth,beam[0].score.toFixed(1),beam[0].game.level.id,Math.round(beam[0].game.player.x),Math.round(beam[0].game.player.y));
}
if(beam[0]){fs.writeFileSync('/tmp/best-route.json',JSON.stringify(beam[0].route));console.log('LAST',beam[0].game.player,beam[0].game.state);}
process.exit(1);
