import { ceilingSecret, firstDestinations, remainingLevels } from './expansion';
import { block, coins, enemy, makeLevel, pipe, rect, stairs, type LevelDefinition } from './Level';
function overworld() {
    const l = makeLevel('1-1', 'A familiar beginning', 'overworld', 218);
    rect(l, 0, 13, 69, 2);
    rect(l, 71, 13, 15, 2);
    rect(l, 89, 13, 64, 2);
    rect(l, 155, 13, 63, 2);
    block(l, 16, 9, 'question', 'coin');
    for (let x = 20; x <= 24; x++)
        block(l, x, 9, x % 2 === 0 ? 'brick' : 'question', x === 21 ? 'power' : x === 23 ? 'coin' : undefined);
    block(l, 22, 5, 'question', 'coin');
    pipe(l, 28, 11);
    pipe(l, 38, 10);
    pipe(l, 46, 9);
    pipe(l, 57, 9);
    l.pipes.push({ x: 57 * 16, y: 9 * 16, target: 'bonus', spawnX: 40, spawnY: 192 });
    block(l, 64, 8, 'hidden', 'life');
    enemy(l, 'goomba', 22);
    enemy(l, 'goomba', 40);
    enemy(l, 'goomba', 51);
    enemy(l, 'goomba', 53);
    for (let x = 77; x < 80; x++)
        block(l, x, 9, x === 78 ? 'question' : 'brick', x === 78 ? 'power' : undefined);
    rect(l, 80, 5, 8, 1, 'brick');
    rect(l, 91, 5, 3, 1, 'brick');
    block(l, 94, 5, 'question', 'coin');
    block(l, 94, 9, 'brick', 'coin');
    block(l, 100, 9, 'brick');
    block(l, 101, 9, 'brick', 'star');
    [106, 109, 112].forEach(x => block(l, x, 9, 'question', x === 109 ? 'power' : 'coin'));
    block(l, 109, 5, 'question', 'coin');
    rect(l, 118, 9, 3, 1, 'brick');
    rect(l, 121, 5, 3, 1, 'brick');
    rect(l, 128, 5, 4, 1, 'brick');
    block(l, 129, 9, 'brick');
    block(l, 130, 9, 'brick');
    coins(l, 80, 4, 7);
    coins(l, 121, 4, 3);
    enemy(l, 'goomba', 82, 4);
    enemy(l, 'goomba', 84, 4);
    enemy(l, 'green', 107);
    enemy(l, 'goomba', 114);
    enemy(l, 'goomba', 116);
    enemy(l, 'goomba', 125);
    enemy(l, 'goomba', 127);
    stairs(l, 134, 4);
    stairs(l, 140, 4, true);
    stairs(l, 148, 5);
    stairs(l, 155, 4, true);
    pipe(l, 163, 11, true);
    rect(l, 168, 9, 4, 1, 'brick');
    block(l, 170, 9, 'question', 'coin');
    enemy(l, 'goomba', 174);
    enemy(l, 'goomba', 176);
    pipe(l, 179, 11);
    stairs(l, 183, 8);
    rect(l, 191, 5, 1, 8, 'stone');
    l.goal = 198 * 16;
    return l;
}
function underground() {
    const l = makeLevel('1-2', 'Beneath the kingdom', 'underground', 166);
    rect(l, 0, 13, 54, 2);
    rect(l, 58, 13, 31, 2);
    rect(l, 112, 13, 54, 2);
    rect(l, 0, 3, 126, 1, 'brick');
    [10, 11, 12, 13, 14].forEach(x => block(l, x, 9, 'question', x === 10 ? 'power' : 'coin'));
    for (let x = 20; x < 44; x += 5) {
        rect(l, x, 10, 2, 3, 'brick');
        coins(l, x, 8, 2);
        enemy(l, 'goomba', x + 3);
    }
    rect(l, 46, 8, 7, 1, 'brick');
    coins(l, 46, 7, 7);
    block(l, 48, 8, 'brick', 'star');
    l.platforms.push({ x: 54 * 16, y: 176, width: 48, axis: 'y', range: 40, speed: 0.025 });
    rect(l, 64, 10, 9, 1, 'brick');
    coins(l, 64, 9, 9);
    enemy(l, 'green', 75);
    pipe(l, 80, 10, true);
    for (let i = 0; i < 3; i++)
        l.platforms.push({ x: (90 + i * 7) * 16, y: 160 - i * 16, width: 64, axis: 'y', range: 24, speed: 0.022 });
    rect(l, 114, 10, 5, 1, 'brick');
    block(l, 118, 10, 'question', 'power');
    enemy(l, 'green', 120);
    pipe(l, 126, 10);
    rect(l, 129, 4, 37, 9, 'brick');
    l.pipes.push({ x: 126 * 16, y: 160, target: '1-2-exit', spawnX: 40, spawnY: 176 });
    l.goal = 99999;
    return l;
}
function treetops() {
    const l = makeLevel('1-3', 'Above the clouds', 'overworld', 152);
    l.spawn.y = 160;
    rect(l, 0, 11, 12, 4, 'stone');
    const sections = [[15, 10, 7], [25, 8, 6], [35, 11, 8], [47, 9, 6], [58, 7, 7], [70, 10, 6], [83, 8, 7], [96, 10, 7], [110, 8, 8], [122, 11, 7]];
    sections.forEach(([x, y, w], i) => { rect(l, x, y, w, 1, 'stone'); coins(l, x + 1, y - 2, w - 2); if (i % 2 === 0)
        enemy(l, i % 4 === 0 ? 'red' : 'green', x + 3, y - 1); });
    block(l, 18, 6, 'question', 'power');
    block(l, 73, 6, 'question', 'power');
    l.platforms.push({ x: 52 * 16, y: 152, width: 48, axis: 'x', range: 32, speed: 0.025 }, { x: 76 * 16, y: 144, width: 48, axis: 'x', range: 32, speed: 0.025 }, { x: 103 * 16, y: 144, width: 48, axis: 'y', range: 32, speed: 0.028 });
    rect(l, 133, 13, 19, 2, 'ground');
    l.goal = 140 * 16;
    return l;
}
function castle() {
    const l = makeLevel('1-4', 'The last bridge', 'castle', 140);
    l.axe = true;
    rect(l, 0, 13, 22, 2, 'stone');
    rect(l, 26, 13, 18, 2, 'stone');
    rect(l, 49, 13, 22, 2, 'stone');
    rect(l, 76, 13, 25, 2, 'stone');
    rect(l, 116, 13, 24, 2, 'stone');
    rect(l, 0, 3, 119, 1, 'stone');
    rect(l, 22, 11, 4, 1, 'stone');
    rect(l, 44, 10, 5, 1, 'stone');
    rect(l, 71, 11, 5, 1, 'stone');
    block(l, 12, 9, 'question', 'power');
    block(l, 62, 9, 'question', 'power');
    block(l, 93, 9, 'question', 'power');
    [30, 53, 79, 96].forEach((x, i) => { rect(l, x, 11, 1, 2, 'stone'); l.firebars.push({ x: x * 16 + 8, y: 176, length: i % 2 ? 5 : 4 }); });
    l.platforms.push({ x: 102 * 16, y: 184, width: 48, axis: 'x', range: 24, speed: 0.025 });
    rect(l, 109, 11, 16, 1, 'brick');
    enemy(l, 'bowser', 119, 9);
    l.goal = 125 * 16;
    coins(l, 34, 9, 5);
    return l;
}
function bonus() { const l = makeLevel('bonus', 'A little secret', 'underground', 32); l.bonus = true; rect(l, 0, 13, 32, 2); rect(l, 0, 2, 32, 1, 'brick'); rect(l, 0, 3, 1, 10, 'brick'); rect(l, 7, 10, 13, 3, 'brick'); for (let y = 6; y < 10; y++)
    coins(l, 8, y, 11); pipe(l, 25, 10); l.pipes.push({ x: 400, y: 160, target: '1-1', spawnX: 163 * 16 + 10, spawnY: 176 }); l.goal = 99999; return l; }
