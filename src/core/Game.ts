import { createEnemy, specialEnemy } from './Enemies';
import { AudioManager } from './Audio';
import { Input } from './Input';
import { blocked, move, PHYSICS, WATER_PHYSICS, solid } from './Physics';
import { Player, body, overlaps, type Enemy, type MovingPlatform, type Particle, type Pickup, type Projectile } from '../entities/Entity';
import { cloneLevel, key, tileAt, type LevelDefinition, type Tile, type PipeLink } from '../world/Level';
import { LEVELS, PROGRESSION } from '../world/levels';
import { CHARACTERS, type CharacterId } from '../entities/Character';
const STARTING_LIVES = 5;
export type CastleEndingPhase = 'bridge' | 'walking' | 'bonus' | 'dialogue' | 'transitioning';

export enum GameState {
    TITLE = 'TITLE',
    LEVEL_INTRO = 'LEVEL_INTRO',
    PLAYING = 'PLAYING',
    PAUSED = 'PAUSED',
    PLAYER_DYING = 'PLAYER_DYING',
    LEVEL_COMPLETE = 'LEVEL_COMPLETE',
    GAME_OVER = 'GAME_OVER',
    VICTORY = 'VICTORY',
    PIPE = 'PIPE'
}
interface Snapshot {
    level: LevelDefinition;
    enemies: Enemy[];
    pickups: Pickup[];
    platforms: MovingPlatform[];
    vines: number[];
    mazePassed: number[];
}
export class Game {
    state = GameState.TITLE;
    private characterId: CharacterId = 'mario';
    castlePhase: CastleEndingPhase | null = null;
    castleTicks = 0;
    player = new Player();
    level: LevelDefinition = cloneLevel(LEVELS['1-1']);
    enemies: Enemy[] = [];
    pickups: Pickup[] = [];
    projectiles: Projectile[] = [];
    particles: Particle[] = [];
    platforms: MovingPlatform[] = [];
    score = 0;
    coins = 0;
    lives = STARTING_LIVES;
    levelIndex = 0;
    highestWorldReached = 1;
    vines: number[] = [];
    mazePassed: number[] = [];
    time = 400;
    camera = 0;
    frame = 0;
    stateTicks = 0;
    best = 0;
    completed: string[] = [];
    private saved = new Map<string, Snapshot>();
    private pipeTarget: PipeLink | null = null;
    private pipeExit = false;
    private flagStage = 0;
    constructor(public input = new Input(), public audio = new AudioManager()) { this.load('1-1'); this.state = GameState.TITLE; }
    get world() { return PROGRESSION[this.levelIndex]; }
    get selectedCharacter() { return this.characterId; }
    get character() { return CHARACTERS[this.characterId]; }
    selectCharacter(id: CharacterId) {
        if (this.state !== GameState.TITLE) return;
        this.characterId = id;
    }
    get rescueDialogue(): string[] {
        if (this.castlePhase !== 'dialogue') return [];
        return [`THANK YOU ${this.character.displayName}!`, ...(this.level.ending?.character === 'peach'
            ? ['YOUR QUEST IS OVER.', 'YOU SAVED THE PRINCESS!']
            : ['BUT OUR PRINCESS IS', 'IN ANOTHER CASTLE!'])];
    }
    get progress() { return Math.min(1, (this.player.x / Math.min(this.level.goal, this.level.width))); }
    load(id: string, restore = false) {
        if (!LEVELS[id]) return false;
        this.castlePhase = null;
        this.castleTicks = 0;
        const owner = LEVELS[id].stageId ?? (id === 'bonus' ? '1-1' : id.slice(0, 3));
        const index = PROGRESSION.indexOf(owner);
        if (index >= 0) this.levelIndex = index;
        this.highestWorldReached = Math.max(this.highestWorldReached, Number(this.world[0]));
        const saved = restore ? this.saved.get(id) : undefined;
        this.level = saved?.level ?? cloneLevel(LEVELS[id]);
        this.enemies = saved?.enemies ?? this.level.enemies.map(createEnemy);
        this.pickups = saved?.pickups ?? [];
        this.vines = saved?.vines ?? (this.level.vines ?? []).map(() => 0);
        this.mazePassed = saved?.mazePassed ?? [];
        this.platforms = saved?.platforms ?? this.level.platforms.map(p => ({ ...p, originX: p.x, originY: p.y, phase: 0, dx: 0, dy: 0 }));
        this.projectiles = [];
        this.particles = [];
        const power = this.player.power;
        this.player = new Player();
        this.player.x = this.level.spawn.x;
        this.player.y = this.level.spawn.y;
        this.player.setPower(power);
        this.camera = 0;
        this.player.swimming = this.level.theme === 'underwater';
        return true;
    }
    begin() { this.score = 0; this.coins = 0; this.lives = STARTING_LIVES; this.levelIndex = 0; this.highestWorldReached = 1; this.pipeTarget = null; this.input.clear(); this.completed = []; this.saved.clear(); this.player = new Player(); this.time = 400; this.load('1-1'); this.change(GameState.LEVEL_INTRO); }
    change(state: GameState) { this.state = state; this.stateTicks = 0; }
    pause() { if (this.state === GameState.PLAYING)
        this.change(GameState.PAUSED); }
    resume() { if (this.state === GameState.PAUSED)
        this.change(GameState.PLAYING); }
    addScore(points: number, x?: number, y?: number) { this.score += points; this.best = Math.max(this.best, this.score); if (x !== undefined && y !== undefined)
        this.particles.push({ x, y, vx: 0, vy: -.35, life: 55, color: '#fff', text: String(points) }); }
    coin(x: number, y: number) { this.coins++; this.addScore(200, x, y); this.audio.play('coin'); if (this.coins >= 100) {
        this.coins -= 100;
        this.lives++;
        this.audio.play('life');
    } }
    hitBlock(x: number, y: number, t: Tile) {
        if (t.kind === 'used' || t.kind.startsWith('pipe') || t.kind === 'ground' || t.kind === 'stone') {
            this.audio.play('bump');
            return;
        }
        t.bump = 12;
        this.audio.play('bump');
        for (const e of this.enemies)
            if (!e.dead && Math.abs(e.y + e.h - y * 16) < 5 && e.x + e.w > x * 16 && e.x < (x + 1) * 16)
                this.defeat(e, 100);
        if (t.item) {
            const item = t.item;
            t.kind = 'used';
            delete t.item;
            if (item === 'vine') {
                const index = this.level.vines?.findIndex(v => Math.abs(v.x - (x * 16 + 8)) < 1) ?? -1;
                if (index >= 0) this.vines[index] = 1;
            }
            else if (item === 'coin') {
                this.coin(x * 16, y * 16 - 8);
                this.particles.push({ x: x * 16 + 6, y: y * 16 - 10, vx: 0, vy: -2, life: 24, color: '#ffce54' });
            }
            else {
                this.pickups.push({ ...body(x * 16 + 2, y * 16, 12, 14), kind: item === 'power' && this.player.big ? 'flower' : item, emerge: 32, homeY: y * 16, vx: item === 'power' || item === 'life' ? 1 : item === 'star' ? 1.4 : 0 });
                this.audio.play('emerge');
            }
        }
        else if (t.kind === 'question' || t.kind === 'hidden') {
            t.kind = 'used';
            this.coin(x * 16, y * 16 - 8);
        }
        else if (t.kind === 'brick' && this.player.big) {
            delete this.level.tiles[key(x, y)];
            this.addScore(50);
            this.audio.play('break');
            for (let i = 0; i < 4; i++)
                this.particles.push({ x: x * 16 + (i % 2) * 8, y: y * 16 + Math.floor(i / 2) * 8, vx: i % 2 ? 1.4 : -1.4, vy: -3 - Math.floor(i / 2), life: 40, color: this.level.theme === 'underground' ? '#6cb8f5' : '#bc582b' });
        }
    }
    damage() { const p = this.player; if (p.invulnerable || p.star || this.state !== GameState.PLAYING)
        return; if (p.big) {
        p.setPower(0);
        p.invulnerable = 120;
        this.audio.play('damage');
    }
    else
        this.die(); }
    die() { if (this.state !== GameState.PLAYING)
        return; this.lives--; this.player.vy = -4.6; this.player.vx = 0; this.change(GameState.PLAYER_DYING); this.audio.play('death'); }
    restart() { if (this.state !== GameState.PLAYING && this.state !== GameState.PAUSED)
        return; this.lives--; this.respawn(); }
    private respawn() { if (this.lives <= 0) {
        this.change(GameState.GAME_OVER);
        return;
    } this.saved.clear(); this.pipeTarget = null; this.input.clear(); this.player = new Player(); this.load(this.world); this.time = this.level.time; this.change(GameState.LEVEL_INTRO); }
    defeat(e: Enemy, points = 100) { if (e.dead)
        return; e.dead = 30; e.vx = 0; this.addScore(points, e.x, e.y); }
    private finish() { if (this.state !== GameState.PLAYING)
        return; this.addScore(this.level.axe ? 5000 : Math.max(100, Math.ceil((208 - this.player.y) / 32) * 1000), this.player.x, this.player.y); this.flagStage = 0; this.player.vx = 0; this.player.vy = 0; this.change(GameState.LEVEL_COMPLETE); this.audio.play('flag');
        if (this.level.ending) {
            this.castlePhase = 'bridge'; this.castleTicks = 0; this.input.clear(); this.projectiles = [];
            this.player.invulnerable = 0; this.player.climbing = null; this.player.fireCooldown = 0;
        }
    }
    update() {
        if (this.state !== GameState.PAUSED)
            this.frame++;
        this.stateTicks++;
        if (this.state === GameState.TITLE) {
            if (this.input.tap('up')) this.selectCharacter('mario');
            else if (this.input.tap('down')) this.selectCharacter('luigi');
        }
        if (this.input.tap('start')) {
            if ([GameState.TITLE, GameState.GAME_OVER, GameState.VICTORY].includes(this.state))
                this.begin();
            else if (this.state === GameState.PLAYING)
                this.pause();
            else if (this.state === GameState.PAUSED)
                this.resume();
        }
        if (this.state === GameState.LEVEL_INTRO && this.stateTicks > 100)
            this.change(GameState.PLAYING);
        else if (this.state === GameState.PLAYER_DYING) {
            if (this.stateTicks > 20) {
                this.player.vy += .18;
                this.player.y += this.player.vy;
            }
            if (this.stateTicks > 110)
                this.respawn();
        }
        else if (this.state === GameState.LEVEL_COMPLETE)
            this.completeStep();
        else if (this.state === GameState.PIPE)
            this.pipeStep();
        else if (this.state === GameState.PLAYING)
            this.playStep();
        this.audio.update(this.level.theme, this.player.star > 0, this.state === GameState.PLAYING);
        if (this.state !== GameState.PAUSED) {
            for (const p of this.particles) {
                p.x += p.vx;
                p.y += p.vy;
                if (!p.text)
                    p.vy += .14;
                p.life--;
            }
            this.particles = this.particles.filter(p => p.life > 0);
        }
        this.input.end();
    }
    private playStep() {
        const p = this.player;
        this.time -= 1 / 24;
        if (this.time <= 0) {
            this.time = 0;
            this.die();
            return;
        }
        for (const t of Object.values(this.level.tiles))
            if (t.bump > 0)
                t.bump--;
        if (p.transform > 0)
            p.transform--;
        if (p.invulnerable > 0)
            p.invulnerable--;
        if (p.star > 0)
            p.star--;
        if (p.fireCooldown > 0)
            p.fireCooldown--;
        for (let i = 0; i < this.vines.length; i++) if (this.vines[i] > 0) this.vines[i] = Math.min(this.level.vines![i].bottom - this.level.vines![i].top, this.vines[i] + 1);
        for (const platform of this.platforms) {
            const oldX = platform.x, oldY = platform.y;
            const riding = p.grounded && Math.abs(p.y + p.h - oldY) < 2 && p.x + p.w > oldX && p.x < oldX + platform.width;
            if (platform.kind === 'falling') {
                if (riding || platform.fallSpeed) platform.fallSpeed = Math.min(3, (platform.fallSpeed ?? 0) + .035);
                platform.y += platform.fallSpeed ?? 0;
            } else if (platform.kind === 'balance') {
                const partner = this.platforms.find(other => other !== platform && other.pair === platform.pair);
                const otherRiding = partner && p.grounded && Math.abs(p.y + p.h - partner.y) < 3 && p.x + p.w > partner.x && p.x < partner.x + partner.width;
                platform.y = Math.max(platform.originY - platform.range, Math.min(platform.originY + platform.range, platform.y + (riding ? .45 : otherRiding ? -.45 : 0)));
            } else {
                platform.phase += platform.speed;
                platform[platform.axis] = platform[platform.axis === 'x' ? 'originX' : 'originY'] + Math.sin(platform.phase) * platform.range;
            }
            platform.dx = platform.x - oldX;
            platform.dy = platform.y - oldY;
            if (p.grounded && Math.abs(p.y + p.h - oldY) < 2 && p.x + p.w > oldX && p.x < oldX + platform.width) {
                p.x += platform.dx;
                p.y += platform.dy;
            }
        }
        const oldX = p.x;
        if (this.climbStep()) { this.updateEnemies(p.y + p.h); return; }
        const swimming = this.level.theme === 'underwater';
        p.swimming = swimming;
        const down = this.input.down('down');
        if (p.big && !swimming) {
            const bottom = p.y + p.h;
            if (down && p.grounded && !p.crouched) {
                p.h = 16;
                p.y = bottom - 16;
                p.crouched = true;
            }
            else if (!down && p.crouched && !blocked(this.level, { x: p.x, y: bottom - 28, w: p.w, h: 28 })) {
                p.h = 28;
                p.y = bottom - 28;
                p.crouched = false;
            }
        }
        const direction = (this.input.down('right') ? 1 : 0) - (this.input.down('left') ? 1 : 0);
        const accel = swimming ? WATER_PHYSICS.acceleration : p.grounded ? PHYSICS.groundAcceleration : PHYSICS.airAcceleration;
        p.skidding = direction !== 0 && Math.sign(p.vx) !== direction && Math.abs(p.vx) > 1 && p.grounded;
        if (direction && !p.crouched) {
            p.facing = direction;
            const max = swimming ? WATER_PHYSICS.speed : this.input.down('run') ? PHYSICS.run : PHYSICS.walk;
            if (p.vx * direction < max) {
                p.vx += direction * (p.skidding ? accel * 1.8 : accel);
                if (p.vx * direction > max)
                    p.vx = direction * max;
            }
            else if (p.grounded && Math.abs(p.vx) > max)
                p.vx -= Math.sign(p.vx) * Math.min(.04, Math.abs(p.vx) - max);
            p.vx = Math.max(-PHYSICS.run, Math.min(PHYSICS.run, p.vx));
        }
        else if (p.grounded || swimming)
            p.vx = Math.sign(p.vx) * Math.max(0, Math.abs(p.vx) - (swimming ? WATER_PHYSICS.friction : PHYSICS.friction));
        if (this.input.tap('jump') && (p.grounded || swimming)) {
            p.vy = swimming ? -WATER_PHYSICS.swim : -(Math.abs(p.vx) > 2 ? PHYSICS.runJump : PHYSICS.jump);
            p.grounded = false;
            this.audio.play('jump');
        }
        p.vy = swimming ? Math.min(WATER_PHYSICS.maxFall, p.vy + WATER_PHYSICS.gravity) : Math.min(PHYSICS.maxFall, p.vy + (p.vy < 0 && this.input.down('jump') ? PHYSICS.heldGravity : PHYSICS.gravity));
        const oldBottom = p.y + p.h;
        move(p, this.level, (x, y, t) => this.hitBlock(x, y, t));
        for (const platform of this.platforms)
            if (p.vy >= 0 && oldBottom <= platform.y - platform.dy + 2 && p.y + p.h >= platform.y && p.x + p.w > platform.x && p.x < platform.x + platform.width) {
                p.y = platform.y - p.h;
                p.vy = 0;
                p.grounded = true;
            }
        if (swimming && p.y < 40) { p.y = 40; p.vy = Math.max(0, p.vy); }
        p.x = Math.max(this.camera, Math.min(this.level.width - p.w, p.x));
        p.walk += Math.abs(p.vx) * .15;
        if (this.input.tap('run') && p.power === 2 && p.fireCooldown === 0 && this.projectiles.filter(f => !f.hostile).length < 2) {
            this.projectiles.push({ ...body(p.x + (p.facing > 0 ? 12 : -4), p.y + 8, 6, 6), vx: p.facing * 3.5, vy: 1, life: 150, hostile: false });
            p.fireCooldown = 15;
            this.audio.play('fire');
        }
        const chamber = this.level.warpZones?.find(zone => p.y > 80 && zone.pipeIds.some(id => {
            const pipe = this.level.pipes.find(link => link.id === id);
            return pipe && p.x >= pipe.x - 16 && p.x <= pipe.x + 224;
        }));
        const cameraTarget = Math.min(this.level.width - 256, p.x - (chamber ? 32 : 104));
        this.camera = Math.max(this.camera, chamber ? Math.min(cameraTarget, this.camera + 8) : cameraTarget);
        if (p.y > 248 || this.level.lava?.some(lava => p.x + p.w > lava.x && p.x < lava.x + lava.width && p.y + p.h > lava.y)) {
            this.die();
            return;
        }
        for (const link of this.level.pipes)
            if (LEVELS[link.target] && down && p.grounded && Math.abs(p.x + p.w / 2 - (link.x + 16)) < 12 && Math.abs(p.y + p.h - link.y) < 2) {
                this.saved.set(this.level.id, { level: this.level, enemies: this.enemies, pickups: this.pickups, platforms: this.platforms, vines: this.vines, mazePassed: this.mazePassed });
                this.pipeTarget = link;
                this.pipeExit = false;
                p.x = link.x + 10;
                this.change(GameState.PIPE);
                this.audio.play('emerge');
                return;
            }
        for (const [i, gate] of (this.level.mazes ?? []).entries()) {
            if (!this.mazePassed.includes(i) && oldX < gate.x && p.x + p.w >= gate.x) {
                const feet = p.y + p.h;
                if (feet >= gate.minY && feet <= gate.maxY) this.mazePassed.push(i);
                else { p.x = gate.returnX; p.y = gate.returnY; p.vx = 0; p.vy = 0; this.camera = Math.max(0, p.x - 104); }
            }
        }
        for (const cannon of this.level.cannons ?? []) {
            if (this.frame % cannon.period === 0 && Math.abs(p.x - cannon.x) > 40 && Math.abs(p.x - cannon.x) < 280) {
                const bill = createEnemy({ kind: 'bullet', x: cannon.x, y: cannon.y });
                bill.vx = p.x < cannon.x ? -1.7 : 1.7; this.enemies.push(bill);
            }
        }
        this.updateEnemies(oldBottom);
        if (this.state !== GameState.PLAYING)
            return;
        this.updatePickups();
        this.updateProjectiles();
        this.level.coins = this.level.coins.filter(c => { if (overlaps(p, { ...c, w: 8, h: 12 })) {
            this.coin(c.x, c.y);
            return false;
        } return true; });
        for (const bar of this.level.firebars)
            for (let i = 1; i <= bar.length; i++) {
                const a = this.frame * (bar.speed ?? .035) + (bar.angle ?? 0);
                const x = bar.x + Math.cos(a) * i * 8, y = bar.y + Math.sin(a) * i * 8;
                if (overlaps(p, { x: x - 3, y: y - 3, w: 6, h: 6 }))
                    this.damage();
            }
        if (p.x + p.w >= this.level.goal && (this.level.axe ? p.y < 192 : true))
            this.finish();
    }
    private updateEnemies(oldBottom: number) {
        const p = this.player;
        for (const e of this.enemies) {
            if (e.dead) {
                e.dead--;
                if (e.dead === 0)
                    e.y = 400;
                continue;
            }
            if (e.y > 280 && e.kind !== 'podoboo' && e.kind !== 'leapingCheep')
                continue;
            if (e.x < this.camera - 64 || e.x > this.camera + 288)
                continue;
            e.active = true;
            e.phase++;
            if (e.safe > 0)
                e.safe--;
            if (specialEnemy(this, e)) { /* Behavior handled by the shared enemy system. */ }
            else if (e.kind === 'plant') {
                const cycle = e.phase % 220;
                const near = Math.abs(p.x - e.homeX) < 28;
                if (cycle === 80 && near)
                    e.phase--;
                e.y = e.homeY - (cycle > 80 && cycle < 170 ? Math.min(24, (cycle - 80) * .8) : Math.max(0, 24 - (cycle >= 170 ? cycle - 170 : 40) * .8));
                if (e.y >= e.homeY - 3)
                    continue;
            }
            else if (e.kind === 'bowser') {
                e.vx = Math.sin(e.phase * .025) * .7;
                if (e.grounded && e.phase % (this.level.bowser?.jumpPeriod ?? 120) === 0)
                    e.vy = -3.6;
                e.vy = Math.min(4, e.vy + .16);
                move(e, this.level);
                if (e.phase % (this.level.bowser?.firePeriod ?? 100) === 0)
                    this.projectiles.push({ ...body(e.x, e.y + 9, 12, 6), vx: -1.8, vy: 0, life: 240, hostile: true });
            }
            else {
                if (e.kind === 'red' && !e.shell && e.grounded && !solid(tileAt(this.level, Math.floor((e.x + (e.vx > 0 ? e.w + 2 : -2)) / 16), Math.floor((e.y + e.h + 2) / 16))))
                    e.vx = -e.vx;
                e.vy = Math.min(4, e.vy + .22);
                const vx = e.vx;
                const hit = move(e, this.level);
                if (hit.wall)
                    e.vx = -vx;
            }
            if (e.kind === 'bowser' && this.level.bowser?.hammers && e.phase % 130 === 0) this.projectiles.push({ ...body(e.x, e.y, 8, 10), vx: -1.5, vy: -3.6, life: 120, hostile: true, kind: 'hammer' });
            if (e.shell && Math.abs(e.vx) > 1)
                for (const other of this.enemies)
                    if (other !== e && !other.dead && other.kind !== 'plant' && other.kind !== 'podoboo' && overlaps(e, other))
                        this.defeat(other, 200);
            if (!overlaps(p, e) || e.safe > 0)
                continue;
            if (p.star && e.kind !== 'podoboo') {
                this.defeat(e, 200);
                continue;
            }
            const stomp = p.vy >= 0 && oldBottom <= e.y + 7 && !['plant', 'bowser', 'spiny', 'egg', 'podoboo', 'blooper'].includes(e.kind) && !p.swimming;
            if (stomp) {
                p.y = e.y - p.h;
                p.vy = this.input.down('jump') ? -4 : -2.8;
                this.audio.play('stomp');
                if (!['green', 'red', 'buzzy'].includes(e.kind))
                    this.defeat(e);
                else if (!e.shell) {
                    e.shell = true;
                    e.vx = 0;
                    e.safe = 12;
                    this.addScore(100, e.x, e.y);
                }
                else if (e.vx) {
                    e.vx = 0;
                    e.safe = 12;
                }
                else
                    this.kick(e);
            }
            else if (e.shell && e.vx === 0)
                this.kick(e);
            else
                this.damage();
        }
        this.enemies = this.enemies.filter(e => (e.y < 320 || e.kind === 'podoboo' || e.kind === 'leapingCheep') && (e.kind !== 'bullet' || e.x > this.camera - 64 && e.x < this.camera + 400));
    }
    private kick(e: Enemy) { e.vx = this.player.x < e.x ? 3.5 : -3.5; e.safe = 15; this.audio.play('kick'); }
    private updatePickups() {
        for (const item of this.pickups) {
            if (item.emerge > 0) {
                item.emerge--;
                item.y = item.homeY - (32 - item.emerge) * .5;
                continue;
            }
            if (item.kind !== 'flower') {
                item.vy = Math.min(4, item.vy + .2);
                const vx = item.vx;
                const hit = move(item, this.level);
                if (hit.wall)
                    item.vx = -vx;
                if (item.kind === 'star' && item.grounded)
                    item.vy = -3.5;
            }
            if (overlaps(this.player, item)) {
                if (item.kind === 'star') {
                    this.player.star = 600;
                }
                else if (item.kind === 'life') {
                    this.lives++;
                    this.audio.play('life');
                }
                else if (item.kind === 'flower')
                    this.grow(2);
                else if (!this.player.big)
                    this.grow(1);
                this.addScore(1000, item.x, item.y);
                if (item.kind !== 'life')
                    this.audio.play('power');
                item.y = 400;
            }
        }
        this.pickups = this.pickups.filter(i => i.y < 280);
    }
    private grow(power: 1 | 2) { const p = this.player; p.setPower(power); p.transform = 30; if (blocked(this.level, p)) {
        p.y += 12;
        p.h = 16;
        p.crouched = true;
    } }
    private updateProjectiles() { for (const f of this.projectiles) {
        f.life--;
        if (f.hostile) {
            f.x += f.vx;
            if (f.kind === 'hammer') { f.vy += .12; f.y += f.vy; }
            if (overlaps(this.player, f)) {
                this.damage();
                f.life = 0;
            }
        }
        else {
            f.vy += .2;
            const hit = move(f, this.level);
            if (hit.wall)
                f.life = 0;
            if (hit.landed)
                f.vy = -2.5;
            for (const e of this.enemies)
                if (!e.dead && overlaps(f, e)) {
                    f.life = 0;
                    if (e.kind === 'bowser') {
                        if (--e.health <= 0)
                            this.defeat(e, 5000);
                    }
                    else if (e.kind !== 'buzzy' && e.kind !== 'podoboo')
                        this.defeat(e, 200);
                    break;
                }
        }
    } this.projectiles = this.projectiles.filter(f => f.life > 0 && f.y < 260 && f.x > this.camera - 32 && f.x < this.camera + 288); }
    private climbStep(): boolean {
        const p = this.player;
        for (const [i, vine] of (this.level.vines ?? []).entries()) {
            if (p.climbing === null && p.y > vine.top + 8 && this.vines[i] > 0 && this.input.down('up') && Math.abs(p.x + p.w / 2 - vine.x) < 14 && p.y + p.h >= vine.bottom - this.vines[i] && p.y < vine.bottom) p.climbing = i;
        }
        if (p.climbing === null) return false;
        const vine = this.level.vines![p.climbing];
        if (this.input.tap('jump')) { p.climbing = null; p.vy = -PHYSICS.jump; return false; }
        p.x = vine.x - p.w / 2; p.vx = 0; p.vy = 0; p.grounded = false;
        p.y += (this.input.down('down') ? 1 : 0) - (this.input.down('up') ? 1 : 0);
        if (p.y >= vine.bottom) { p.climbing = null; return false; }
        if (p.y <= vine.top && this.vines[p.climbing] >= vine.bottom - vine.top && LEVELS[vine.target]) {
            this.saved.set(this.level.id, { level: this.level, enemies: this.enemies, pickups: this.pickups, platforms: this.platforms, vines: this.vines, mazePassed: this.mazePassed });
            this.load(vine.target, true); this.player.x = vine.spawnX; this.player.y = vine.spawnY - (this.player.h - 16); this.input.clear(); this.change(GameState.LEVEL_INTRO);
        }
        return true;
    }
    returnToTitle() { this.input.clear(); this.pipeTarget = null; this.saved.clear(); this.load('1-1'); this.change(GameState.TITLE); }
    selectLevel(id: string) {
        if (!PROGRESSION.includes(id) || !LEVELS[id]) return false;
        this.saved.clear(); this.pipeTarget = null; this.input.clear(); this.load(id); this.time = this.level.time; this.change(GameState.LEVEL_INTRO); return true;
    }
    private pipeStep() { if (!this.pipeTarget)
        return; if (!this.pipeExit) {
        this.player.y += .5;
        if (this.stateTicks >= 60) {
            const target = this.pipeTarget;
            if (target.warp) {
                this.saved.clear();
                this.load(target.target);
                this.time = this.level.time;
                this.pipeTarget = null;
                this.input.clear();
                this.change(GameState.LEVEL_INTRO);
                return;
            }
            this.load(target.target, true);
            this.player.x = target.spawnX;
            this.player.y = target.spawnY + 32 - this.player.h;
            this.camera = Math.max(0, Math.min(this.level.width - 256, this.player.x - 104));
            this.pipeExit = true;
            this.stateTicks = 0;
        }
    }
    else {
        this.player.y -= .5;
        if (this.stateTicks >= 64) {
            this.change(GameState.PLAYING);
            this.player.invulnerable = 60;
            this.pipeTarget = null;
            this.input.clear();
        }
    } }
    private completeStep() {
        if (this.level.ending) { this.castleStep(); return; }
        const p = this.player;
        if (this.flagStage === 0) {
            p.x = this.level.goal - 6;
            p.y += 1.6;
            if (p.y + p.h >= 208) {
                p.y = 208 - p.h;
                this.flagStage = 1;
            }
        }
        else if (this.flagStage === 1) {
            p.x += 1.1;
            p.walk += .2;
            p.facing = 1;
            if (p.x > this.level.goal + 45)
                this.flagStage = 2;
        }
        if (this.flagStage === 2) {
            const bonus = Math.min(10, Math.ceil(this.time));
            this.time = Math.max(0, this.time - bonus);
            this.addScore(bonus * 50);
            if (this.time === 0) {
                this.flagStage = 3;
                this.stateTicks = 0;
                this.audio.play('complete');
            }
        }
        if (this.flagStage === 3 && this.stateTicks > 100) {
            this.completed.push(this.world);
            if (this.levelIndex === PROGRESSION.length - 1)
                this.change(GameState.VICTORY);
            else {
                this.levelIndex++;
                this.saved.clear();
                this.load(this.world);
                this.time = this.level.time;
                this.change(GameState.LEVEL_INTRO);
            }
        }
    }

