import { block, coins, enemy, makeLevel, pipe, rect, stairs, type EnemyKind, type LevelDefinition, type LevelId, type Theme } from './Level';

// Hand-authored landmark layouts, not ROM-exact maps. Coordinates below are tiles.
function stage(id: LevelId, name: string, theme: Theme, width: number) {
    const l = makeLevel(id, name, theme, width);
    l.stageId = id;
    l.time = id.endsWith('-3') ? 300 : 400;
    return l;
}
function floor(l: LevelDefinition, spans: number[][]) {
    for (const [x, width] of spans) rect(l, x, 13, width, 2, l.theme === 'castle' ? 'stone' : 'ground');
}
function reward(l: LevelDefinition, x: number, y = 9) {
    block(l, x, y, 'question', 'power');
    block(l, x + 1, y, 'brick');
    block(l, x + 2, y, 'question', 'coin');
}
function foes(l: LevelDefinition, kind: EnemyKind, xs: number[], y = 12) {
    xs.forEach(x => enemy(l, kind, x, y));
}
function cannon(l: LevelDefinition, x: number, top = 11) {
    rect(l, x, top, 1, 13 - top, 'stone');
    (l.cannons ??= []).push({ x: x * 16, y: top * 16, period: 170 });
}
function finish(l: LevelDefinition) { stairs(l, l.width / 16 - 23, 6); return l; }

export function warpChamber(l: LevelDefinition, start: number, worlds: number[], y = 11) {
    const ids: string[] = [];
    worlds.forEach((world, i) => {
        const x = start + i * 6;
        pipe(l, x, y);
        const id = `${l.id}-warp-${world}`;
        ids.push(id);
        l.pipes.push({ id, x: x * 16, y: y * 16, target: `${world}-1`, spawnX: 40, spawnY: 192, warp: true, secret: true });
    });
    (l.warpZones ??= []).push({ x: (start + (worlds.length - 1) * 3 + 1) * 16, y: 100, pipeIds: ids });
}
export function ceilingSecret(l: LevelDefinition, worlds: number[]) {
    for (let x = 149; x < 166; x++) for (let y = 4; y < 13; y++) delete l.tiles[`${x},${y}`];
    l.platforms.push({ x: 128 * 16, y: 112, width: 16, axis: 'y', range: 56, speed: .022 });
    warpChamber(l, worlds.length === 1 ? 156 : 150, worlds);
}

export function firstDestinations(): LevelDefinition[] {
    const a = stage('2-1', 'Pipes and stairways', 'overworld', 184);
    floor(a, [[0, 47], [50, 49], [102, 82]]);
    [23, 35, 61, 88, 120, 145].forEach((x, i) => pipe(a, x, 11 - i % 3, i === 3));
    [14, 54, 108, 136].forEach(x => reward(a, x));
    stairs(a, 70, 4); stairs(a, 76, 4, true); coins(a, 73, 6, 5);
    foes(a, 'goomba', [30, 43, 66, 93, 115, 138]); foes(a, 'green', [58, 126]);
    a.pipes.push({ x: 61 * 16, y: 9 * 16, target: '2-1-bonus', spawnX: 40, spawnY: 192 });
    const b = stage('3-1', 'Hammers after dark', 'night', 192);
    floor(b, [[0, 55], [58, 61], [122, 70]]);
    [28, 49, 105, 151].forEach(x => pipe(b, x, 11));
    [14, 63, 130].forEach(x => reward(b, x));
    for (const x of [72, 138]) { rect(b, x, 9, 7, 1, 'brick'); rect(b, x + 2, 5, 5, 1, 'brick'); enemy(b, 'hammerBro', x + 3, 8); }
    foes(b, 'green', [37, 94, 164]); foes(b, 'goomba', [22, 44, 112]);
    const c = stage('4-1', 'Cloud rider', 'overworld', 202);
    floor(c, [[0, 62], [65, 66], [134, 68]]);
    [30, 52, 86, 112, 156].forEach((x, i) => pipe(c, x, 11 - i % 2));
    [16, 72, 142].forEach(x => reward(c, x));
    enemy(c, 'lakitu', 24, 4); foes(c, 'green', [98, 170]);
    rect(c, 100, 9, 7, 1, 'brick'); coins(c, 100, 8, 7);
    return [finish(a), finish(b), finish(c)];
}

