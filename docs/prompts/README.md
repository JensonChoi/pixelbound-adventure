# Archived implementation prompts

These prompts preserve the original requests for successive development phases, including the names and assumptions used at the time. They document historical intent and are not the current game specification or ongoing agent instructions.

See the [project README](../../README.md) for current behavior and [AGENTS.md](../../AGENTS.md) for contributor instructions. [Implementation notes](../implementation/world-expansion.md) describe the delivered world expansion, its approximations, and its verification record.

| Order | Prompt | Purpose | Implementation notes |
| --- | --- | --- | --- |
| 001 | [Initial game](001-initial-game.md) | Establish the browser game, engine, visuals, and gameplay requirements. | — |
| 002 | [World expansion](002-world-expansion.md) | Expand to eight worlds and add secret warp routes. | [World expansion](../implementation/world-expansion.md) |
| 003 | [Character selection and rescues](003-character-selection-and-rescues.md) | Add a second playable character and castle rescue sequences. | — |

## Adding prompts

- Use the next sequence number and a descriptive lowercase filename, such as `004-feature-name.md`.
- Preserve the original prompt text; record later corrections, decisions, and deviations in separate implementation notes or a linked pull request.
- Add an index entry with the prompt's purpose and related implementation notes or pull request when available.
- Exclude credentials and private context before committing a prompt.
