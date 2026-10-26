/** Rendering may run at any rate; only complete simulation ticks are consumed. */
export class GameLoop {
    static readonly STEP_MS = 1000 / 60;
    private accumulator = 0;
    advance(elapsedMs: number, update: () => void): number {
        this.accumulator += Math.max(0, Math.min(100, elapsedMs));
        let ticks = 0;
        while (this.accumulator + 1e-8 >= GameLoop.STEP_MS) {
            update();
            this.accumulator -= GameLoop.STEP_MS;
            ticks++;
        }
        return ticks;
    }
}
