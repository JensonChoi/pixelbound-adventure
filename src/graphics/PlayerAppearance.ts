import { CHARACTERS, type CharacterId } from '../entities/Character';
import type { Player } from '../entities/Entity';

export function playerPalette(character: CharacterId, power = 0, flashing = false, frame = 0): Record<string, string> {
    const definition = CHARACTERS[character];
    const palette = power === 2 ? definition.firePalette : definition.palette;
    return flashing ? { ...palette, h: '#fff1df', r: ['#fff1df', '#60e5ba', '#ffcc49', '#ef718b'][Math.floor(frame / 4) % 4], b: '#3c5db7' } : palette;
}

export function playerSprite(player: Player, celebrating = false): string {
    const base = player.h > 16 ? 'pipBig' : 'pip';
    if (player.crouched && player.big) return 'pipCrouch';
    if (player.swimming) return base + 'Swim';
    if (player.climbing !== null) return base + 'Climb';
    if (celebrating) return base + 'Celebrate';
    if (player.power === 2 && player.fireCooldown > 12) return base + 'Throw';
    return base;
}
