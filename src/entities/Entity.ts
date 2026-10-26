import type { EnemyKind, ItemKind, PlatformDef } from '../world/Level';
export interface Body {
    x: number;
    y: number;
    w: number;
    h: number;
    vx: number;
    vy: number;
    grounded: boolean;
}
export class Player implements Body {
    x = 40;
    y = 192;
    w = 12;
    h = 16;
    vx = 0;
    vy = 0;
    grounded = false;
    facing = 1;
    power: 0 | 1 | 2 = 0;
    crouched = false;
    invulnerable = 0;
    star = 0;
    walk = 0;
    skidding = false;
    fireCooldown = 0;
    transform = 0;
    get big() { return this.power > 0; }
    setPower(power: 0 | 1 | 2) { const bottom = this.y + this.h; this.power = power; this.h = power ? 28 : 16; this.y = bottom - this.h; this.crouched = false; }
}
export interface Enemy extends Body {
    kind: EnemyKind;
    homeY: number;
    homeX: number;
    phase: number;
    shell: boolean;
    dead: number;
    active: boolean;
    health: number;
    safe: number;
}
export interface Pickup extends Body {
    kind: ItemKind | 'flower';
    emerge: number;
    homeY: number;
}
export interface Projectile extends Body {
    life: number;
    hostile: boolean;
}
export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    text?: string;
}
export interface MovingPlatform extends PlatformDef {
    originX: number;
    originY: number;
    phase: number;
    dx: number;
    dy: number;
}
export const body = (x: number, y: number, w = 12, h = 16): Body => ({ x, y, w, h, vx: 0, vy: 0, grounded: false });
export const overlaps = (a: Pick<Body, 'x' | 'y' | 'w' | 'h'>, b: Pick<Body, 'x' | 'y' | 'w' | 'h'>) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
