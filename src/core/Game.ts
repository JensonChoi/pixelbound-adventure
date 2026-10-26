import { AudioManager } from './Audio';
import { Input } from './Input';
import { blocked, move, PHYSICS, solid } from './Physics';
import { Player, body, overlaps, type Enemy, type MovingPlatform, type Particle, type Pickup, type Projectile } from '../entities/Entity';
import { cloneLevel, key, tileAt, type LevelDefinition, type Tile } from '../world/Level';
import { LEVELS, PROGRESSION } from '../world/levels';
const STARTING_LIVES = 5;

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
}
export class Game {
    state = GameState.TITLE;
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
    time = 400;
    camera = 0;
    frame = 0;
    stateTicks = 0;
    best = 0;
    completed: string[] = [];
    private saved = new Map<string, Snapshot>();
    private pipeTarget: {
        target: string;
        spawnX: number;
        spawnY: number;
    } | null = null;
    private pipeExit = false;
    private flagStage = 0;
    constructor(public input = new Input(), public audio = new AudioManager()) { this.load('1-1'); this.state = GameState.TITLE; }
    get world() { return PROGRESSION[this.levelIndex]; }
    get progress() { return Math.min(1, (this.player.x / Math.min(this.level.goal, this.level.width))); }
    load(id: string, restore = false) {
        const saved = restore ? this.saved.get(id) : undefined;
        this.level = saved?.level ?? cloneLevel(LEVELS[id]);
        this.enemies = saved?.enemies ?? this.level.enemies.map(e => ({ ...body(e.x, e.y, e.kind === 'bowser' ? 28 : 12, e.kind === 'bowser' ? 32 : e.kind === 'plant' ? 24 : 16), kind: e.kind, homeX: e.x, homeY: e.y, phase: 0, shell: false, dead: 0, active: false, health: 5, safe: 0, vx: e.kind === 'bowser' ? -.6 : -.5 }));
        this.pickups = saved?.pickups ?? [];
        this.platforms = saved?.platforms ?? this.level.platforms.map(p => ({ ...p, originX: p.x, originY: p.y, phase: 0, dx: 0, dy: 0 }));
        this.projectiles = [];
        this.particles = [];
        const power = this.player.power;
        this.player = new Player();
        this.player.x = this.level.spawn.x;
        this.player.y = this.level.spawn.y;
        this.player.setPower(power);
        this.camera = 0;
    }
    begin() { this.score = 0; this.coins = 0; this.lives = STARTING_LIVES; this.levelIndex = 0; this.completed = []; this.saved.clear(); this.player = new Player(); this.time = 400; this.load('1-1'); this.change(GameState.LEVEL_INTRO); }
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
            if (item === 'coin') {
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
    } this.saved.clear(); this.player = new Player(); this.load(this.world); this.time = this.level.time; this.change(GameState.LEVEL_INTRO); }
    defeat(e: Enemy, points = 100) { if (e.dead)
        return; e.dead = 30; e.vx = 0; this.addScore(points, e.x, e.y); }
    private finish() { if (this.state !== GameState.PLAYING)
        return; this.addScore(this.level.axe ? 5000 : Math.max(100, Math.ceil((208 - this.player.y) / 32) * 1000), this.player.x, this.player.y); this.flagStage = 0; this.player.vx = 0; this.player.vy = 0; this.change(GameState.LEVEL_COMPLETE); this.audio.play('flag'); }
    update() {
        if (this.state !== GameState.PAUSED)
            this.frame++;
        this.stateTicks++;
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
        for (const platform of this.platforms) {
            const oldX = platform.x, oldY = platform.y;
            platform.phase += platform.speed;
            platform[platform.axis] = platform[platform.axis === 'x' ? 'originX' : 'originY'] + Math.sin(platform.phase) * platform.range;
            platform.dx = platform.x - oldX;
            platform.dy = platform.y - oldY;
            if (p.grounded && Math.abs(p.y + p.h - oldY) < 2 && p.x + p.w > oldX && p.x < oldX + platform.width) {
                p.x += platform.dx;
                p.y += platform.dy;
            }
        }
        const down = this.input.down('down');
        if (p.big) {
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
        const accel = p.grounded ? PHYSICS.groundAcceleration : PHYSICS.airAcceleration;
        p.skidding = direction !== 0 && Math.sign(p.vx) !== direction && Math.abs(p.vx) > 1 && p.grounded;
        if (direction && !p.crouched) {
            p.facing = direction;
            const max = this.input.down('run') ? PHYSICS.run : PHYSICS.walk;
            if (p.vx * direction < max) {
                p.vx += direction * (p.skidding ? accel * 1.8 : accel);
                if (p.vx * direction > max)
                    p.vx = direction * max;
            }
            else if (p.grounded && Math.abs(p.vx) > max)
                p.vx -= Math.sign(p.vx) * Math.min(.04, Math.abs(p.vx) - max);
            p.vx = Math.max(-PHYSICS.run, Math.min(PHYSICS.run, p.vx));
        }
        else if (p.grounded)
            p.vx = Math.sign(p.vx) * Math.max(0, Math.abs(p.vx) - PHYSICS.friction);
        if (this.input.tap('jump') && p.grounded) {
            p.vy = -(Math.abs(p.vx) > 2 ? PHYSICS.runJump : PHYSICS.jump);
            p.grounded = false;
            this.audio.play('jump');
        }
        p.vy = Math.min(PHYSICS.maxFall, p.vy + (p.vy < 0 && this.input.down('jump') ? PHYSICS.heldGravity : PHYSICS.gravity));
        const oldBottom = p.y + p.h;
        move(p, this.level, (x, y, t) => this.hitBlock(x, y, t));
        for (const platform of this.platforms)
            if (p.vy >= 0 && oldBottom <= platform.y - platform.dy + 2 && p.y + p.h >= platform.y && p.x + p.w > platform.x && p.x < platform.x + platform.width) {
                p.y = platform.y - p.h;
                p.vy = 0;
                p.grounded = true;
            }
        p.x = Math.max(this.camera, Math.min(this.level.width - p.w, p.x));
        p.walk += Math.abs(p.vx) * .15;
        if (this.input.tap('run') && p.power === 2 && p.fireCooldown === 0 && this.projectiles.filter(f => !f.hostile).length < 2) {
            this.projectiles.push({ ...body(p.x + (p.facing > 0 ? 12 : -4), p.y + 8, 6, 6), vx: p.facing * 3.5, vy: 1, life: 150, hostile: false });
            p.fireCooldown = 15;
            this.audio.play('fire');
        }
        this.camera = Math.max(this.camera, Math.min(this.level.width - 256, p.x - 104));
        if (p.y > 248) {
            this.die();
            return;
        }
        for (const link of this.level.pipes)
            if (down && p.grounded && Math.abs(p.x + p.w / 2 - (link.x + 16)) < 12 && Math.abs(p.y + p.h - link.y) < 2) {
                this.saved.set(this.level.id, { level: this.level, enemies: this.enemies, pickups: this.pickups, platforms: this.platforms });
                this.pipeTarget = link;
                this.pipeExit = false;
                p.x = link.x + 10;
                this.change(GameState.PIPE);
                this.audio.play('emerge');
                return;
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
                const a = this.frame * .035;
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
            if (e.y > 280)
                continue;
            if (e.x < this.camera - 64 || e.x > this.camera + 288)
                continue;
            e.active = true;
            e.phase++;
            if (e.safe > 0)
                e.safe--;
            if (e.kind === 'plant') {
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
                if (e.grounded && e.phase % 120 === 0)
                    e.vy = -3.6;
                e.vy = Math.min(4, e.vy + .16);
                move(e, this.level);
                if (e.phase % 100 === 0)
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
            if (e.shell && Math.abs(e.vx) > 1)
                for (const other of this.enemies)
                    if (other !== e && !other.dead && other.kind !== 'plant' && overlaps(e, other))
                        this.defeat(other, 200);
            if (!overlaps(p, e) || e.safe > 0)
                continue;
            if (p.star) {
                this.defeat(e, 200);
                continue;
            }
            const stomp = p.vy >= 0 && oldBottom <= e.y + 7 && e.kind !== 'plant' && e.kind !== 'bowser';
            if (stomp) {
                p.y = e.y - p.h;
                p.vy = this.input.down('jump') ? -4 : -2.8;
                this.audio.play('stomp');
                if (e.kind === 'goomba')
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
        this.enemies = this.enemies.filter(e => e.y < 320);
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
                    else
                        this.defeat(e, 200);
                    break;
                }
        }
    } this.projectiles = this.projectiles.filter(f => f.life > 0 && f.y < 260 && f.x > this.camera - 32 && f.x < this.camera + 288); }
    private pipeStep() { if (!this.pipeTarget)
        return; if (!this.pipeExit) {
        this.player.y += .5;
        if (this.stateTicks >= 60) {
            const target = this.pipeTarget;
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
        }
    } }
    private completeStep() {
        const p = this.player;
        if (this.level.axe) {
            for (const e of this.enemies)
                if (e.kind === 'bowser')
                    e.y += 2;
            if (this.stateTicks % 5 === 0) {
                const x = 125 - Math.floor(this.stateTicks / 5);
                if (x >= 109)
                    delete this.level.tiles[key(x, 11)];
            }
            if (this.stateTicks > 100 && this.flagStage < 2)
                this.flagStage = 2;
        }
        else if (this.flagStage === 0) {
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
            if (this.levelIndex === 3)
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
}
