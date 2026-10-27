export const TILE = 16;
export type Theme = 'overworld' | 'underground' | 'castle' | 'night' | 'underwater' | 'athletic' | 'sky';
export type TileKind = 'ground' | 'brick' | 'question' | 'used' | 'stone' | 'pipeL' | 'pipeR' | 'pipeBodyL' | 'pipeBodyR' | 'hidden' | 'mushroom';
export type ItemKind = 'coin' | 'power' | 'star' | 'life' | 'vine';
export interface Tile {
    kind: TileKind;
    item?: ItemKind;
    bump: number;
}
export type EnemyKind = 'goomba' | 'green' | 'red' | 'plant' | 'bowser' | 'cheep' | 'leapingCheep' | 'blooper' | 'hammerBro' | 'lakitu' | 'spiny' | 'egg' | 'bullet' | 'buzzy' | 'podoboo';
export interface EnemySpawn {
    kind: EnemyKind;
    x: number;
    y: number;
}
export type LevelId = `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}-${1 | 2 | 3 | 4}`;
export interface VineDef { x: number; bottom: number; top: number; target: string; spawnX: number; spawnY: number; }
export interface MazeGate { x: number; minY: number; maxY: number; returnX: number; returnY: number; }
export interface PlatformDef {
    kind?: 'oscillating' | 'balance' | 'falling';
    pair?: string;
    side?: 1 | -1;
    x: number;
    y: number;
    width: number;
    axis: 'x' | 'y';
    range: number;
    speed: number;
}
export interface PipeLink {
    id?: string;
    warp?: boolean;
    secret?: boolean;
    x: number;
    y: number;
    target: string;
    spawnX: number;
    spawnY: number;
}
export interface LevelDefinition {
    id: string;
    stageId?: LevelId;
    spawns?: Record<string, { x: number; y: number }>;
    warpZones?: { x: number; y: number; pipeIds: string[] }[];
    vines?: VineDef[];
    lava?: { x: number; y: number; width: number }[];
    mazes?: MazeGate[];
    cannons?: { x: number; y: number; period: number }[];
    bridge?: { start: number; end: number; row: number };
    bowser?: { firePeriod: number; jumpPeriod: number; hammers: boolean };
    name: string;
    theme: Theme;
    width: number;
    time: number;
    spawn: {
        x: number;
        y: number;
    };
    tiles: Record<string, Tile>;
    enemies: EnemySpawn[];
    coins: {
        x: number;
        y: number;
    }[];
    platforms: PlatformDef[];
    pipes: PipeLink[];
    firebars: {
        x: number;
        y: number;
        length: number;
        speed?: number;
        angle?: number;
    }[];
    goal: number;
    bonus?: boolean;
    axe?: boolean;
}
export const key = (x: number, y: number) => `${x},${y}`;
export function tileAt(level: LevelDefinition, x: number, y: number): Tile | undefined { return level.tiles[key(x, y)]; }
export function makeLevel(id: string, name: string, theme: Theme, width: number): LevelDefinition {
    return { id, name, theme, width: width * TILE, time: 400, spawn: { x: 40, y: 192 }, tiles: {}, enemies: [], coins: [], platforms: [], pipes: [], firebars: [], goal: (width - 12) * TILE };
}
export function rect(l: LevelDefinition, x: number, y: number, w: number, h: number, kind: TileKind = 'ground') {
    for (let a = x; a < x + w; a++)
        for (let b = y; b < y + h; b++)
            l.tiles[key(a, b)] = { kind, bump: 0 };
}
export function block(l: LevelDefinition, x: number, y: number, kind: TileKind, item?: ItemKind) { l.tiles[key(x, y)] = { kind, item, bump: 0 }; }
export function pipe(l: LevelDefinition, x: number, top: number, plant = false) {
    block(l, x, top, 'pipeL');
    block(l, x + 1, top, 'pipeR');
    for (let y = top + 1; y < 13; y++) {
        block(l, x, y, 'pipeBodyL');
        block(l, x + 1, y, 'pipeBodyR');
    }
    if (plant)
        l.enemies.push({ kind: 'plant', x: x * 16 + 8, y: top * 16 });
}
export function enemy(l: LevelDefinition, kind: EnemyKind, x: number, y = 12) { l.enemies.push({ kind, x: x * 16, y: y * 16 }); }
export function coins(l: LevelDefinition, x: number, y: number, count: number) { for (let i = 0; i < count; i++)
    l.coins.push({ x: (x + i) * 16 + 4, y: y * 16 }); }
export function stairs(l: LevelDefinition, x: number, count: number, reverse = false) { for (let i = 0; i < count; i++)
    rect(l, x + i, 13 - (reverse ? count - i : i + 1), 1, reverse ? count - i : i + 1, 'stone'); }
export function cloneLevel(level: LevelDefinition): LevelDefinition { return structuredClone(level); }