function exit() { const l = makeLevel('1-2-exit', 'Back in the sunshine', 'overworld', 48); l.bonus = true; rect(l, 0, 13, 48, 2); pipe(l, 1, 12); stairs(l, 21, 8); l.goal = 35 * 16; return l; }
const original = [overworld(), underground(), treetops(), castle(), bonus(), exit()];
ceilingSecret(original[1], [4, 3, 2]);
original[3].lava = [{ x: 0, y: 223, width: original[3].width }];
original[3].bridge = { start: 109, end: 125, row: 11 };
export const LEVELS: Record<string, LevelDefinition> = Object.fromEntries([...original, ...firstDestinations(), ...remainingLevels(original[1])].map(l => [l.id, l]));
export const PROGRESSION = Array.from({ length: 8 }, (_, w) => Array.from({ length: 4 }, (_, s) => `${w + 1}-${s + 1}`)).flat();

// Fail early for authored data; runtime load() also rejects invalid external IDs safely.
export function validateLevels() {
    for (const id of PROGRESSION) if (!LEVELS[id]) throw new Error(`Missing playable stage: ${id}`);
    for (const level of Object.values(LEVELS)) {
        if (level.width < 256 || level.time <= 0) throw new Error(`Invalid bounds or timer: ${level.id}`);
        for (const link of [...level.pipes, ...(level.vines ?? [])]) if (!LEVELS[link.target]) throw new Error(`Invalid destination from ${level.id}: ${link.target}`);
        for (const zone of level.warpZones ?? []) if (zone.pipeIds.some(id => !level.pipes.some(p => p.id === id && p.warp))) throw new Error(`Invalid warp zone: ${level.id}`);
    }
}
validateLevels();
