import { type Body, overlaps } from '../entities/Entity';
import { type LevelDefinition, type Tile, tileAt } from '../world/Level';
export const PHYSICS = { walk: 1.6, run: 2.65, groundAcceleration: 0.12, airAcceleration: 0.065, friction: 0.1, gravity: 0.24, heldGravity: 0.115, maxFall: 4.5, jump: 4.5, runJump: 4.85 };
export function solid(tile: Tile | undefined) { return !!tile && tile.kind !== 'hidden'; }
export function blocked(l: LevelDefinition, b: Pick<Body, 'x' | 'y' | 'w' | 'h'>) {
    for (let x = Math.floor(b.x / 16); x <= Math.floor((b.x + b.w - 0.001) / 16); x++)
        for (let y = Math.floor(b.y / 16); y <= Math.floor((b.y + b.h - 0.001) / 16); y++)
            if (solid(tileAt(l, x, y)))
                return true;
    return false;
}
export function move(b: Body, l: LevelDefinition, head?: (x: number, y: number, t: Tile) => void) {
    const result = { wall: false, ceiling: false, landed: false };
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(b.vx), Math.abs(b.vy)) / 6));
    b.grounded = false;
    for (let i = 0; i < steps; i++) {
        const dx = b.vx / steps;
        b.x += dx;
        for (let x = Math.floor(b.x / 16); x <= Math.floor((b.x + b.w - 0.001) / 16); x++)
            for (let y = Math.floor(b.y / 16); y <= Math.floor((b.y + b.h - 0.001) / 16); y++) {
                if (!solid(tileAt(l, x, y)))
                    continue;
                if (dx > 0)
                    b.x = x * 16 - b.w;
                else if (dx < 0)
                    b.x = (x + 1) * 16;
                b.vx = 0;
                result.wall = true;
            }
        const dy = b.vy / steps;
        b.y += dy;
        const hits: {
            x: number;
            y: number;
            t: Tile;
        }[] = [];
        for (let x = Math.floor(b.x / 16); x <= Math.floor((b.x + b.w - 0.001) / 16); x++)
            for (let y = Math.floor(b.y / 16); y <= Math.floor((b.y + b.h - 0.001) / 16); y++) {
                const t = tileAt(l, x, y);
                if (!t || (!solid(t) && !(dy < 0 && head)))
                    continue;
                if (!overlaps(b, { x: x * 16, y: y * 16, w: 16, h: 16 }))
                    continue;
                hits.push({ x, y, t });
            }
        if (hits.length && dy !== 0) {
            if (dy > 0) {
                b.y = Math.min(...hits.map(t => t.y * 16)) - b.h;
                b.grounded = true;
                result.landed = true;
            }
            else {
                b.y = Math.max(...hits.map(t => (t.y + 1) * 16));
                result.ceiling = true;
                const hit = hits.sort((a, c) => Math.abs(a.x * 16 + 8 - b.x - b.w / 2) - Math.abs(c.x * 16 + 8 - b.x - b.w / 2))[0];
                head?.(hit.x, hit.y, hit.t);
            }
            b.vy = 0;
        }
    }
    return result;
}

export const WATER_PHYSICS = { speed: 1.45, acceleration: .06, friction: .03, gravity: .055, swim: 2.3, maxFall: 1.4 };
