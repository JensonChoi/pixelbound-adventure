import type { Theme } from '../world/Level';
export type Sound = 'jump' | 'coin' | 'bump' | 'break' | 'emerge' | 'power' | 'stomp' | 'kick' | 'fire' | 'damage' | 'death' | 'life' | 'flag' | 'complete';
const melodies: Record<string, number[]> = { overworld: [76, 0, 79, 0, 84, 83, 79, 76, 77, 0, 81, 0, 79, 76, 74, 72, 76, 79, 84, 88, 86, 84, 79, 0, 81, 77, 74, 71, 72, 0, 0, 0], underground: [48, 60, 51, 63, 46, 58, 49, 61, 48, 0, 55, 0, 51, 0, 46, 0], castle: [45, 52, 57, 60, 59, 52, 56, 59, 45, 52, 57, 60, 62, 59, 56, 52], star: [84, 79, 84, 88, 86, 81, 86, 89, 88, 84, 88, 91, 89, 86, 89, 93] };
export class AudioManager {
    context: AudioContext | null = null;
    muted = false;
    private tick = 0;
    private note = 0;
    private theme = '';
    unlock() { if (!this.context)
        this.context = new AudioContext(); void this.context.resume(); }
    tone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.035, slide?: number) { if (!this.context || this.muted)
        return; const c = this.context; const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(freq, c.currentTime); if (slide)
        o.frequency.exponentialRampToValueAtTime(slide, c.currentTime + duration); g.gain.setValueAtTime(volume, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + duration); }
    play(s: Sound) { const tones: Record<Sound, [
        number,
        number,
        number
    ]> = { jump: [220, .18, 700], coin: [1100, .12, 1700], bump: [140, .07, 65], break: [90, .15, 30], emerge: [240, .35, 800], power: [400, .35, 1300], stomp: [160, .1, 55], kick: [270, .12, 95], fire: [650, .1, 100], damage: [800, .2, 100], death: [520, .6, 80], life: [650, .5, 1900], flag: [1000, .5, 300], complete: [500, .7, 1500] }; const [f, d, end] = tones[s]; this.tone(f, d, 'square', .05, end); }
    update(theme: Theme, star: boolean, playing: boolean) { if (!playing)
        return; const selected = star ? 'star' : theme === 'night' || theme === 'athletic' || theme === 'sky' ? 'overworld' : theme === 'underwater' ? 'underground' : theme; if (selected !== this.theme) {
        this.theme = selected;
        this.note = 0;
        this.tick = 0;
    } if (this.tick-- <= 0) {
        this.tick = star ? 7 : theme === 'underground' ? 13 : 10;
        const notes = melodies[selected], n = notes[this.note % notes.length];
        if (n)
            this.tone(440 * 2 ** ((n - 69) / 12), .12, 'square', .018);
        if (this.note % 4 === 0)
            this.tone(440 * 2 ** (((theme === 'castle' ? 33 : 36) + (this.note % 8 ? 7 : 0) - 69) / 12), .2, 'triangle', .04);
        this.note++;
    } }
}
