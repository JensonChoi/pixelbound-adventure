# Pixelbound Adventure — The 8-bit Arcade

An eight-world, 32-course browser-based platform game built with TypeScript, Canvas 2D, and synthesized Web Audio. All sprites, tiles, lettering, and music are generated locally. No backend, external assets, or runtime framework is required.

## Run

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite, select **Pip or Rowan** with Up/W or Down/S (or the character buttons), then press **Enter** to begin. Both characters share the same physics and abilities; Rowan wears a green shirt and blue overalls, switching to a white shirt and green overalls with fire power.

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

The production build creates the usual Vite site in `dist/` and a self-contained **`dist/play.html`**. You can open `play.html` directly in a browser, without a server or internet connection. Audio begins after a keyboard or pointer interaction.

## CI and deployment

[`.github/workflows/pages.yml`](.github/workflows/pages.yml) runs on every branch push, pull requests to `main`, and manual dispatch. It installs locked dependencies with `npm ci` on Node.js 22, runs the gameplay regression tests, and type-checks and builds the production site and offline game. A failed test or build prevents deployment.

Successful pushes to `main` deploy `dist/` to GitHub Pages. Feature branches and pull requests only run validation. Deployment uses GitHub's built-in token with Pages and OIDC permissions scoped to the deployment job; no personal access token or repository secrets are needed. Deployments run one at a time.

One-time setup:

1. In the repository's [Settings → Pages](https://github.com/JensonChoi/super-mario-bros-clone/settings/pages), set **Build and deployment → Source** to **GitHub Actions**.
2. Merge the workflow into `main`. That push runs validation and the first deployment.
3. Open the URL shown by the deployment job: **https://jensonchoi.github.io/super-mario-bros-clone/**. The offline game is also available at **https://jensonchoi.github.io/super-mario-bros-clone/play.html**.

To redeploy, open **Actions → CI and deploy to GitHub Pages → Run workflow** and select `main`. A manual run on another branch validates it without publishing. Check the workflow logs and the `github-pages` environment for deployment status and any required environment approvals. To roll back, revert the unwanted change on `main`; the resulting push rebuilds and redeploys it.

Vite emits relative asset URLs so the same build works under the GitHub Pages repository path or at a domain root. Generated files stay in the workflow artifact and are not committed. See the [GitHub Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) for hosting details.

## Controls

| Action | Keys |
| --- | --- |
| Move | Left / Right or A / D |
| Jump | Space or Z; hold for a higher jump |
| Run / shoot a fireball | Shift or X |
| Crouch / enter a pipe / descend vine | Down or S |
| Climb vine | Up or W; Jump detaches |
| Swim upward | Press Jump repeatedly |
| Select Pip / Rowan on title | Up / W and Down / S |
| Start / pause / resume / continue dialogue | Enter |
| Restart course, costing one life | Restart Level button next to Start/Pause |

Touch devices also show directional, jump, and run/fire buttons. The cabinet has start/pause, sound, and fullscreen controls. Losing browser focus pauses active gameplay and clears held inputs. Press Enter to resume.

## The adventure

- **1-1 — The Overworld:** Familiar opening blocks, pipes, gaps, staircases, Goombas, a Koopa, hidden rewards, and the flagpole. Hold Down on the fourth tall pipe to visit the underground coin room; its right-hand pipe returns you farther along the main course.
- **1-2 — The Underground:** Low ceilings, brick corridors, coin formations, Koopas, and moving platforms. Enter the final pipe with Down to reach the overworld exit and flagpole.
- **1-3 — The Treetops:** Elevated platforms, moving landings, red and green Koopas, and a flagpole.
- **1-4 — The Castle:** Lava, rotating fire bars, moving platforms, King Brimstone and his fire attacks. Reach the axe to release the bridge and continue to World 2. Five fireball hits also defeat King Brimstone, but the axe completes the course.

Worlds 2–8 introduce underwater passages, flying-fish bridges, night stages, mushroom platforms, Hammer Bros., Lakitu and Spinies, Bullet Bills, Buzzy Beetles, lava bubbles, and increasingly difficult castles. World 8-4 connects multiple castle rooms and an underwater passage before the final King Brimstone encounter.

Each castle axe collapses the bridge and starts an automatic walk into the rescue chamber. In Worlds 1–7, Moss thanks the selected character before advancing to the next world after four seconds or Enter/Continue. World 8-4 ends with Princess Elara: her dialogue stays visible until Enter/Continue, then the victory screen shows your final score. Gameplay and damage stop during rescues; remaining time becomes bonus points before dialogue. Character selection stays locked for the run and persists through deaths and warps. Return to Title from pause, Game Over, or victory to choose again; Play Again keeps the current character.

