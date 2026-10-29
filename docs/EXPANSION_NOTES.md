# Eight-world expansion

## Design target and fidelity

This release expands the existing 60 Hz TypeScript/Canvas game. The original World 1 traversal fixtures and land movement constants are preserved. All new layouts are hand-authored, landmark-based approximations of the NES game; none should be described as a tile-for-tile reproduction. The requested secret-route topology, destination order, environment changes, and progression are implemented. Pipe orientations use this game's existing Down-entry convention.

The [NES map collection](https://www.mariouniverse.com/maps-nes-smb/) and [map reference index](https://vgmaps.de/maps/nes/super-mario-bros) provide external comparison references. No ROM data or downloaded game artwork is bundled.

| World | Stage 1 | Stage 2 | Stage 3 | Stage 4 |
| --- | --- | --- | --- | --- |
| 1 | Original blocks, pipes, coin room | Original underground course; added exit lift, roof passage, 4/3/2 chamber | Original treetops and lifts | Original fire bars, King Brimstone, bridge; advances to 2-1 |
| 2 | Pipes, stair pairs, coin room | Coral columns, ceiling obstacles, Cheeps and Bloopers | Broken bridges and leaping fish | Lava bridges and fire bars |
| 3 | Night pipes and two Hammer Bro platforms | Dense enemies for shell chains | Elevated steps and paired balance lifts | Offset lava pits and longer bars |
| 4 | Lakitu pursuit | Ceiling warp to 5; hidden blocks and vine to 6/7/8 | Mushroom caps, balance and falling lifts | Upper route, then lower route |
| 5 | Beetles and cannon batteries | Raised battlements, Hammer Bros. | Narrow elevated landings | Wider lava crossings |
| 6 | Night Lakitu pursuit | Dense tall-pipe formations | Night platforms and lifts | Faster King Brimstone attacks and hammers |
| 7 | Cannon boulevard and Hammer Bros. | Denser underwater columns and enemies | Longer flying-fish bridges | Lower, middle, upper route sequence |
| 8 | Long course with momentum gaps | Lakitu, cannons, tightly spaced obstacles | Repeated Hammer Bro battlements | Connected pipe maze, flooded vault, final King Brimstone |

Castle layouts use shared construction helpers with distinct pit, fire-bar, and maze data. They intentionally simplify original NES geometry. The 7-4 lower/middle/upper sequence is this implementation's authored approximation. In 8-4, take the first room's pipe at tile 69, the raised pipe in the next hall, then the flooded vault's exit; alternate pipes return to the first room. The final axe releases the bridge and completes the game, whether King Brimstone is alive or has been defeated with fireballs.

## Mechanics and state

`LevelDefinition` remains the single level-data contract. `stageId` identifies the progression stage for connected rooms. Pipe links distinguish room travel from world warps; warp-zone labels reference pipe IDs. The registry validates all destinations and all 32 progression entries. Runtime loading rejects unknown identifiers without mutating the current run.

Same-stage room travel preserves the timer and saved blocks, enemies, pickups, lifts, vines, and maze progress. World warps preserve score, coins, lives, and power, discard old room snapshots, and load a fresh destination with its normal timer and intro. Skipped levels receive no completion credit or time bonus. Death restarts the progression stage, including when it occurs in a bonus room or final-castle section. Only high score and mute preference persist across browser sessions.

Water uses a separate acceleration, gravity, speed, and swim-stroke profile. Up/W attaches to and climbs a revealed vine; Down descends; Jump detaches. Vines must actually be climbed before changing areas. New enemy movement and projectile patterns are deterministic. Buzzy Beetles resist fireballs, Spinies resist normal stomps, and lava kills immediately even during star invincibility. Balance lifts move in opposing directions; falling platforms accelerate after being stepped on.

Maze gates test Pip's feet against authored vertical intervals. An incorrect route rewinds position and camera within the existing room, preserving enemies and collected items rather than spawning duplicates. The normal camera remains forward-scrolling; warp chambers increase its forward view enough to show the destination pipes.

## Verification and tools

- `npm run typecheck`: strict TypeScript, including the browser replay viewer.
- `npm test`: existing gameplay coverage plus full-course replays for all 32 stages, full discovery/entry replays for all seven warp destinations, persistent-state checks for Small/Super/Fire Pip, all progression boundaries, maze retries, new enemy interactions, water/vines/lifts, and final victory.
- `npm run build`: Vite production assets and self-contained offline `dist/play.html`. Both exclude the development selector. Generated build/test artifacts are ignored by Git.
- `npm run dev`: normal game plus a development-only level selector. `/tests/browser.html` replays fixtures through the actual renderer and can stop at a warp chamber, mid-course, destination, or victory.
- `node scripts/find-route.mjs <stage> complete <output.json>`: optional fixture authoring tool. It searches input sequences against copies of the real simulation. Tests replay the resulting inputs from a fresh stage; no coordinate changes, disabled enemies, or invulnerability are used during traversal. Existing fixtures must not be changed simply to conceal a regression.

Replay fixtures prove a valid completion path rather than exhaustively testing every possible movement sequence. Browser checks and their screenshots supplement the deterministic simulation tests; they do not constitute physical touchscreen-device or cross-browser certification.

## Verification record

- 83 tests pass, including every stage and every secret route. Strict TypeScript, production/offline builds, and `git diff --check` pass.
- Chrome: all seven warp fixtures reached the expected destination intro with five lives; the full 8-4 fixture reached victory. The normal development selector loaded 2-2, keyboard swimming responded, and the 390-pixel viewport had a 390-pixel document width (no horizontal overflow).
- Warp chamber labels, sky scenery, victory lettering, and the narrow underwater interface were visually inspected. No application console errors were observed.
- Production and offline output contain no development selector. Offline JavaScript and CSS are inline. Direct offline `file://` launch remains unverified because the browser tool's URL policy blocks local-file navigation. Physical touchscreen hardware, fullscreen, and browsers other than Chrome were not manually tested.

Screenshots: [1-2 warp zone](screenshots/warp-1-2.jpg), [4-2 sky warp zone](screenshots/warp-4-2-sky.jpg), [final victory](screenshots/victory.jpg), [narrow underwater interface](screenshots/narrow-underwater.jpg).
