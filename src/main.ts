import './styles/main.css';
import { Game, GameState } from './core/Game';
import { Input, type Action } from './core/Input';
import { GameLoop } from './core/GameLoop';
import { Renderer } from './graphics/Renderer';
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
 <header class="masthead"><a class="brand" href="" aria-label="8-bit arcade home"><span class="brand-mark" aria-hidden="true">▟</span> THE 8-BIT ARCADE<span class="brand-dot"></span></a><span class="edition">CARTRIDGE NO. 001 <span> / </span> EST. 1985</span></header>
 <main>
  <div class="heading"><div><div class="eyebrow"><span></span> A CLASSIC. ONE MORE TIME.</div><h1>Super Mario Bros<span>.</span></h1><p>Same little plumber. Same big adventure.</p></div><div class="game-tag"><span>1 PLAYER</span><span>4 COURSES</span><span>∞ RETRIES</span></div></div>
  <section class="arcade" aria-label="Super Mario Bros. game">
   <div class="cabinet-top"><div><span class="power-light"></span> <span id="status">READY TO PLAY</span></div><span>256 × 240 <span class="dim">/</span> 60 FPS</span></div>
   <div class="screen-surround" id="fullscreen-area"><canvas id="game" width="256" height="240" tabindex="0" aria-label="Super Mario Bros. Use arrow keys to move, Space to jump, Shift to run, and Enter to start or pause."></canvas></div>
   <div class="cabinet-bottom"><div class="game-actions"><button id="start" class="primary"><span aria-hidden="true">▶</span> <span id="start-label">START GAME</span><kbd>ENTER</kbd></button><button id="restart" class="restart-level" type="button" title="Restart this level (costs one life)" aria-label="Restart level (costs one life)" disabled>↻ RESTART LEVEL</button></div><div class="tools"><button id="sound" aria-label="Mute sound" aria-pressed="false"><span class="sound-icon">♫</span><span id="sound-label">SOUND ON</span></button><span class="separator"></span><button id="fullscreen" aria-label="Enter fullscreen"><span class="fullscreen-icon">⛶</span><span>FULLSCREEN</span></button></div></div>
  </section>
  <div class="touch-controls" aria-label="Touch controls"><div><button data-action="left" aria-label="Move left">◀</button><button data-action="down" aria-label="Crouch or enter pipe">▼</button><button data-action="right" aria-label="Move right">▶</button></div><div><button data-action="run" class="touch-run">B<span>RUN</span></button><button data-action="jump" class="touch-jump">A<span>JUMP</span></button></div></div>
  <section class="below"><div class="controls"><div class="section-label">THE CONTROLS</div><div class="control-list"><div><span class="keys"><kbd>←</kbd><kbd>→</kbd></span><span>Move</span></div><div><kbd>SPACE</kbd><span>Jump</span></div><div><kbd>SHIFT</kbd><span>Run / Fire</span></div><div><kbd>↓</kbd><span>Duck / Pipe</span></div></div></div><div class="tip"><span class="tip-star">✦</span><p>A little momentum goes a long way.<br><strong>Hold jump to reach a little higher.</strong></p></div></section>
  <section class="journey"><div class="section-label">YOUR JOURNEY <span>WORLD 01</span></div><div class="courses"><div class="course active" data-course="0"><span class="course-number">01</span><span><strong>The Overworld</strong><small>Where it all begins</small></span><span class="course-state">●</span></div><div class="course" data-course="1"><span class="course-number">02</span><span><strong>The Underground</strong><small>Below the surface</small></span><span class="course-state">○</span></div><div class="course" data-course="2"><span class="course-number">03</span><span><strong>The Treetops</strong><small>A leap of faith</small></span><span class="course-state">○</span></div><div class="course" data-course="3"><span class="course-number">04</span><span><strong>The Castle</strong><small>Make it to the axe</small></span><span class="course-state">○</span></div></div></section>
 </main><footer><span>BUILT WITH PIXELS & PERSISTENCE.</span><span>An independent fan-made tribute. Original code, art & audio.</span><span>INSERT NOSTALGIA <span class="footer-arrow">↗</span></span></footer>`;
const canvas = document.querySelector<HTMLCanvasElement>('#game')!;
const input = new Input(window), game = new Game(input), renderer = new Renderer(canvas);
try {
    game.best = Number(localStorage.getItem('arcade-best')) || 0;
    game.audio.muted = localStorage.getItem('arcade-muted') === 'true';
}
catch { /* Storage is optional in private browsing. */ }
const restart = document.querySelector<HTMLButtonElement>('#restart')!;
const start = document.querySelector<HTMLButtonElement>('#start')!, startLabel = document.querySelector('#start-label')!, status = document.querySelector('#status')!, sound = document.querySelector<HTMLButtonElement>('#sound')!, soundLabel = document.querySelector('#sound-label')!;
function soundUI() { sound.setAttribute('aria-pressed', String(game.audio.muted)); sound.setAttribute('aria-label', game.audio.muted ? 'Unmute sound' : 'Mute sound'); soundLabel.textContent = game.audio.muted ? 'SOUND OFF' : 'SOUND ON'; }
soundUI();
function activate() { game.audio.unlock(); canvas.focus({ preventScroll: true }); }
start.addEventListener('click', () => { activate(); input.set('button', 'start', true); input.set('button', 'start', false); });
restart.addEventListener('click', () => {
    input.clear();
    game.restart();
    activate();
});
canvas.addEventListener('pointerdown', () => { activate(); if (game.state === GameState.TITLE) {
    game.begin();
} });
window.addEventListener('keydown', () => game.audio.unlock(), { once: true });
sound.addEventListener('click', () => { activate(); game.audio.muted = !game.audio.muted; soundUI(); try {
    localStorage.setItem('arcade-muted', String(game.audio.muted));
}
catch { } });
document.querySelector('#fullscreen')!.addEventListener('click', async () => { activate(); try {
    if (document.fullscreenElement)
        await document.exitFullscreen();
    else
        await document.querySelector('#fullscreen-area')!.requestFullscreen();
}
catch {
    status.textContent = 'FULLSCREEN NOT AVAILABLE';
} });
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-action]')) {
    const action = button.dataset.action as Action;
    button.addEventListener('pointerdown', e => { e.preventDefault(); activate(); button.setPointerCapture(e.pointerId); input.set(`touch-${e.pointerId}`, action, true); });
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture'])
        button.addEventListener(event, e => { input.set(`touch-${(e as PointerEvent).pointerId}`, action, false); });
}
window.addEventListener('blur', () => { input.clear(); game.pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) {
    input.clear();
    game.pause();
} });
const loop = new GameLoop();
let previous = performance.now(), oldState = '', oldBest = game.best;
function frame(now: number) {
    loop.advance(now - previous, () => game.update());
    previous = now;
    renderer.draw(game);
    if (game.state !== oldState) {
        oldState = game.state;
        status.textContent = game.state === GameState.TITLE ? 'READY TO PLAY' : game.state === GameState.PLAYING ? `WORLD ${game.world} · ${game.lives} LIVES` : game.state.replaceAll('_', ' ');
        startLabel.textContent = game.state === GameState.PLAYING ? 'PAUSE GAME' : game.state === GameState.PAUSED ? 'RESUME GAME' : [GameState.GAME_OVER, GameState.VICTORY].includes(game.state) ? 'PLAY AGAIN' : 'START GAME';
        restart.disabled = game.state !== GameState.PLAYING && game.state !== GameState.PAUSED;
        start.disabled = [GameState.LEVEL_INTRO, GameState.LEVEL_COMPLETE, GameState.PLAYER_DYING, GameState.PIPE].includes(game.state);
        for (const course of document.querySelectorAll<HTMLElement>('.course')) {
            const i = Number(course.dataset.course);
            course.classList.toggle('active', i === game.levelIndex);
            course.classList.toggle('done', game.completed.includes(`1-${i + 1}`));
            course.querySelector('.course-state')!.textContent = game.completed.includes(`1-${i + 1}`) ? '✓' : i === game.levelIndex ? '●' : '○';
        }
    }
    if (game.best !== oldBest) {
        oldBest = game.best;
        try {
            localStorage.setItem('arcade-best', String(game.best));
        }
        catch { }
    }
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
