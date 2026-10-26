export type Action = 'left' | 'right' | 'jump' | 'run' | 'down' | 'start';
const bindings: Record<string, Action> = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'jump', KeyZ: 'jump', ShiftLeft: 'run', ShiftRight: 'run', KeyX: 'run', ArrowDown: 'down', KeyS: 'down', Enter: 'start' };
export class Input {
    held = new Set<Action>();
    pressed = new Set<Action>();
    private sources = new Map<string, Action>();
    constructor(target?: Window) { if (target) {
        target.addEventListener('keydown', e => { const a = bindings[e.code]; if (a) {
            e.preventDefault();
            this.set(e.code, a, true);
        } });
        target.addEventListener('keyup', e => { const a = bindings[e.code]; if (a) {
            e.preventDefault();
            this.set(e.code, a, false);
        } });
        target.addEventListener('blur', () => this.clear());
    } }
    set(source: string, action: Action, down: boolean) { if (down) {
        if (!this.held.has(action))
            this.pressed.add(action);
        this.sources.set(source, action);
        this.held.add(action);
    }
    else {
        this.sources.delete(source);
        if (![...this.sources.values()].includes(action))
            this.held.delete(action);
    } }
    down(a: Action) { return this.held.has(a); }
    tap(a: Action) { return this.pressed.has(a); }
    end() { this.pressed.clear(); }
    clear() { this.sources.clear(); this.held.clear(); this.pressed.clear(); }
}