The hidden 1-2 ceiling route leads to three pipes ordered **4, 3, 2**. In 4-2, the ceiling route leads to **5**; revealing hidden stepping blocks and the vine leads to sky pipes ordered **6, 7, 8**. All warps preserve score, coins, lives, and power, reset the destination timer, and show the destination intro. Normal exits remain available.

Mushrooms grow the selected character, flowers grant fireballs, and stars grant temporary invincibility. A powered-up block supplies a flower instead of a mushroom. Stomp Koopas to create shells, then touch a stationary shell to kick it. Collecting 100 coins awards a life.

Each run begins with five lives. Death removes power-ups and restarts the course. Score and coins carry across deaths; power carries across completed courses. Bonus-room visits preserve the main course's blocks and enemies. The countdown uses classic accelerated game time, stopping during pause and transitions. Flagpole completion converts the remaining time into points. Only high score and mute preference persist between sessions.

## Structure

- `src/core/`: Game state machine, fixed 60 Hz simulation, collision and movement, input, and audio.
- `src/entities/`: Shared entity contracts and player state.
- `src/world/`: Typed level definitions, tile helpers, and all 32 courses plus connected rooms.
- `src/graphics/`: Hand-drawn pixel grids, bitmap font, and Canvas rendering.
- `src/main.ts` and `src/styles/`: Responsive arcade interface and browser integration.
- `tests/`: Gameplay regression tests and recorded controller replays.

Add courses through `LevelDefinition` data and the progression list. Geometry is cloned into runtime state; level definitions remain immutable. Rendering and audio are separate from physics. Physics constants are centralized in `src/core/Physics.ts`.

The simulation subdivides fast movement, resolves horizontal and vertical collisions separately, and uses previous positions for stomps and platform landings. The camera only advances to the right. Hidden blocks collide only with upward player movement. Movement platforms carry the player; red Koopas check for platform edges.

## Verification

`npm test` uses Node's built-in test runner, with esbuild compiling the TypeScript imports. It covers collision tunneling, jump height, acceleration and skidding, blocks, power-ups, damage, Goombas, shells, red Koopas, plants, King Brimstone, moving platforms, coins/lives, timer pausing, pipe round trips, restarting, progression, victory, and identical simulation at 30/60/144 Hz rendering rates.

Controller replay fixtures clear all 32 courses and all seven warp destinations using ordinary inputs and the real physics/enemy systems. Both characters replay the same fixtures with identical simulation results. The original four World 1 fixtures are unchanged. They never teleport the player, disable collisions, or grant invulnerability during traversal. The pipe round-trip test separately verifies bonus-room preservation. Rescue tests cover all eight castles with both characters, state preservation, dialogue timing, input repeat protection, and one-time transitions and sounds.

Validation commands: `npm run typecheck`, `npm test`, and `npm run build`. The suite includes 32 full-course replays, seven secret-route replays, transition/state checks, maze loops, water/vine movement, enemy interactions, and final victory. Browser verification uses the same simulation and renderer through `/tests/browser.html` while the development server is running. That viewer and its fixtures are not included in production builds.

The development server also exposes a **DEV: LEVEL SELECT** button below the journey panel. Open it, choose a registered stage, and click **LOAD LEVEL**. The selector is removed from both the Vite production build and offline HTML. It is not a gameplay warp shortcut.

## Assets and scope

This is an independent fan-made tribute, not an official Nintendo product. Nintendo's names and characters remain their respective owner's property. Code, pixel grids, tile drawings, bitmap glyphs, and synthesized melodies were created for this project; no ROM data, ripped sprites, original soundtrack recordings, or remotely hosted assets are used. Supplied reference images are design references and are not bundled into the game.

All eight worlds are playable. Layouts and enemy patterns are landmark-based approximations, not ROM-exact recreations. See [expansion notes](docs/EXPANSION_NOTES.md) for stage landmarks, maze solutions, architecture, and verification. Gamepads and saved-run continuation remain outside this release.

The game is titled **Pixelbound Adventure**. Its playable heroes are **Pip** and **Rowan**, with **Moss** and **Princess Elara** in the rescue scenes and **King Brimstone** as the castle boss. The repository URL and historical replay filenames retain their existing names. `docs/SPEC.md`, `docs/CHARACTER.md`, and `docs/EXPANSION.md` are archived implementation briefs using the earlier branding. This rename does not change the artwork, music, level geometry, or gameplay, and is not an intellectual-property clearance.
