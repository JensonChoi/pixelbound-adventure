import { Game, GameState } from '../core/Game';
import { sprite, text } from './PixelArt';
import type { Tile, Theme } from '../world/Level';
import { playerPalette, playerSprite } from './PlayerAppearance';
export class Renderer {
    ctx: CanvasRenderingContext2D;
    constructor(public canvas: HTMLCanvasElement) { this.ctx = canvas.getContext('2d')!; this.ctx.imageSmoothingEnabled = false; }
    draw(g: Game) {
        const c = this.ctx;
        c.imageSmoothingEnabled = false;
        c.fillStyle = g.level.theme === 'underwater' ? '#164bb5' : ['overworld', 'athletic', 'sky'].includes(g.level.theme) ? '#5c94fc' : '#080a12';
        c.fillRect(0, 0, 256, 240);
        if ([GameState.LEVEL_INTRO, GameState.GAME_OVER, GameState.VICTORY].includes(g.state)) {
            c.fillStyle = '#080a12';
            c.fillRect(0, 0, 256, 240);
            this.hud(g);
            this.screen(g);
            return;
        }
        this.scenery(g);
        c.save();
        c.translate(-Math.floor(g.camera), 0);
        const left = Math.floor(g.camera / 16), right = left + 17;
        // Solid chamber floors occlude lava; pits retain their visible surface.
        for (const lava of g.level.lava ?? []) {
            c.fillStyle = '#c53218'; c.fillRect(lava.x, lava.y, lava.width, 240 - lava.y);
            c.fillStyle = '#ffc247'; for (let x = lava.x; x < lava.x + lava.width; x += 8) c.fillRect(x, lava.y + Math.floor((x + g.frame) / 8) % 2 * 2, 6, 3);
        }
        for (const [key, t] of Object.entries(g.level.tiles)) {
            const [x, y] = key.split(',').map(Number);
            if (x < left - 1 || x > right || t.kind === 'hidden')
                continue;
            this.tile(t, x * 16, y * 16 - (t.bump ? Math.sin(t.bump / 12 * Math.PI) * 4 : 0), g.level.theme, g.frame);
        }
        for (const zone of g.level.warpZones ?? []) {
            text(c, 'WELCOME TO WARP ZONE!', zone.x, zone.y, '#fff', 1, 'center');
            for (const id of zone.pipeIds) {
                const link = g.level.pipes.find(p => p.id === id)!;
                text(c, link.target.split('-')[0], link.x + 16, link.y - 30, '#fff', 1, 'center');
            }
        }
        for (const [i, vine] of (g.level.vines ?? []).entries()) {
            const height = g.vines[i] ?? 0;
            c.fillStyle = '#79bb30'; c.fillRect(vine.x - 2, vine.bottom - height, 4, height);
            for (let y = vine.bottom - height; y < vine.bottom; y += 8) { c.fillRect(vine.x - 7, y, 6, 3); c.fillRect(vine.x + 2, y + 4, 5, 3); }
        }
        for (const cannon of g.level.cannons ?? []) {
            c.fillStyle = '#252634'; c.fillRect(cannon.x, cannon.y, 16, 13);
            c.fillStyle = '#f6edda'; c.fillRect(cannon.x + 4, cannon.y + 3, 8, 3); c.fillRect(cannon.x + 7, cannon.y + 6, 3, 4);
        }
        for (const link of g.level.pipes) {
            if (!link.warp && Math.abs(g.player.x - link.x) < 48 && g.state === GameState.PLAYING) {
                text(c, 'V', link.x + 16, link.y - 25 - Math.floor(g.frame / 20) % 2 * 2, '#fff1df', 1, 'center');
            }
        }
        for (const coin of g.level.coins)
            if (coin.x > g.camera - 16 && coin.x < g.camera + 272)
                this.coin(coin.x, coin.y, g.frame);
        for (const p of g.platforms) {
            c.fillStyle = '#3c261c';
            c.fillRect(Math.round(p.x), Math.round(p.y), p.width, 8);
            c.fillStyle = '#f4aa71';
            c.fillRect(Math.round(p.x), Math.round(p.y), p.width, 3);
            for (let x = 0; x < p.width; x += 8) {
                c.fillStyle = '#8d4828';
                c.fillRect(Math.round(p.x) + x + 1, Math.round(p.y) + 4, 6, 3);
            }
        }
        for (const bar of g.level.firebars) {
            c.fillStyle = '#a5a6af';
            c.fillRect(bar.x - 4, bar.y - 4, 8, 8);
            for (let i = 1; i <= bar.length; i++) {
                const a = g.frame * (bar.speed ?? .035) + (bar.angle ?? 0);
                this.flame(bar.x + Math.cos(a) * i * 8, bar.y + Math.sin(a) * i * 8, g.frame);
            }
        }
        for (const e of g.enemies) {
            if (e.x < g.camera - 32 || e.x > g.camera + 272 || e.y > 260)
                continue;
            if (e.kind === 'plant' && e.y >= e.homeY - 3)
                continue;
            const name = e.kind === 'green' || e.kind === 'red' || e.kind === 'buzzy' ? (e.shell ? 'shell' : 'koopa') : e.kind === 'leapingCheep' ? 'cheep' : e.kind;
            const palette: Record<string, string> = e.kind === 'red' ? { g: '#e34326', G: '#922d1c' } : e.kind === 'buzzy' ? { g: '#3979b0', G: '#162237' } : {};
            if (e.kind === 'plant') {
                c.save();
                c.beginPath();
                c.rect(e.x - 4, e.homeY - 30, 24, 30);
                c.clip();
                sprite(c, 'plant', e.x - 2, e.y, { palette });
                c.restore();
            }
            else
                sprite(c, name, e.x - 2, e.y + (e.dead ? 12 : 0), { flip: e.vx > 0, palette, scaleX: e.kind === 'bowser' ? 2 : 1, scaleY: e.dead ? .25 : e.kind === 'bowser' ? 2 : 1, frame: e.dead || e.shell ? 0 : Math.floor(g.frame / 10) % 2 });
        }
        for (const item of g.pickups) {
            c.save();
            if (item.emerge) {
                c.beginPath();
                c.rect(item.x - 4, item.homeY - 20, 24, 20);
                c.clip();
            }
            sprite(c, item.kind === 'flower' ? 'flower' : item.kind === 'star' ? 'star' : 'mushroom', item.x - 2, item.y, { palette: item.kind === 'life' ? { r: '#65ab27' } : {} });
            c.restore();
        }
        for (const f of g.projectiles) {
            if (f.kind === 'hammer') { sprite(c, 'hammer', f.x, f.y, { flip: Math.floor(g.frame / 6) % 2 === 0 }); continue; }
            this.flame(f.x + 3, f.y + 3, g.frame);
            if (f.hostile)
                this.flame(f.x + 9, f.y + 3, g.frame + 3);
        }
        if (g.level.ending && g.state !== GameState.TITLE) {
            const ending = g.level.ending;
            const celebrate = g.castlePhase === 'dialogue' && Math.floor(g.frame / 24) % 2 === 0;
            sprite(c, ending.character + (celebrate ? 'Celebrate' : ''), ending.x, ending.floorY - (ending.character === 'peach' ? 28 : 16), { flip: ending.character === 'peach' });
        }
        if (g.state !== GameState.TITLE)
            this.player(g);
        else
            sprite(c, 'mario', 40, 192, { palette: playerPalette(g.selectedCharacter) });
        for (const p of g.particles) {
            if (p.text)
                text(c, p.text, p.x, p.y, '#fff', 1, 'center');
            else {
                c.fillStyle = p.color;
                c.fillRect(Math.round(p.x), Math.round(p.y), 4, 4);
            }
        }
        c.restore();
        this.hud(g);
        if (g.state === GameState.TITLE)
            this.title(g);
        if (g.state === GameState.PAUSED) {
            c.fillStyle = '#080a12cc';
            c.fillRect(0, 0, 256, 240);
            text(c, 'PAUSED', 128, 93, '#fff1df', 2, 'center');
            text(c, 'ENTER TO CONTINUE', 128, 122, '#ffca68', 1, 'center');
            text(c, 'RESTART BUTTON BELOW', 128, 142, '#aeb4bd', 1, 'center');
        }
        if (g.state === GameState.LEVEL_COMPLETE && g.castlePhase === 'dialogue') {
            const lines = g.rescueDialogue;
            lines.forEach((line, i) => text(c, line, 128, 72 + i * 24, '#fff', 1, 'center'));
            text(c, 'PRESS ENTER TO CONTINUE', 128, 151, '#fff', 1, 'center');
        }
        else if (g.state === GameState.LEVEL_COMPLETE && !g.level.ending && g.time === 0) {
            c.fillStyle = '#101414';
            c.fillRect(32, 72, 192, 43);
            text(c, 'COURSE CLEAR!', 128, 82, '#ffca68', 1, 'center');
            text(c, 'ON TO THE NEXT ADVENTURE', 128, 99, '#fff1df', 1, 'center');
        }
    }
    private player(g: Game) {
        const p = g.player, c = this.ctx;
        if (p.invulnerable && Math.floor(g.frame / 4) % 2)
            return;
        const dead = g.state === GameState.PLAYER_DYING;
        const jumping = !p.grounded;
        const frame = p.climbing !== null || p.swimming ? Math.floor(g.frame / 8) % 3 - 1 : dead ? 2 : p.skidding ? -2 : jumping ? (p.vy < 0 ? 1 : 2) : Math.abs(p.vx) > .1 ? Math.floor(p.walk) % 3 - 1 : 0;
        const palette = playerPalette(g.selectedCharacter, p.power, !!(p.star || p.transform && Math.floor(g.frame / 3) % 2), g.frame);
        c.save();
        if (g.state === GameState.PIPE) {
            const column = Math.floor((p.x + p.w / 2) / 16);
            let surface = 240;
            for (let row = 0; row < 15; row++) {
                const tile = g.level.tiles[`${column},${row}`];
                if (tile?.kind === 'pipeL' || tile?.kind === 'pipeR') {
                    surface = row * 16;
                    break;
                }
            }
            c.beginPath();
            c.rect(g.camera, 0, 256, surface);
            c.clip();
        }
        const celebrating = g.castlePhase === 'dialogue';
        sprite(c, playerSprite(p, celebrating && Math.floor(g.frame / 24) % 2 === 0), p.x - 2, p.y, { flip: p.facing < 0, palette, frame: celebrating ? 0 : frame });
        c.restore();
    }
    private hud(g: Game) { const c = this.ctx; text(c, g.character.displayName, 16, 12); text(c, String(g.score).padStart(6, '0'), 16, 22); this.coin(89, 21, g.frame); text(c, 'X' + String(g.coins).padStart(2, '0'), 99, 22); text(c, 'WORLD', 151, 12); text(c, g.world, 157, 22); text(c, 'TIME', 214, 12); text(c, String(Math.max(0, Math.ceil(g.time))).padStart(3, '0'), 220, 22); }
    private title(g: Game) {
        const c = this.ctx;
        c.fillStyle = '#612712';
        c.fillRect(27, 49, 202, 82);
        c.fillStyle = '#e95a27';
        c.fillRect(25, 47, 202, 82);
        c.fillStyle = '#ffb474';
        c.fillRect(27, 49, 198, 2);
        c.fillRect(27, 49, 2, 76);
        c.fillStyle = '#a02c18';
        c.fillRect(28, 125, 197, 2);
        c.fillStyle = '#70260f';
        for (const x of [31, 219])
            for (const y of [54, 121])
                c.fillRect(x, y, 2, 2);
        text(c, 'SUPER', 128, 59, '#6d2815', 3, 'center');
        text(c, 'SUPER', 126, 57, '#fff0c4', 3, 'center');
        text(c, 'MARIO BROS.', 128, 88, '#6d2815', 3, 'center');
        text(c, 'MARIO BROS.', 126, 86, '#fff0c4', 3, 'center');
        text(c, 'THE 8-BIT ADVENTURE', 128, 115, '#ffe5b1', 1, 'center');
        text(c, '1 PLAYER GAME', 128, 138, '#fff1df', 1, 'center');
        text(c, 'SELECT PLAYER', 128, 152, '#fff1df', 1, 'center');
        text(c, 'MARIO', 116, 166); text(c, 'LUIGI', 116, 180);
        text(c, '>', 102, g.selectedCharacter === 'mario' ? 166 : 180);
        sprite(c, 'mario', 158, 165, { palette: playerPalette(g.selectedCharacter) });
        text(c, 'PRESS ENTER TO START', 128, 197, '#fff1df', 1, 'center');
        text(c, 'TOP ' + String(g.best).padStart(6, '0'), 128, 224, '#fff1df', 1, 'center');
    }
    private screen(g: Game) { const c = this.ctx; if (g.state === GameState.LEVEL_INTRO) {
        text(c, 'WORLD ' + g.world, 128, 84, '#fff1df', 2, 'center');
        sprite(c, 'mario', 103, 116, { palette: playerPalette(g.selectedCharacter) });
        text(c, 'X ' + g.lives, 130, 121);
        text(c, g.level.name, 128, 157, '#a3adb9', 1, 'center');
    }
    else if (g.state === GameState.GAME_OVER) {
        text(c, 'GAME OVER', 128, 91, '#fff1df', 2, 'center');
        text(c, g.character.displayName + ', TRY AGAIN!', 128, 126, '#b1b4bd', 1, 'center');
        text(c, 'PRESS ENTER', 128, 154, '#ffca68', 1, 'center');
    }
    else {
        text(c, `THANK YOU ${g.character.displayName}!`, 128, 66, '#ffca68', 2, 'center');
        sprite(c, 'marioBigCelebrate', 104, 99, { palette: playerPalette(g.selectedCharacter, g.player.power) });
        sprite(c, 'peachCelebrate', 136, 99, { flip: true });
        text(c, 'THE KINGDOM IS SAFE.', 128, 146, '#fff1df', 1, 'center');
        text(c, 'FINAL SCORE ' + String(g.score).padStart(6, '0'), 128, 166, '#a3adb9', 1, 'center');
        text(c, 'PRESS ENTER TO PLAY AGAIN', 128, 194, '#ffca68', 1, 'center');
    } }
    private coin(x: number, y: number, frame: number) { const c = this.ctx; const w = [6, 4, 2, 4][Math.floor(frame / 8) % 4]; c.fillStyle = '#79460d'; c.fillRect(Math.round(x + 4 - w / 2), y, w, 10); c.fillStyle = '#ffbc37'; c.fillRect(Math.round(x + 3 - w / 2), y, w, 9); c.fillStyle = '#fff1a4'; c.fillRect(Math.round(x + 3 - w / 2), y + 1, 1, 6); }
    private flame(x: number, y: number, frame: number) { const c = this.ctx; c.fillStyle = '#e84020'; c.fillRect(Math.round(x) - 4, Math.round(y) - 2, 8, 4); c.fillRect(Math.round(x) - 2, Math.round(y) - 4, 4, 8); c.fillStyle = frame % 8 < 4 ? '#ffbd3e' : '#fff1a0'; c.fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4); }
    private tile(t: Tile, x: number, y: number, theme: Theme, frame: number) {
        const c = this.ctx;
        y = Math.round(y);
        const underground = theme === 'underground', castle = theme === 'castle';
        const main = underground ? '#2573b3' : castle ? '#797e90' : '#bd5428', light = underground ? '#80c7e6' : castle ? '#c0c5d0' : '#f6ac70', dark = underground ? '#08293d' : castle ? '#282b40' : '#582a1b';
        if (t.kind === 'mushroom') {
            c.fillStyle = '#b63024'; c.fillRect(x, y, 16, 8); c.fillStyle = '#fff1df'; c.fillRect(x + 3, y + 2, 5, 3); c.fillStyle = '#e8c59a'; c.fillRect(x + 2, y + 8, 12, 8); return;
        }
        if (t.kind.startsWith('pipe')) {
            const left = t.kind.endsWith('L'), top = t.kind === 'pipeL' || t.kind === 'pipeR';
            c.fillStyle = '#173b08';
            c.fillRect(x, y, 16, 16);
            c.fillStyle = '#62a80b';
            c.fillRect(x + (left ? 2 : 0), y + (top ? 2 : 0), 14, top ? 12 : 16);
            c.fillStyle = '#a4dc21';
            c.fillRect(x + (left ? 4 : 2), y + (top ? 2 : 0), left ? 4 : 2, top ? 12 : 16);
            c.fillStyle = '#2c6c08';
            if (!left)
                c.fillRect(x + 9, y + (top ? 2 : 0), 3, top ? 12 : 16);
            if (top) {
                c.fillStyle = '#c2e954';
                c.fillRect(x + 1, y + 1, 14, 1);
            }
            return;
        }
        if (t.kind === 'question' || t.kind === 'used') {
            c.fillStyle = '#5e2e15';
            c.fillRect(x, y, 16, 16);
            c.fillStyle = t.kind === 'used' ? '#aa501f' : ['#ef982f', '#f2ac45', '#e58a28'][Math.floor(frame / 12) % 3];
            c.fillRect(x + 1, y + 1, 14, 14);
            c.fillStyle = t.kind === 'used' ? '#c57232' : '#ffd281';
            c.fillRect(x + 1, y + 1, 13, 1);
            c.fillStyle = '#643014';
            for (const a of [2, 12])
                for (const b of [2, 12])
                    c.fillRect(x + a, y + b, 1, 1);
            if (t.kind === 'question') {
                text(c, '?', x + 6, y + 5, '#6c2c11');
                text(c, '?', x + 5, y + 4, '#fff0b0');
            }
            return;
        }
        c.fillStyle = dark;
        c.fillRect(x, y, 16, 16);
        c.fillStyle = main;
        c.fillRect(x + 1, y + 1, 14, 14);
        if (t.kind === 'stone') {
            c.fillStyle = light;
            c.fillRect(x + 1, y + 1, 14, 2);
            c.fillRect(x + 1, y + 1, 2, 14);
            c.fillStyle = dark;
            c.fillRect(x + 4, y + 12, 10, 2);
            c.fillRect(x + 12, y + 4, 2, 10);
        }
        else if (t.kind === 'ground') {
            c.fillStyle = light;
            c.fillRect(x, y, 15, 1);
            c.fillRect(x, y, 1, 14);
            c.fillRect(x + 9, y + 2, 1, 7);
            c.fillRect(x + 2, y + 10, 6, 1);
            c.fillRect(x + 8, y + 9, 1, 6);
            c.fillStyle = dark;
            c.fillRect(x + 10, y + 1, 1, 8);
            c.fillRect(x + 1, y + 11, 7, 2);
            c.fillRect(x + 9, y + 10, 1, 6);
        }
        else {
            c.fillStyle = light;
            c.fillRect(x, y, 16, 1);
            c.fillRect(x, y + 8, 16, 1);
            c.fillStyle = dark;
            c.fillRect(x, y + 7, 16, 1);
            c.fillRect(x, y + 15, 16, 1);
            c.fillRect(x + 7, y, 1, 8);
            c.fillRect(x + 3, y + 8, 1, 8);
            c.fillRect(x + 12, y + 8, 1, 8);
        }
    }
    private scenery(g: Game) {
        const c = this.ctx;
        const camera = Math.floor(g.camera);
        if (['overworld', 'night', 'athletic', 'sky'].includes(g.level.theme)) {
            for (let i = 0; i < g.level.width / 384 + 1; i++) {
                const base = i * 384 - camera;
                this.cloud(base + 130, 58, 1);
                this.cloud(base + 270, 87, 2);
                if (g.level.theme === 'overworld' || g.level.theme === 'night') {
                    this.hill(base + 1, 208, 40);
                    this.hill(base + 236, 208, 24);
                    this.bush(base + 177, 208, 3);
                    this.bush(base + 330, 208, 2);
                }
            }
        }
        else if (g.level.theme === 'underwater') {
            c.fillStyle = '#55b4dc'; for (let x = 0; x < 256; x += 24) c.fillRect(x, 38 + Math.floor((x + g.frame) / 12) % 2, 20, 2);
            for (let x = 0; x < g.level.width; x += 144) { const a = x - camera; c.fillStyle = '#e392ad'; c.fillRect(a + 7, 170, 5, 38); c.fillRect(a, 181, 20, 4); c.fillRect(a, 174, 3, 10); c.fillRect(a + 17, 172, 3, 11); }
            c.strokeStyle = '#a5deee'; for (let i = 0; i < 8; i++) c.strokeRect((i * 37 - camera * .3 + 2048) % 256, 48 + (i * 23 - g.frame * .3 + 4096) % 150, 2, 3);
        }
        else if (g.level.theme === 'castle') {
            c.fillStyle = '#cf351c';
            c.fillRect(0, 223, 256, 17);
            c.fillStyle = '#f7a035';
            for (let x = 0; x < 256; x += 8)
                c.fillRect(x, 223 + Math.floor((x + g.frame) / 8) % 2 * 3, 6, 3);
        }
        if (g.level.goal < g.level.width) {
            const x = Math.floor(g.level.goal - camera);
            if (g.level.axe) {
                if (g.state !== GameState.LEVEL_COMPLETE) {
                    sprite(c, 'axe', x, 160);
                    c.fillStyle = '#a6a5ab';
                    c.fillRect(x - 18, 175, 20, 2);
                }
            }
            else {
                c.fillStyle = '#447b16';
                c.fillRect(x, 48, 2, 160);
                c.fillStyle = '#b2d578';
                c.fillRect(x + 1, 48, 1, 160);
                c.fillStyle = '#91b63c';
                c.fillRect(x - 2, 44, 6, 6);
                const flagY = g.state === GameState.LEVEL_COMPLETE ? Math.min(188, g.player.y) : 53;
                c.fillStyle = '#fff1df';
                for (let row = 0; row < 14; row++)
                    c.fillRect(x - 14 + row, flagY + row, 14 - row, 1);
                c.fillStyle = '#259446';
                c.fillRect(x - 6, flagY + 3, 3, 4);
                this.tile({ kind: 'stone', bump: 0 }, x - 6, 208, g.level.theme, g.frame);
                this.castle(x + 40, 208);
            }
        }
    }
    private cloud(x: number, y: number, size: number) { if (x > 260 || x + size * 32 < 0)
        return; const c = this.ctx; c.fillStyle = '#273b56'; c.fillRect(x + 4, y + 8, size * 24 + 8, 12); c.fillRect(x + 10, y + 3, size * 24 - 4, 18); c.fillStyle = '#fff9ed'; c.fillRect(x + 3, y + 10, size * 24 + 8, 8); c.fillRect(x + 8, y + 5, size * 24, 13); c.fillRect(x + 13, y, size * 24 - 10, 16); c.fillStyle = '#a9e6ed'; for (let i = 0; i < size * 3; i++)
        c.fillRect(x + 7 + i * 8, y + 17, 4, 2); }
    private hill(x: number, y: number, height: number) { if (x > 260 || x + height * 2 < 0)
        return; const c = this.ctx; for (let i = 0; i < height; i += 2) {
        c.fillStyle = '#25500a';
        c.fillRect(x + height - i, y - height + i, i * 2 + 2, 2);
        c.fillStyle = '#53a718';
        if (i > 2)
            c.fillRect(x + height - i + 2, y - height + i, i * 2 - 2, 2);
    } c.fillStyle = '#25500a'; c.fillRect(x + height - 2, y - height + 15, 2, 5); c.fillRect(x + height + 8, y - height + 21, 2, 5); }
    private bush(x: number, y: number, count: number) { const c = this.ctx; for (let i = 0; i < count; i++) {
        const a = x + i * 13;
        c.fillStyle = '#29580a';
        c.fillRect(a, y - 9, 18, 9);
        c.fillRect(a + 4, y - 14, 10, 14);
        c.fillStyle = '#88c819';
        c.fillRect(a + 2, y - 8, 14, 8);
        c.fillRect(a + 5, y - 12, 8, 12);
    } }
    private castle(x: number, y: number) { const c = this.ctx; for (let row = 0; row < 3; row++)
        for (let col = 0; col < 3; col++)
            this.tile({ kind: 'brick', bump: 0 }, x + col * 16, y - 48 + row * 16, 'overworld', 0); for (let i = 0; i < 3; i++)
        this.tile({ kind: 'brick', bump: 0 }, x + i * 16, y - 56, 'overworld', 0); c.fillStyle = '#5c94fc'; c.fillRect(x + 8, y - 56, 8, 8); c.fillRect(x + 24, y - 56, 8, 8); c.fillStyle = '#211b20'; c.fillRect(x + 18, y - 22, 13, 22); c.fillRect(x + 21, y - 25, 7, 3); }
}
