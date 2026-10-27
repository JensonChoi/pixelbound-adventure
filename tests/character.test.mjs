import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Game, GameState } from '../src/core/Game.ts';
import { Input } from '../src/core/Input.ts';
import { LEVELS, PROGRESSION } from '../src/world/levels.ts';
import { playerPalette, playerSprite } from '../src/graphics/PlayerAppearance.ts';
import { PALETTE, SPRITES } from '../src/graphics/PixelArt.ts';
import { blocked } from '../src/core/Physics.ts';

const tick = (g, n = 1) => { for (let i = 0; i < n; i++) g.update(); };
const tap = (g, action) => { g.input.set(action, action, true); g.input.set(action, action, false); tick(g); };
function playing(character, level = '1-1') {
    const g = new Game(); g.selectCharacter(character); g.begin(); g.load(level); g.change(GameState.PLAYING); return g;
}
function until(g, predicate, max = 900) {
    for (let i = 0; i < max && !predicate(); i++) g.update();
    assert.ok(predicate(), `Timed out in ${g.state}/${g.castlePhase} at ${g.player.x},${g.player.y}`);
}

test('title defaults to Mario, accepts arrow/W/S selection, and locks identity during a run', () => {
    const target = new EventTarget(), g = new Game(new Input(target));
    assert.equal(g.selectedCharacter, 'mario');
    const key = code => { for (const type of ['keydown', 'keyup']) target.dispatchEvent(Object.assign(new Event(type, { cancelable: true }), { code })); tick(g); };
    for (const down of ['ArrowDown', 'KeyS']) {
        key(down); assert.equal(g.selectedCharacter, 'luigi');
        key('KeyW'); assert.equal(g.selectedCharacter, 'mario');
    }
    key('ArrowDown'); key('ArrowUp'); assert.equal(g.selectedCharacter, 'mario');
    key('KeyS'); key('Enter'); assert.equal(g.state, GameState.LEVEL_INTRO);
    for (const state of Object.values(GameState).filter(state => state !== GameState.TITLE)) {
        g.change(state); g.selectCharacter('mario'); assert.equal(g.selectedCharacter, 'luigi');
    }
    g.returnToTitle(); assert.equal(g.selectedCharacter, 'luigi');
    assert.equal(g.level.id, '1-1'); g.selectCharacter('mario'); g.begin(); assert.equal(g.character.displayName, 'MARIO');
});

test('Luigi survives every player replacement, pause, death, restart, and play-again', () => {
    const g = playing('luigi');
    for (const id of Object.keys(LEVELS)) { g.load(id); assert.equal(g.selectedCharacter, 'luigi'); }
    g.load('1-1'); g.pause(); g.resume(); g.player.setPower(2); g.damage(); assert.equal(g.player.power, 0);
    g.player.invulnerable = 0; g.die(); tick(g, 111); assert.equal(g.lives, 4); assert.equal(g.selectedCharacter, 'luigi');
    g.change(GameState.PLAYING); g.restart(); assert.equal(g.lives, 3); assert.equal(g.selectedCharacter, 'luigi');
    g.lives = 1; g.change(GameState.PLAYING); g.die(); tick(g, 111); assert.equal(g.state, GameState.GAME_OVER);
    tap(g, 'start'); assert.equal(g.lives, 5); assert.equal(g.selectedCharacter, 'luigi');
});

test('Luigi collects mushrooms, flowers and stars, fires and returns to his own palette', () => {
    const g = playing('luigi'); g.enemies = [];
    for (const [kind, expected] of [['power', 1], ['flower', 2], ['star', 2]]) {
        g.pickups.push({ x: g.player.x, y: g.player.y, w: 12, h: 14, vx: 0, vy: 0, grounded: true, kind, emerge: 0, homeY: g.player.y });
        tick(g); assert.equal(g.player.power, expected); assert.equal(g.selectedCharacter, 'luigi');
    }
    assert.ok(g.player.star > 0); tap(g, 'run'); assert.equal(g.projectiles.length, 1);
    g.player.star = 1; tick(g); assert.equal(g.player.star, 0);
    for (const power of [0, 1, 2]) {
        const normal = playerPalette('luigi', power);
        assert.notDeepEqual(normal, playerPalette('mario', power));
        assert.notDeepEqual(normal, playerPalette('luigi', power, true, 12));
        assert.deepEqual(playerPalette('luigi', power), normal);
    }
});

