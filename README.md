# Super Mario Bros. — The 8-bit Arcade

A complete four-course, browser-based platform game built with TypeScript, Canvas 2D, and synthesized Web Audio. All sprites, tiles, lettering, and music are generated locally. No backend, external assets, or runtime framework is required.

## Run

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite, then press **Enter** to begin.

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

The production build creates the usual Vite site in `dist/` and a self-contained **`dist/play.html`**. You can open `play.html` directly in a browser, without a server or internet connection. Audio begins after a keyboard or pointer interaction.

## Controls

| Action | Keys |
| --- | --- |
| Move | Left / Right or A / D |
| Jump | Space or Z; hold for a higher jump |
| Run / shoot a fireball | Shift or X |
| Crouch / enter a pipe | Down or S |
| Start / pause / resume | Enter |
| Restart course, costing one life | Restart Level button next to Start/Pause |

Touch devices also show directional, jump, and run/fire buttons. The cabinet has start/pause, sound, and fullscreen controls. Losing browser focus pauses active gameplay and clears held inputs. Press Enter to resume.

## The adventure

- **1-1 — The Overworld:** Familiar opening blocks, pipes, gaps, staircases, Goombas, a Koopa, hidden rewards, and the flagpole. Hold Down on the fourth tall pipe to visit the underground coin room; its right-hand pipe returns you farther along the main course.
- **1-2 — The Underground:** Low ceilings, brick corridors, coin formations, Koopas, and moving platforms. Enter the final pipe with Down to reach the overworld exit and flagpole.
- **1-3 — The Treetops:** Elevated platforms, moving landings, red and green Koopas, and a flagpole.
- **1-4 — The Castle:** Lava, rotating fire bars, moving platforms, Bowser and his fire attacks. Reach the axe to release the bridge and finish the adventure. Five fireball hits also defeat Bowser, but the axe completes the course.

Mushrooms grow Mario, flowers grant fireballs, and stars grant temporary invincibility. A powered-up block supplies a flower instead of a mushroom. Stomp Koopas to create shells, then touch a stationary shell to kick it. Collecting 100 coins awards a life.

Each run begins with five lives. Death removes power-ups and restarts the course. Score and coins carry across deaths; power carries across completed courses. Bonus-room visits preserve the main course's blocks and enemies. The countdown uses classic accelerated game time, stopping during pause and transitions. Flagpole completion converts the remaining time into points. Only high score and mute preference persist between sessions.

## Structure

- `src/core/`: Game state machine, fixed 60 Hz simulation, collision and movement, input, and audio.
- `src/entities/`: Shared entity contracts and player state.
- `src/world/`: Typed level definitions, tile helpers, and the four courses plus connected rooms.
- `src/graphics/`: Hand-drawn pixel grids, bitmap font, and Canvas rendering.
- `src/main.ts` and `src/styles/`: Responsive arcade interface and browser integration.
- `tests/`: Gameplay regression tests and recorded controller replays.

Add courses through `LevelDefinition` data and the progression list. Geometry is cloned into runtime state; level definitions remain immutable. Rendering and audio are separate from physics. Physics constants are centralized in `src/core/Physics.ts`.

The simulation subdivides fast movement, resolves horizontal and vertical collisions separately, and uses previous positions for stomps and platform landings. The camera only advances to the right. Hidden blocks collide only with upward player movement. Movement platforms carry the player; red Koopas check for platform edges.

## Verification

`npm test` uses Node's built-in test runner, with esbuild compiling the TypeScript imports. It covers collision tunneling, jump height, acceleration and skidding, blocks, power-ups, damage, Goombas, shells, red Koopas, plants, Bowser, moving platforms, coins/lives, timer pausing, pipe round trips, restarting, progression, victory, and identical simulation at 30/60/144 Hz rendering rates.

Four controller replay fixtures clear all four courses using ordinary inputs and the real physics/enemy systems. They never teleport Mario, disable collisions, or grant invulnerability during traversal. The pipe round-trip test separately verifies bonus-room preservation.

Development validation: **32 tests pass**, TypeScript strict checks pass, and production/offline builds succeed. The title screen and surrounding interface were visually inspected in Chrome. Full manual browser gameplay, touch-device interaction, and fullscreen testing remain unverified: the development environment denied opening a server port, and an isolated browser was unavailable. The standalone build provides a local preview without a server.

## Assets and scope

This is an independent fan-made tribute, not an official Nintendo product. Nintendo's names and characters remain their respective owner's property. Code, pixel grids, tile drawings, bitmap glyphs, and synthesized melodies were created for this project; no ROM data, ripped sprites, original soundtrack recordings, or remotely hosted assets are used. Supplied reference images are design references and are not bundled into the game.

The implemented scope is World 1. Physics and layouts aim for a recognizable NES feel rather than ROM-exact emulation. Water levels, Worlds 2–8, gamepads, and saved-run continuation are outside this release.