function water(id: LevelId, width: number): LevelDefinition {
    const l = stage(id, id === '2-2' ? 'Coral passage' : 'Deep currents', 'underwater', width);
    floor(l, [[0, width]]);
    l.spawn.y = 144;
    const columns = id === '2-2' ? [[24, 10], [43, 8], [67, 10], [94, 7], [122, 9]] : [[18, 8], [38, 6], [60, 9], [82, 7], [110, 5], [138, 8], [158, 7]];
    for (const [x, top] of columns) { rect(l, x, top, 2, 13 - top, 'stone'); coins(l, x + 3, 6, 4); }
    rect(l, 54, 3, 9, 2, 'stone'); rect(l, 104, 3, 8, 1, 'stone');
    reward(l, 10, 8); reward(l, 78, 8);
    foes(l, 'cheep', id === '2-2' ? [32, 60, 105] : [28, 54, 76, 125, 149], 9);
    foes(l, 'blooper', id === '2-2' ? [51, 115] : [46, 96, 142], 6);
    pipe(l, width - 7, 10);
    l.pipes.push({ x: (width - 7) * 16, y: 160, target: `${id}-exit`, spawnX: 40, spawnY: 176 });
    l.goal = 99999;
    return l;
}
function bridge(id: LevelId, spans: number[][], fish: number[]) {
    const l = stage(id, 'Flying fish bridges', 'overworld', id === '2-3' ? 174 : 194);
    floor(l, [[0, 14], [l.width / 16 - 25, 25]]);
    for (const [x, w, y] of spans) { rect(l, x, y, w, 1, 'brick'); coins(l, x + 2, y - 2, Math.min(w - 3, 5)); }
    reward(l, 8, 9); reward(l, 87, 6);
    foes(l, 'leapingCheep', fish, 15);
    return l;
}
function athletic(id: LevelId, sections: number[][], mushroom = false) {
    const l = stage(id, mushroom ? 'Mushroom heights' : 'Skyward steps', id === '6-3' ? 'night' : 'athletic', 166);
    l.spawn.y = 160;
    rect(l, 0, 11, 12, 4, 'stone');
    sections.forEach(([x, y, w], i) => {
        rect(l, x, y, w, 1, mushroom ? 'mushroom' : 'stone');
        coins(l, x + 1, y - 2, w - 2);
        if (i % 3 === 1) enemy(l, 'red', x + 2, y - 1);
    });
    reward(l, 16, 6); reward(l, 86, 5);
    l.platforms.push({ x: 56 * 16, y: 144, width: 48, axis: 'y', range: 32, speed: .02, kind: 'balance', pair: 'a', side: 1 }, { x: 64 * 16, y: 144, width: 48, axis: 'y', range: 32, speed: .02, kind: 'balance', pair: 'a', side: -1 });
    l.platforms.push({ x: 117 * 16, y: 160, width: 48, axis: 'y', range: 0, speed: 0, kind: 'falling' });
    floor(l, [[140, 26]]);
    return l;
}
function fortress(id: LevelId, pits: number[][], bars: number[], maze = false) {
    const world = Number(id[0]);
    const l = stage(id, maze ? 'The looping halls' : 'Fire and stone', 'castle', 150 + world * 2);
    floor(l, [[0, l.width / 16]]);
    rect(l, 0, 3, l.width / 16 - 20, 1, 'stone');
    for (const [x, w] of pits) {
        for (let a = x; a < x + w; a++) for (let y = 13; y < 15; y++) delete l.tiles[`${a},${y}`];
        rect(l, x, 11, w, 1, 'stone');
        (l.lava ??= []).push({ x: x * 16, y: 223, width: w * 16 });
        enemy(l, 'podoboo', x + Math.floor(w / 2), 15);
    }
    [12, 65, 106].forEach(x => reward(l, x));
    bars.forEach((x, i) => l.firebars.push({ x: x * 16 + 8, y: 184, length: 3 + i % 3, speed: (i % 2 ? -1 : 1) * (.023 + world * .001), angle: i }));
    if (maze) {
        const gates = id === '4-4' ? [[44, 0, 121], [87, 145, 208]] : [[36, 145, 208], [65, 112, 160], [96, 0, 112]];
        l.mazes = gates.map(([x, minY, maxY]) => ({ x: x * 16, minY, maxY, returnX: (x - 19) * 16, returnY: 192 }));
        gates.forEach(([x]) => { rect(l, x - 12, 9, 14, 1, 'stone'); rect(l, x - 8, 6, 10, 1, 'stone'); });
    }
    const end = l.width / 16 - 15;
    for (let x = end - 16; x < end; x++) for (let y = 13; y < 15; y++) delete l.tiles[`${x},${y}`];
    rect(l, end - 16, 11, 16, 1, 'brick');
    l.lava ??= []; l.lava.push({ x: (end - 16) * 16, y: 223, width: 16 * 16 });
    l.bridge = { start: end - 16, end, row: 11 };
    l.brimstone = { firePeriod: Math.max(65, 115 - world * 5), jumpPeriod: 120 - world * 4, hammers: world >= 6 };
    enemy(l, 'brimstone', end - 6, 9);
    l.axe = true; l.goal = end * 16;
    return l;
}
function laterOverworld(id: LevelId, name: string, width: number, gaps: number[][], pipes: number[][], formations: [EnemyKind, number[]][]) {
    const l = stage(id, name, id[0] === '6' || id[0] === '3' ? 'night' : 'overworld', width);
    floor(l, [[0, width]]);
    gaps.forEach(([x, w]) => { for (let a = x; a < x + w; a++) for (let y = 13; y < 15; y++) delete l.tiles[`${a},${y}`]; });
    pipes.forEach(([x, y]) => pipe(l, x, y));
    [14, Math.floor(width * .38), Math.floor(width * .68)].forEach(x => reward(l, x));
    formations.forEach(([kind, xs]) => foes(l, kind, xs, kind === 'lakitu' ? 4 : 12));
    return finish(l);
}
function exitRoom(id: string, stageId: LevelId) {
    const l = makeLevel(id, 'Back in the sunshine', 'overworld', 48);
    l.stageId = stageId; l.bonus = true;
    floor(l, [[0, 48]]); pipe(l, 1, 12); stairs(l, 21, 8); l.goal = 35 * 16;
    return l;
}
export function remainingLevels(underground: LevelDefinition): LevelDefinition[] {
    const result: LevelDefinition[] = [];
    const add = (l: LevelDefinition) => { result.push(l); return l; };
    add(water('2-2', 150)); add(exitRoom('2-2-exit', '2-2'));
    add(bridge('2-3', [[17, 19, 11], [39, 24, 10], [66, 18, 11], [87, 24, 10], [114, 31, 11]], [28, 58, 79, 106, 133]));
    add(fortress('2-4', [[23, 5], [48, 4], [78, 6]], [34, 60, 97]));
    add(laterOverworld('3-2', 'Shell parade', 190, [[66, 3], [130, 3]], [[93, 11]], [['green', [27, 46, 80, 109, 141]], ['goomba', [32, 35, 51, 54, 86, 89, 115, 118, 146, 149]]]));
    add(athletic('3-3', [[15, 10, 7], [26, 8, 7], [38, 10, 8], [48, 8, 6], [72, 9, 8], [84, 7, 7], [96, 9, 8], [108, 10, 7], [125, 10, 11]]));
    add(fortress('3-4', [[26, 5], [55, 5], [89, 4]], [37, 70, 103]));
    const u = structuredClone(underground); u.id = '4-2'; u.stageId = '4-2'; u.name = 'Two secret passages'; u.warpZones = []; u.pipes = [{ x: 126 * 16, y: 160, target: '4-2-exit', spawnX: 40, spawnY: 176 }];
    // Rebuild the last chamber with its single World 5 destination.
    for (let x = 149; x < 166; x++) for (let y = 4; y < 13; y++) delete u.tiles[`${x},${y}`];
    warpChamber(u, 156, [5]);
    for (let x = 39; x <= 47; x++) for (let y = 8; y < 13; y++) delete u.tiles[`${x},${y}`];
    [40, 42, 44].forEach((x, i) => block(u, x, 9 - i, 'hidden', 'coin'));
    block(u, 44, 4, 'brick', 'vine');
    for (let x = 43; x <= 45; x++) delete u.tiles[`${x},3`];
    u.vines = [{ x: 44 * 16 + 8, bottom: 64, top: 32, target: '4-2-sky', spawnX: 40, spawnY: 160 }];
    foes(u, 'buzzy', [61, 85]); add(u); add(exitRoom('4-2-exit', '4-2'));
    const sky = makeLevel('4-2-sky', 'The high road', 'sky', 72); sky.stageId = '4-2'; sky.bonus = true; sky.spawn.y = 160; sky.goal = 99999;
    rect(sky, 0, 11, 16, 4, 'stone'); rect(sky, 19, 10, 14, 1, 'stone'); rect(sky, 36, 11, 12, 1, 'stone'); floor(sky, [[50, 22]]); coins(sky, 20, 8, 12); coins(sky, 37, 9, 10); warpChamber(sky, 52, [6, 7, 8]); add(sky);
    add(athletic('4-3', [[15, 9, 7], [26, 7, 7], [38, 9, 8], [48, 7, 6], [72, 8, 8], [84, 7, 6], [96, 9, 8], [108, 8, 7], [125, 9, 11]], true));
    add(fortress('4-4', [[16, 4], [106, 5]], [22, 110], true));
    const v51 = add(laterOverworld('5-1', 'Beetles and batteries', 196, [[53, 3], [104, 4], [152, 3]], [[36, 11], [92, 10], [137, 11]], [['buzzy', [24, 68, 122]], ['green', [44, 79, 146]]])); [62, 116, 161].forEach(x => cannon(v51, x));
    const v52 = add(laterOverworld('5-2', 'The raised battlements', 202, [[58, 4], [122, 3]], [[31, 10], [98, 11], [151, 10]], [['hammerBro', [78, 141]], ['green', [47, 112, 163]]])); rect(v52, 72, 9, 10, 1, 'brick'); rect(v52, 134, 9, 12, 1, 'brick'); cannon(v52, 111);
    add(athletic('5-3', [[15, 10, 6], [25, 8, 6], [36, 10, 7], [47, 8, 7], [72, 10, 7], [84, 8, 7], [96, 7, 7], [107, 9, 8], [125, 10, 10]]));
    add(fortress('5-4', [[20, 6], [49, 6], [84, 6]], [30, 61, 99]));
    add(laterOverworld('6-1', 'Moonlit pursuit', 200, [[60, 4], [128, 4]], [[28, 11], [49, 10], [96, 11], [148, 10]], [['lakitu', [25]], ['green', [76, 116, 162]]]));
    const v62 = add(laterOverworld('6-2', 'Pipes under the moon', 216, [[72, 3], [141, 4]], [[25, 11], [42, 10], [61, 9], [90, 11], [112, 9], [130, 10], [164, 9]], [['buzzy', [34, 81, 153]], ['hammerBro', [101, 182]]])); coins(v62, 50, 6, 9);
    add(athletic('6-3', [[15, 9, 6], [26, 7, 6], [37, 9, 7], [48, 7, 6], [72, 8, 7], [83, 6, 7], [96, 8, 7], [107, 9, 7], [125, 8, 10]]));
    add(fortress('6-4', [[25, 6], [57, 5], [90, 6]], [35, 72, 105]));
    const v71 = add(laterOverworld('7-1', 'Cannon boulevard', 208, [[68, 3], [138, 4]], [[42, 11], [113, 10], [163, 11]], [['hammerBro', [84, 153]], ['buzzy', [30, 99, 174]]])); [24, 57, 94, 126, 179].forEach(x => cannon(v71, x));
    add(water('7-2', 186)); add(exitRoom('7-2-exit', '7-2'));
    add(bridge('7-3', [[17, 22, 10], [42, 21, 11], [66, 23, 10], [92, 19, 9], [114, 22, 11], [139, 26, 10]], [26, 49, 74, 103, 124, 151]));
    add(fortress('7-4', [[15, 4], [109, 5]], [22, 115], true));
    add(laterOverworld('8-1', 'The long road', 278, [[49, 4], [87, 5], [134, 4], [181, 5], [226, 4]], [[32, 11], [74, 10], [119, 11], [164, 10], [213, 11]], [['goomba', [25, 29, 63, 67, 102, 107, 149, 153, 197, 201, 237]], ['buzzy', [41, 113, 173, 244]], ['green', [59, 96, 144, 192]]]));
    const v82 = add(laterOverworld('8-2', 'Under siege', 226, [[60, 5], [110, 5], [163, 5]], [[35, 11], [93, 10], [145, 11]], [['lakitu', [27]], ['buzzy', [47, 80, 129, 184]]])); [75, 122, 177, 195].forEach(x => cannon(v82, x));
    const v83 = add(laterOverworld('8-3', 'The castle approach', 220, [[87, 3], [151, 3]], [[57, 11], [131, 10]], [['hammerBro', [32, 70, 107, 143, 174, 190]], ['green', [47, 119, 163]]])); [28, 100, 169].forEach(x => rect(v83, x, 9, 10, 1, 'brick'));
    const final = add(fortress('8-4', [[22, 5], [51, 5]], [36])); final.name = 'The final labyrinth'; final.goal = 99999; final.axe = false; final.enemies = final.enemies.filter(e => e.kind !== 'brimstone'); final.bridge = undefined;
    pipe(final, 69, 10); pipe(final, 87, 10); final.pipes = [{ x: 69 * 16, y: 160, target: '8-4-hall', spawnX: 40, spawnY: 192 }, { x: 87 * 16, y: 160, target: '8-4', spawnX: 40, spawnY: 192 }]; rect(final, 92, 4, 2, 9, 'stone');
    const hall = makeLevel('8-4-hall', 'Choose the high pipe', 'castle', 80); hall.stageId = '8-4'; hall.goal = 99999; floor(hall, [[0, 80]]); reward(hall, 12); pipe(hall, 30, 11); pipe(hall, 49, 8); rect(hall, 44, 11, 3, 2, 'stone'); enemy(hall, 'hammerBro', 39); hall.pipes = [{ x: 30 * 16, y: 176, target: '8-4', spawnX: 40, spawnY: 192 }, { x: 49 * 16, y: 128, target: '8-4-water', spawnX: 40, spawnY: 144 }]; rect(hall, 60, 3, 2, 10, 'stone'); add(hall);
    const wet = water('8-4', 150); wet.id = '8-4-water'; wet.name = 'The flooded vault'; wet.pipes[0].target = '8-4-brimstone'; wet.pipes[0].spawnY = 192; wet.firebars.push({ x: 74 * 16, y: 140, length: 5, speed: -.025 }); add(wet);
    const boss = fortress('8-4', [[24, 5], [50, 6], [85, 4]], [35, 69, 102]); boss.id = '8-4-brimstone'; boss.name = 'King Brimstone'; add(boss);
    const bonus = makeLevel('2-1-bonus', 'A room of coins', 'underground', 32); bonus.stageId = '2-1'; bonus.bonus = true; bonus.goal = 99999; floor(bonus, [[0, 32]]); rect(bonus, 7, 10, 12, 3, 'brick'); for (let y = 6; y < 10; y++) coins(bonus, 8, y, 10); pipe(bonus, 25, 10); bonus.pipes.push({ x: 400, y: 160, target: '2-1', spawnX: 120 * 16 + 10, spawnY: 160 }); add(bonus);
    return result;
}