test('shared action poses keep sprite dimensions and palette pixels valid', () => {
    const g = playing('luigi'); g.player.setPower(2);
    assert.equal(playerSprite(g.player), 'marioBig');
    g.player.fireCooldown = 15; assert.equal(playerSprite(g.player), 'marioBigThrow');
    g.player.swimming = true; assert.equal(playerSprite(g.player), 'marioBigSwim');
    g.player.swimming = false; g.player.climbing = 0; assert.equal(playerSprite(g.player), 'marioBigClimb');
    g.player.climbing = null; g.player.crouched = true; g.player.h = 16; assert.equal(playerSprite(g.player), 'marioCrouch');
    for (const [name, grid] of Object.entries(SPRITES).filter(([name]) => /^(mario|toad|peach)/.test(name))) {
        assert.equal(grid.length, name.startsWith('marioBig') || name.startsWith('peach') ? 28 : 16, name);
        for (const row of grid) { assert.equal(row.length, 16, name); for (const pixel of row) assert.ok(pixel === '.' || PALETTE[pixel], `${name}: ${pixel}`); }
    }
});

for (const character of ['mario', 'luigi']) for (let world = 1; world <= 8; world++) {
    test(`${character} rescues ${world === 8 ? 'Peach' : 'Toad'} in ${world}-4 exactly once`, () => {
        const g = playing(character, world === 8 ? '8-4-bowser' : `${world}-4`);
        const sounds = []; g.audio.play = sound => sounds.push(sound);
        const ending = g.level.ending;
        assert.equal(ending.character, world === 8 ? 'peach' : 'toad');
        assert.ok(g.level.tiles[`${Math.floor(ending.x / 16)},13`]);
        g.player.setPower(2); g.player.x = g.level.goal; g.player.y = 144;
        g.coins = 23; g.score = 1234; g.time = 19; tick(g);
        assert.equal(g.castlePhase, 'bridge'); assert.equal(g.state, GameState.LEVEL_COMPLETE);
        const scoreAtAxe = g.score, timeAtAxe = g.time;
        const enemies = JSON.stringify(g.enemies.filter(e => e.kind !== 'bowser'));
        const lives = g.lives; g.input.set('left', 'left', true); g.input.set('jump', 'jump', true);
        g.damage(); g.die(); g.restart(); assert.equal(g.lives, lives);
        until(g, () => g.castlePhase === 'walking'); assert.equal(g.time, timeAtAxe);
        const bridge = g.level.bridge;
        for (let x = bridge.start; x < bridge.end; x++) assert.equal(g.level.tiles[`${x},${bridge.row}`], undefined);
        until(g, () => g.castlePhase === 'dialogue');
        assert.equal(JSON.stringify(g.enemies.filter(e => e.kind !== 'bowser')), enemies);
        assert.equal(g.player.x, ending.x - 28); assert.equal(g.player.y + g.player.h, ending.floorY);
        assert.ok(!blocked(g.level, g.player)); assert.ok(ending.x >= g.camera && ending.x + 16 <= g.camera + 256);
        assert.equal(g.time, 0); assert.equal(g.score, scoreAtAxe + Math.ceil(timeAtAxe) * 50);
        assert.equal(g.rescueDialogue[0], `THANK YOU ${character.toUpperCase()}!`);
        assert.equal(sounds.filter(s => s === (world === 8 ? 'rescuePeach' : 'rescueToad')).length, 1);
        const frozen = JSON.stringify({ p: g.player, e: g.enemies, time: g.time, score: g.score });
        tick(g, world === 8 ? 600 : 239);
        assert.equal(JSON.stringify({ p: g.player, e: g.enemies, time: g.time, score: g.score }), frozen);
        assert.equal(g.state, GameState.LEVEL_COMPLETE);
        if (world === 8) tap(g, 'start'); else tick(g);
        assert.deepEqual(g.completed, [`${world}-4`]); assert.equal(g.selectedCharacter, character);
        assert.equal(g.player.power, 2); assert.equal(g.coins, 23); assert.equal(g.lives, 5);
        if (world === 8) {
            assert.equal(g.state, GameState.VICTORY); tick(g, 500); assert.deepEqual(g.completed, ['8-4']);
            assert.equal(sounds.filter(s => s === 'victory').length, 1);
        } else { assert.equal(g.world, `${world + 1}-1`); assert.equal(g.state, GameState.LEVEL_INTRO); }
    });
}

