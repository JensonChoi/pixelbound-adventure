import { body, type Enemy } from '../entities/Entity';
import { move } from './Physics';
import type { Game } from './Game';
import type { EnemySpawn } from '../world/Level';

export function createEnemy(e: EnemySpawn): Enemy {
    return { ...body(e.x, e.y, e.kind === 'brimstone' ? 28 : 12, e.kind === 'brimstone' ? 32 : e.kind === 'plant' ? 24 : 16), kind: e.kind, homeX: e.x, homeY: e.y, phase: 0, shell: false, dead: 0, active: false, health: 5, safe: 0, vx: -.5 };
}
export function specialEnemy(g: Game, e: Enemy): boolean {
    const p = g.player;
    switch (e.kind) {
        case 'cheep':
            e.x = e.homeX + Math.sin(e.phase * .014) * 60;
            e.y = e.homeY + Math.sin(e.phase * .028) * 20;
            return true;
        case 'blooper': {
            const burst = e.phase % 110 < 40;
            e.x += burst ? Math.sign(p.x - e.x) * .8 : 0;
            e.y = Math.max(48, Math.min(184, e.y + (burst ? -.8 : .45)));
            return true;
        }
        case 'leapingCheep':
        case 'podoboo': {
            const cycle = (e.phase + Math.floor(e.homeX / 16) * 7) % 180;
            const t = cycle - 30;
            e.y = cycle < 30 ? 256 : 256 - 5 * t + .06 * t * t;
            if (e.kind === 'leapingCheep') e.x = e.homeX + (cycle < 30 ? -60 : -60 + t * 1.1);
            return true;
        }
        case 'lakitu':
            e.x += Math.max(-1.5, Math.min(1.5, (p.x + 72 - e.x) * .025));
            e.y = 58 + Math.sin(e.phase * .03) * 10;
            if (e.phase % 170 === 0 && g.enemies.filter(a => a.kind === 'egg' || a.kind === 'spiny').length < 8) {
                const egg = createEnemy({ kind: 'egg', x: e.x, y: e.y + 16 });
                egg.vx = -.5; egg.vy = -1.5; g.enemies.push(egg);
            }
            return true;
        case 'egg':
            e.vy = Math.min(4, e.vy + .18);
            move(e, g.level);
            if (e.grounded) e.kind = 'spiny';
            return true;
        case 'bullet':
            e.x += e.vx;
            return true;
        case 'hammerBro':
            e.vx = Math.sin(e.phase * .04) * .45;
            if (e.grounded && e.phase % 145 === 0) e.vy = -5.1;
            e.vy = Math.min(4, e.vy + .20);
            move(e, g.level);
            if (e.phase % 85 === 0) {
                g.projectiles.push({ ...body(e.x, e.y, 8, 10), vx: Math.sign(p.x - e.x) * 1.4, vy: -3.4, life: 110, hostile: true, kind: 'hammer' });
            }
            return true;
        default: return false;
    }
}
