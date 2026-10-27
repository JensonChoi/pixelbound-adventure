// Hand-drawn grids. Each character is one pixel; no external sprite assets.
export const PALETTE: Record<string, string> = { r: '#d43b21', s: '#ffb66b', b: '#793b20', k: '#211b15', w: '#fff1d2', g: '#73ad12', G: '#286b0b', y: '#ffc437', o: '#e88325', c: '#70c9e8', B: '#3265b0' };
export const SPRITES: Record<string, string[]> = {
    mario: [
        '.....rrrrrr.....', '....rrrrrrrrr...', '....bbbssks.....', '...bsbsssksss...', '...bsbbsssksbs..', '....bsssskkkk...', '.....ssssss.....', '....rrbrrbrr....', '...rrrbrrbrrr...', '..rrrrbbbbrrrr..', '..ssrbybbybrss..', '..sssbbbbbbsss..', '....bbbbbbbb....', '....bbb..bbb....', '...bbb....bbb...', '..bbbb....bbbb..'
    ],
    marioBig: [
        '.....rrrrrr.....', '....rrrrrrrrr...', '....bbbssks.....', '...bsbsssksss...', '...bsbbsssksbs..', '....bsssskkkk...', '.....ssssss.....', '......ssss......',
        '....rrrrrrr.....', '...rrrbrrbrr....', '..rrrrbrrbrrr...', '..rrrrbrrbrrr...', '..rrrrbbbbrrrr..', '..rrrrbbbbrrrr..', '..ssrbybbybrss..', '..sssbbbbbbsss..', '..sssbbbbbbsss..', '...ssbbbbbbss...',
        '....bbbbbbbb....', '....bbbbbbbb....', '....bbbbbbbb....', '....bbb..bbb....', '....bbb..bbb....', '....bbb..bbb....', '....bbb..bbb....', '...bbbb..bbbb...', '..bbbbb..bbbbb..', '..bbbbb..bbbbb..'
    ],
    goomba: [
        '................', '.....bbbbbb.....', '....bbbbbbbb....', '...bbbbbbbbbb...', '..bbbbbbbbbbbb..', '.bbkkbbbbkkbbbb.', '.bbswkbbkwsbbbb.', 'bbbbwkbbkwbbbbbb', 'bbbbbbbbbbbbbbbb', '.bbbbkkkkbbbbbb.', '...ssssssssss...', '....ssssssss....', '..kkksssssskkk..', '.kkkkksssskkkkk.', '.kkkkk....kkkkk.', '..kkk......kkk..'
    ],
    koopa: [
        '.....gggg.......', '....gggggg......', '....gwkwgg......', '....gwkwggss....', '.....gggssss....', '.....sss........', '....GGGGG.......', '...GgggggG......', '..GggwwgggG.....', '..GgwggwggG.....', '..GggwwgggG.....', '...GgggggG......', '....wwwww.......', '...ss...ss......', '..sss...sss.....', '..bbb...bbb.....'
    ],
    shell: [
        '................', '................', '................', '................', '.....GGGGGG.....', '...GGggggggGG...', '..GggggwwggggG..', '..GgggwggwgggG..', '.GggggwwwwggggG.', '.GgggwggggwgggG.', '.GggwggggggwggG.', '..GGGGGGGGGGGG..', '..wwwwwwwwwwww..', '...kkkkkkkkkk...', '................', '................'
    ],
    mushroom: [
        '.....rrrrrr.....', '...rrwwwrrrrr...', '..rrwwwwwrrrrr..', '.rrrwwwwwrrwwrr.', '.rrrrwwwrrwwwwr.', 'rrrrrrrrrrwwwwrr', 'rrwwwrrrrrrwwrrr', 'rwwwwwrrrrrrrrrr', 'rwwwwwrrwwwrrrrr', 'rrwwwrrwwwwwrrrr', '.rrrrrrrrrrrrrr.', '...ssssssssss...', '...sswksskwss...', '...sswksskwss...', '....ssssssss....', '.....ssssss.....'
    ],
    flower: [
        '.....rrrrrr.....', '...rryyyyyyrr...', '..ryywwwwwwyyr..', '..rywkwkwkwyyr..', '..ryywwwwwwyyr..', '...rryyyyyyrr...', '.....rrrrrr.....', '.......gg.......', '..gg...gg...gg..', '..ggg..gg..ggg..', '...gggggggggg...', '....gggggggg....', '......gggg......', '.......gg.......', '.......gg.......', '................'
    ],
    star: [
        '.......yy.......', '......yyyy......', '......yyyy......', '.....yyyyyy.....', '.yyyyyyyyyyyyyy.', '..yyyyyyyyyyyy..', '...yykyykyyyy...', '....ykyykyyy....', '....yyyyyyyy....', '...yyyyyyyyyy...', '...yyyyyyyyyy...', '..yyyyy..yyyyy..', '..yyy......yyy..', '.yy..........yy.', '................', '................'
    ],
    plant: [
        '....rrrrrr......', '..rrwrrrwrrr....', '.rrrwwrrwwrrr...', 'rrwrrrwwrrrwrr..', 'rrrwwrrrrwwrrr..', 'rrrrwwwwwwrrrr..', '.rrkkkkkkkkrr...', '..rwwwwwwwwr....', '...rrrrrrrr.....', '......gg........', '..gg..gg..gg....', '...gggggggg.....', '....gggggg......', '......gg........', '......gg........', '......gg........'
    ],
    bowser: [
        '....ww..ww......', '...wggwwggw.....', '..gggggggggg....', '.gggkwggkwggg...', '.gggkwggkwgggs..', 'gggggggggggssss.', 'gggwwwwwwggssss.', 'ggwwkkkkwwgsss..', 'gggwwwwwwgggg...', '.ggggggggggggg..', '..gggyyyygggggg.', '.gggyyyyyyggggg.', 'ggggyyyyyyggggg.', 'ggggyyyyyygggg..', '.gggggggggggg...', '..www....www....'
    ],
    cheep: ['.....rrrr.......', '...rrwwrrr......', '..rrwwwwrrr.....', '.rrwwkwrrwww....', 'rrrwwwkrrwwww...', '.rrrrrrrrwww....', '..rrssssrr......', '...ssssss.......', '....ss..ss......'],
    blooper: ['......ww........', '.....wwww.......', '....wwwwww......', '...wwwwwwww.....', '..wwkwwkwwww....', '..wwkwwkwwww....', '...wwwwwwww.....', '....wwwwww......', '...ww.ww.ww.....', '..ww..ww..ww....', '.ww...ww...ww...'],
    hammerBro: ['....gggggg......', '...ggwwgggg.....', '...gkwkggss.....', '....gggssss.....', '.....sssss......', '...ggggggg......', '..ggwwwwggg.....', '.gggwggwgggg....', '.ssggwwgggss....', '..ssgggggss.....', '....wwwwww......', '....ss..ss......', '...sss..sss.....', '..bbbb..bbbb....'],
    lakitu: ['.....gggg.......', '....gkwkg.......', '....gkwkg.......', '.....ssss.......', '....ssssss......', '..wwwwwwwwww....', '.wwwwwwwwwwww...', '.wwwkwwwwkwww...', '..wwwwwwwwww....', '...wwwwwwww.....'],
    spiny: ['...w...w...w....', '..wrw.wrw.wrw...', '..rrrrrrrrrrr...', '.rrrrwwrrrrrrr..', '.rrwwrrwwrrrrr..', '..rrrrrrrrrrr...', '...sssssssss....', '..ss..ss..ss....', '.bbb..bb..bbb...'],
    egg: ['......ww........', '....wwrrww......', '...wrrrrrrw.....', '..wrrwwrrrrw....', '..wrrrrwwrrw....', '...wrrrrrrw.....', '....wwrrww......', '......ww........'],
    bullet: ['....kkkkkkkk....', '..kkkkkkkkkkkk..', '.kkkwkkkkkkkkkk.', '.kkwwkkkkkkkkkk.', 'kkkwkkkkkkkkkkkk', 'kkkkkkkkkkkkkkkk', '.kkkkwwwwkkkkkk.', '..kkkkkkkkkkkk..', '....kkkkkkkk....'],
    podoboo: ['.......y........', '......yoy.......', '.....yoooy......', '....yoooooy.....', '...yoowwooy.....', '...yookkooy.....', '....yooooy......', '.....yyyy.......'],
    hammer: ['..kkkkkk........', '..kwwwwk........', '..kkkkkk........', '....bb..........', '....bb..........', '....bb..........', '....bb..........'],
    axe: ['......kkkk......', '.....kwwwwk.....', '....kwwwwwwk....', '....kwwwwwwk....', '.....kwwwwk.....', '......kbbk......', '.......bb.......', '.......bb.......', '.......bb.......', '.......bb.......', '.......bb.......', '.......bb.......', '.......bb.......', '.......bb.......', '................', '................']
};
for (const name of ['mario', 'marioBig']) {
    const swim = [...SPRITES[name]], climb = [...SPRITES[name]];
    const arm = name === 'mario' ? 8 : 12;
    swim[arm] = 'ssssrrbbbbrr....'; swim[arm + 1] = '.sssrrbbbbrr....';
    swim[swim.length - 2] = '....bbbbbbbb....'; swim[swim.length - 1] = '........bbbbbb..';
    climb[arm] = '..ssrrbbbbrrss..'; climb[arm + 1] = '..ssrrbbbbrrss..';
    SPRITES[name + 'Swim'] = swim; SPRITES[name + 'Climb'] = climb;
}
const GLYPHS: Record<string, string> = {
    A: '01110100011000111111100011000110001', B: '11110100011000111110100011000111110', C: '01111100001000010000100001000001111', D: '11110100011000110001100011000111110', E: '11111100001000011110100001000011111', F: '11111100001000011110100001000010000', G: '01111100001000010111100011000101111', H: '10001100011000111111100011000110001', I: '11111001000010000100001000010011111', J: '00111000100001000010000101001001100', K: '10001100101010011000101001001010001', L: '10000100001000010000100001000011111', M: '10001110111010110101100011000110001', N: '10001110011010110011100011000110001', O: '01110100011000110001100011000101110', P: '11110100011000111110100001000010000', Q: '01110100011000110001101011001001101', R: '11110100011000111110101001001010001', S: '01111100001000001110000010000111110', T: '11111001000010000100001000010000100', U: '10001100011000110001100011000101110', V: '10001100011000110001100010101000100', W: '10001100011000110101101011101110001', X: '10001100010101000100010101000110001', Y: '10001100010101000100001000010000100', Z: '11111000010001000100010001000011111',
    '0': '01110100011001110101110011000101110', '1': '00100011000010000100001000010001110', '2': '01110100010000100010001000100011111', '3': '11110000010000101110000010000111110', '4': '00010001100101010010111110001000010', '5': '11111100001000011110000010000111110', '6': '01110100001000011110100011000101110', '7': '11111000010001000100010000100001000', '8': '01110100011000101110100011000101110', '9': '01110100011000101111000010000101110', '-': '00000000000000011111000000000000000', '.': '00000000000000000000000000011000110', ':': '00000011000110000000011000110000000', '!': '00100001000010000100001000000000100', '?': '01110100010000100010001000000000100', '/': '00001000010001000100010001000010000', '>': '10000010000010000010001000100010000', '+': '00000001000010011111001000010000000', '©': '01110100011011110101101111000101110'
};
export function text(ctx: CanvasRenderingContext2D, label: string, x: number, y: number, color = '#fff1df', scale = 1, align: 'left' | 'center' | 'right' = 'left') {
    const width = (label.length * 6 - 1) * scale;
    if (align === 'center')
        x -= width / 2;
    if (align === 'right')
        x -= width;
    ctx.fillStyle = color;
    for (const c of label.toUpperCase()) {
        const glyph = GLYPHS[c];
        if (glyph)
            for (let i = 0; i < 35; i++)
                if (glyph[i] === '1')
                    ctx.fillRect(Math.round(x + (i % 5) * scale), Math.round(y + Math.floor(i / 5) * scale), scale, scale);
        x += 6 * scale;
    }
}
export function sprite(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, options: {
    flip?: boolean;
    palette?: Record<string, string>;
    scaleX?: number;
    scaleY?: number;
    frame?: number;
} = {}) {
    const grid = SPRITES[name];
    if (!grid)
        return;
    const sx = options.scaleX ?? 1, sy = options.scaleY ?? 1;
    const pal = { ...PALETTE, ...options.palette };
    for (let row = 0; row < grid.length; row++)
        for (let col = 0; col < grid[row].length; col++) {
            const c = grid[row][col];
            if (c === '.')
                continue;
            let px = options.flip ? 15 - col : col;
            const leg = options.frame && row > grid.length - 5 ? (row % 2 ? options.frame : -options.frame) : 0;
            px += leg;
            ctx.fillStyle = pal[c];
            ctx.fillRect(Math.round(x + px * sx), Math.round(y + row * sy), Math.ceil(sx), Math.ceil(sy));
        }
}