test('Toad accepts a fresh confirmation and ignores Enter held before dialogue', () => {
    const g = playing('luigi', '1-4'); g.player.x = g.level.goal; g.player.y = 160; tick(g);
    g.input.set('start', 'start', true); until(g, () => g.castlePhase === 'dialogue'); tick(g, 2);
    assert.equal(g.world, '1-4'); tap(g, 'start'); assert.equal(g.world, '2-1'); assert.equal(g.selectedCharacter, 'luigi');
});

test('browser key repeat cannot skip rescue dialogue or restart immediately after victory', () => {
    const g = playing('luigi', '8-4-bowser'), target = new EventTarget(); g.input = new Input(target);
    const key = (type, repeat = false) => target.dispatchEvent(Object.assign(new Event(type, { cancelable: true }), { code: 'Enter', repeat }));
    g.player.x = g.level.goal; g.player.y = 160; tick(g);
    key('keydown'); until(g, () => g.castlePhase === 'dialogue'); key('keydown', true); tick(g);
    assert.equal(g.state, GameState.LEVEL_COMPLETE);
    key('keyup'); key('keydown'); tick(g); assert.equal(g.state, GameState.VICTORY);
    key('keydown', true); tick(g); assert.equal(g.state, GameState.VICTORY);
    key('keyup'); key('keydown'); tick(g); assert.equal(g.state, GameState.LEVEL_INTRO);
});

test('killing Bowser first still requires the axe before rescue', () => {
    const g = playing('luigi', '8-4-bowser'), bowser = g.enemies.find(e => e.kind === 'bowser');
    g.defeat(bowser, 5000); tick(g, 31); assert.equal(g.castlePhase, null); assert.equal(g.state, GameState.PLAYING);
    g.player.x = g.level.goal; g.player.y = 160; tick(g); until(g, () => g.castlePhase === 'dialogue');
    assert.equal(g.level.ending.character, 'peach'); assert.equal(g.state, GameState.LEVEL_COMPLETE);
    for (const id of ['8-4', '8-4-hall', '8-4-water']) assert.equal(LEVELS[id].ending, undefined);
});

// Run the preserved controller recordings with both identities and compare each
// input segment, including every water/pipe/vine/warp transition and collision.
const keys = ['left', 'right', 'jump', 'run', 'down', 'up'];
const actions = [['right', 'run', 'jump'], ['right', 'run'], ['jump'], [], ['left', 'run', 'jump'], ['left', 'run'], ['down']];
const routes = PROGRESSION.map(id => ({ id, file: `${id.startsWith('1-') ? 'mario-route' : 'route'}-${id}.json` }));
for (const [id, worlds] of [['1-2', [4, 3, 2]], ['4-2', [5, 6, 7, 8]]]) for (const world of worlds) routes.push({ id, file: `warp-${id}-to-${world}.json`, target: `${world}-1` });
for (const route of routes) test(`Mario/Luigi simulation parity: ${route.file}`, () => {
    const games = ['mario', 'luigi'].map(character => playing(character, route.id));
    const snapshot = g => ({ player: g.player, enemies: g.enemies, pickups: g.pickups, projectiles: g.projectiles, level: g.level, world: g.world, state: g.state, score: g.score, time: g.time, lives: g.lives, camera: g.camera });
    for (const entry of JSON.parse(fs.readFileSync(`tests/fixtures/${route.file}`, 'utf8'))) {
        const step = typeof entry === 'number' ? { keys: actions[entry], frames: 16 } : entry;
        for (const g of games) {
            for (const key of keys) g.input.set(key, key, step.keys.includes(key));
            for (let i = 0; i < step.frames; i++) { tick(g); assert.notEqual(g.state, GameState.PLAYER_DYING); assert.notEqual(g.state, GameState.GAME_OVER); if (g.state === GameState.LEVEL_COMPLETE) break; }
        }
        assert.deepEqual(snapshot(games[0]), snapshot(games[1]));
        assert.equal(games[1].selectedCharacter, 'luigi');
        if (games[0].state === GameState.LEVEL_COMPLETE) break;
    }
    assert.equal(games[1].state, route.target ? GameState.LEVEL_INTRO : GameState.LEVEL_COMPLETE);
    if (route.target) assert.equal(games[1].world, route.target);
});
