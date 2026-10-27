import { Game, GameState } from '../src/core/Game';
import { Renderer } from '../src/graphics/Renderer';
import { type Action } from '../src/core/Input';
import { PROGRESSION } from '../src/world/levels';
const canvas = document.querySelector<HTMLCanvasElement>('#game')!;
const renderer = new Renderer(canvas);
const select = document.querySelector<HTMLSelectElement>('#route')!;
const routes = [...PROGRESSION.map(id => ({ label: id, stage: id, file: `${id.startsWith('1-') ? 'mario-route' : 'route'}-${id}.json` })), ...[4, 3, 2].map(w => ({ label: `1-2 warp to ${w}`, stage: '1-2', file: `warp-1-2-to-${w}.json` })), ...[5, 6, 7, 8].map(w => ({ label: `4-2 warp to ${w}`, stage: '4-2', file: `warp-4-2-to-${w}.json` }))];
select.innerHTML = routes.map((r, i) => `<option value="${i}">${r.label}</option>`).join('');
const actions: Action[][] = [['right', 'run', 'jump'], ['right', 'run'], ['jump'], [], ['left', 'run', 'jump'], ['left', 'run'], ['down']];
const keys: Action[] = ['left', 'right', 'jump', 'run', 'down', 'up'];
document.querySelector('#replay')!.addEventListener('click', async () => {
    const output = document.querySelector<HTMLOutputElement>('#result')!;
    try {
        const route = routes[Number(select.value)], stop = document.querySelector<HTMLSelectElement>('#stop')!.value;
        const response = await fetch(`/tests/fixtures/${route.file}`);
        if (!response.ok) throw new Error('Fixture unavailable');
        const data = await response.json() as (number | { keys: Action[]; frames: number })[];
        const g = new Game(); g.load(route.stage); g.time = g.level.time; g.change(GameState.PLAYING);
        let frames = 0, done = false;
        for (const [index, entry] of data.entries()) {
            const step = typeof entry === 'number' ? { keys: actions[entry], frames: 16 } : entry;
            for (const key of keys) g.input.set(key, key, step.keys.includes(key));
            for (let i = 0; i < step.frames; i++) {
                g.update(); frames++;
                if (g.state === GameState.PLAYER_DYING) throw new Error(`Replay died at frame ${frames}`);
                if (stop === 'chamber' && g.level.warpZones?.some(z => g.player.y > 85 && z.pipeIds.every(id => { const p = g.level.pipes.find(link => link.id === id)!; return p.x >= g.camera && p.x + 32 <= g.camera + 256; }))) { done = true; break; }
                if (g.state === GameState.LEVEL_COMPLETE) { done = true; break; }
            }
            if (done || stop === 'middle' && index >= data.length / 2) break;
        }
        if (stop === 'victory') { g.input.clear(); for (let i = 0; i < 600 && g.state !== GameState.VICTORY; i++) g.update(); }
        renderer.draw(g);
        output.textContent = `${route.label} · ${frames} frames · ${g.level.id} · ${g.state} · ${g.lives} lives · score ${g.score} · time ${Math.ceil(g.time)}`;
    } catch (error) { output.textContent = String(error); }
});
renderer.draw(new Game());