    private castleStep() {
        const ending = this.level.ending!, p = this.player;
        this.castleTicks++;
        if (this.castlePhase === 'bridge') {
            const bridge = this.level.bridge!;
            if (this.castleTicks % 5 === 0) {
                const x = bridge.end - this.castleTicks / 5;
                if (x >= bridge.start) delete this.level.tiles[key(x, bridge.row)];
            }
            for (const enemy of this.enemies) if (enemy.kind === 'bowser' && !enemy.dead) enemy.y += 2;
            if (this.castleTicks >= Math.max(100, (bridge.end - bridge.start) * 5)) {
                p.x = Math.max(p.x, this.level.goal);
                p.setPower(p.power); p.skidding = false;
                this.castlePhase = 'walking'; this.castleTicks = 0;
            }
        }
        else if (this.castlePhase === 'walking') {
            p.facing = 1; p.vx = Math.min(1.1, Math.max(0, ending.x - 28 - p.x));
            p.vy += PHYSICS.gravity; p.walk += .2;
            move(p, this.level);
            const target = Math.max(0, Math.min(this.level.width - 256, ending.x - 144));
            this.camera += Math.max(-2, Math.min(2, target - this.camera));
            if (p.x >= ending.x - 28 && p.grounded && Math.abs(target - this.camera) < 1) {
                p.vx = 0; this.camera = target;
                this.castlePhase = 'bonus'; this.castleTicks = 0;
            }
        }
        else if (this.castlePhase === 'bonus') {
            const bonus = Math.min(10, Math.ceil(this.time));
            this.time = Math.max(0, this.time - bonus); this.addScore(bonus * 50);
            if (this.time === 0) {
                this.castlePhase = 'dialogue'; this.castleTicks = 0; this.input.clear();
                this.audio.play(ending.character === 'peach' ? 'rescuePeach' : 'rescueToad');
            }
        }
        else if (this.castlePhase === 'dialogue' && (this.input.tap('start') || ending.character === 'toad' && this.castleTicks >= 240)) {
            this.castlePhase = 'transitioning'; this.input.clear();
            if (!this.completed.includes(this.world)) this.completed.push(this.world);
            if (ending.character === 'peach') {
                this.change(GameState.VICTORY); this.audio.play('victory');
            }
            else {
                this.saved.clear(); this.load(ending.nextLevel); this.time = this.level.time;
                this.change(GameState.LEVEL_INTRO);
            }
        }
    }
}
