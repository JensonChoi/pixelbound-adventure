export type CharacterId = 'pip' | 'rowan';
export interface CharacterDefinition {
    displayName: string;
    palette: Record<string, string>;
    firePalette: Record<string, string>;
}
export const CHARACTERS: Record<CharacterId, CharacterDefinition> = {
    pip: {
        displayName: 'PIP',
        palette: {},
        firePalette: { h: '#fff1df', r: '#fff1df', b: '#d43b21' }
    },
    rowan: {
        displayName: 'ROWAN',
        palette: { h: '#268b15', r: '#268b15', b: '#3265b0', a: '#268b15', f: '#268b15', s: '#ffc437' },
        firePalette: { h: '#fff1df', r: '#fff1df', b: '#268b15', a: '#268b15', f: '#268b15', s: '#ffc437' }
    }
};
