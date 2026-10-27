# Super Mario Bros. — World Expansion and Warp Zone Update

## Project Context

You have already implemented a functional, browser-based recreation of the original 1985 NES Super Mario Bros. using HTML, CSS, TypeScript, and the Canvas 2D API.

I now want you to **expand the existing game to include all eight worlds and implement authentic NES-style warp zones**, starting with the iconic hidden warp zone in World 1-2.

This is an expansion of the existing project, NOT a new game.

**Important: Inspect the current codebase before making modifications. Reuse the existing game engine, rendering system, physics, collision detection, player controls, enemy systems, and level framework wherever possible.**

Do not unnecessarily rewrite working functionality or regress features already implemented.

## 1. Primary Objectives

Implement the following features:

1. Expand the game to contain all eight worlds, each with four levels, for a total of 32 playable levels.
2. Add the original secret Warp Zone to World 1-2, providing travel to Worlds 2, 3, and 4.
3. Add both original warp-zone routes to World 4-2, providing travel to Worlds 5, 6, 7, and 8.
4. Support different level environments, including overworld, underground, underwater, athletic/platforming, and castles.
5. Introduce additional enemies and environmental hazards found in later worlds.
6. Implement proper transitions between levels and worlds.
7. Preserve Mario's score, lives, coins, and power-up state during normal world progression and warp travel, consistent with NES behavior.
8. Ensure every world and level can be completed through normal gameplay.
9. Extend the architecture so more levels can be added without restructuring the engine.

**Prioritize complete, working levels and functional warp-zone behavior over superficial visual improvements.**

---

# PART I — WORLD AND LEVEL EXPANSION

## 2. Full World Structure

Implement the complete eight-world structure from the original game.

Each world contains four stages.

| World | Levels | Key Themes |
|---|---|---|
| World 1 | 1-1 to 1-4 | Classic overworld, underground, elevated platforms, castle |
| World 2 | 2-1 to 2-4 | Overworld, underwater, bridges, castle |
| World 3 | 3-1 to 3-4 | Nighttime overworld, Koopa challenges, elevated platforms, castle |
| World 4 | 4-1 to 4-4 | Lakitu, underground secrets, mushroom platforms, maze castle |
| World 5 | 5-1 to 5-4 | More difficult overworld and athletic stages, castle |
| World 6 | 6-1 to 6-4 | Nighttime challenges, difficult enemies, platforms, castle |
| World 7 | 7-1 to 7-4 | Bullet Bills, underwater hazards, Hammer Bros., maze castle |
| World 8 | 8-1 to 8-4 | Long difficult stages, complex platforming, final castle |

### Level design priorities

Use the original NES levels as references for:

- Overall level progression
- Ground and platform arrangement
- Pipe placement
- Enemy placement and movement patterns
- Question blocks and power-up locations
- Hidden passages
- Bonus rooms
- Flagpoles
- Castle structures
- Special environmental hazards

Do not simply duplicate the same level geometry across worlds with different colors.

Every level should have recognizable geometry, distinct obstacles, appropriate enemies, and a valid completion path.

If exact reproduction of every level is impractical, prioritize accurate major landmarks, pacing, mechanics, and overall gameplay structure. Clearly distinguish faithful recreations from approximations.

## 3. World 1

Preserve existing functionality in World 1.

Review and improve these levels only where necessary:

**World 1-1:** Classic overworld introduction, Goombas, question blocks, mushrooms, underground coin room, and flagpole.

**World 1-2:** Underground level with moving platforms, brick blocks, pipes, and the secret Warp Zone described in Part II.

**World 1-3:** Elevated platforms, Koopa Troopas, moving lifts, and falling hazards.

**World 1-4:** Castle with lava, fire bars, Bowser encounter, and bridge/axe completion mechanics.

Ensure completing World 1-4 advances to World 2-1.

## 4. World 2

Introduce a new underwater environment.

**2-1:** Overworld with more complex pipe formations, enemies, and secret bonus areas.

**2-2:** Underwater level featuring swimming controls, Cheep Cheeps, Bloopers, underwater obstacles, and aquatic terrain.

**2-3:** Bridge-based level with jumping Cheep Cheeps emerging from below.

**2-4:** Castle with lava pits, rotating fire bars, and a Bowser encounter.

### Underwater physics

Implement a separate underwater movement mode.

- Repeated jump presses make Mario swim upward.
- Gravity is reduced while submerged.
- Mario naturally sinks when not swimming.
- Horizontal movement has an underwater speed and acceleration profile.
- Swimming animations replace normal running/jumping animations.
- Mario collides with underwater blocks and obstacles.
- Fire Mario can still attack where appropriate.
- Underwater enemies move using their own patterns.

Underwater controls must feel distinct from land controls.

## 5. World 3

Introduce nighttime overworld styling and more difficult platforming.

**3-1:** Nighttime overworld with Hammer Bros., Koopas, elevated structures, and enemy combinations.

**3-2:** Nighttime overworld with increasingly dense enemy placement and opportunities for shell interactions.

**3-3:** Elevated platform stage with moving platforms, balance lifts, and dangerous gaps.

**3-4:** Castle with increasingly challenging fire bars, lava, and Bowser.

Use an appropriate dark nighttime background while preserving readable sprite colors.

## 6. World 4

Introduce Lakitu, Spinies, mushroom platforms, and the additional Warp Zones.

**4-1:** Overworld featuring Lakitu flying above Mario and throwing Spiny eggs.

**4-2:** Underground stage containing two distinct secret warp-zone routes, detailed in Part III.

**4-3:** Athletic stage featuring elevated mushroom platforms, narrow landing areas, and balance lifts.

**4-4:** Castle with looping maze-like passages that require Mario to choose the correct route.

### World 4-4 maze mechanic

Implement an explicit maze segment system.

The level should require the player to traverse the correct sequence of paths.

For the original NES-style solution:

- First maze section: take the upper route.
- Second maze section: take the lower route.
- Incorrect routes loop Mario back to an earlier position.

Ensure loop transitions are smooth, do not spawn duplicate enemies, and do not corrupt the camera or level state.

## 7. Worlds 5–7

Implement all twelve stages across these three worlds.

World 5 should introduce increasingly difficult enemy formations, Bullet Bills, more demanding jumping sections, and harder castle obstacles.

World 6 should feature nighttime stages, Lakitu and Hammer Bro challenges, moving platform sequences, and demanding castle sections.

World 7 should introduce more difficult underwater navigation, Bullet Bill formations, challenging enemy combinations, and a looping castle maze in World 7-4.

Each stage must have:

- A complete tile map
- Correct level theme
- Player spawn
- Enemy spawns
- Appropriate hazards
- Collectibles and power-ups
- Camera boundaries
- Functional goal/end condition
- Proper transition to the next level

Implement reusable mechanics instead of special-case code for every level.

## 8. World 8 — Final World

World 8 should feel like the climax of the game.

### 8-1

- Long, demanding overworld stage.
- Dense enemies.
- Wide gaps and challenging obstacles.
- Stronger emphasis on running and momentum.
- Limited room for error.

### 8-2

- Lakitu/Spiny hazards.
- Bullet Bills.
- Difficult jumping sections.
- Tight enemy positioning.

### 8-3

- Castle-themed overworld approach.
- Multiple Hammer Bros.
- Powerful late-game enemy combinations.
- Limited safe areas.

### 8-4 — Final Castle

Implement the final castle as a genuinely challenging level.

Include:

- Multiple connected castle sections.
- Pipe-based transitions.
- Maze-like routing.
- Underground or underwater segments where appropriate.
- Lava hazards.
- Fire bars.
- Enemies guarding narrow passages.
- Final Bowser encounter.

Defeating Bowser in World 8-4 should trigger a distinct final victory sequence.

Display a retro-style completion message and provide the option to return to the title screen or start a new game.

---

# PART II — WORLD 1-2 WARP ZONE

## 9. Exact Feature Request

**Implement the hidden Warp Zone in World 1-2 from the original NES Super Mario Bros.**

This is one of the most important features in this update.

The player must discover the Warp Zone through normal platforming, not through a menu, button, shortcut key, or teleport command.

### Intended discovery sequence

Near the end of World 1-2:

1. Mario encounters moving vertical elevator platforms.
2. The player can ride an ascending platform upward.
3. Near the top, Mario can jump onto the ceiling above the normal exit pipe.
4. Mario can move right along the ceiling.
5. The camera continues scrolling into the hidden area.
6. Mario eventually reaches an opening and drops into the Warp Zone chamber.
7. Three green pipes appear with destination world numbers.
8. Mario can enter one of the pipes by standing on it and pressing Down.

### Critical geometry requirement

**The ceiling route must be physically accessible using the game's normal physics.**

Do not create an invisible teleport trigger that moves Mario to the Warp Zone when he reaches an arbitrary location.

The level geometry must genuinely support riding a platform, jumping onto the upper ceiling, moving along it, and dropping into the hidden chamber.

If necessary, modify the final section of the existing World 1-2 tile map so this route works reliably.

Do not significantly change the existing movement physics just to make the secret reachable.

## 10. Warp Zone Layout

The chamber should resemble the iconic original NES Warp Zone.

Use:

- Black underground background
- Brick/solid floor
- Three green warp pipes
- White 8-bit text
- Classic retro proportions
- Fixed labels above pipes

Display:

```text
     WELCOME TO WARP ZONE!

        4       3       2

       PIPE    PIPE    PIPE
```

**The destinations must be ordered from left to right:**

- Left pipe → World 4-1
- Middle pipe → World 3-1
- Right pipe → World 2-1

Do not reverse or reorder the pipes.

This should be implemented as part of the actual level map, not a modal or separate HTML screen.

## 11. Warp Pipe Interaction

The player must:

1. Stand on the top of the selected pipe.
2. Be horizontally aligned with its entrance.
3. Press or hold Down.
4. Trigger the pipe-entry animation.
5. Move downward into the pipe.
6. Fade or transition to the destination level.

After the transition:

- Display the destination world intro screen.
- Spawn Mario at the normal starting position of the destination's first level.
- Restore player control after the intro.
- Continue gameplay normally.

### State preservation

Warping should preserve:

- Score
- Coin count
- Lives
- Current power-up state
- Relevant persistent game progress

Warping should not:

- Subtract a life
- Reset the game score
- Reset Mario to Small Mario without justification
- Trigger the level's normal flagpole sequence
- Award a time bonus for the skipped level
- Require completing skipped worlds

The destination level should receive its normal starting timer.

## 12. Normal World 1-2 Exit

The existing exit must continue to work.

A player who does not discover the Warp Zone should still:

1. Enter the normal exit pipe.
2. Return to the overworld.
3. Reach the flagpole.
4. Complete World 1-2.
5. Advance to World 1-3.

The Warp Zone is an optional shortcut, not a replacement for the normal completion route.

---

# PART III — WORLD 4-2 WARP ZONES

## 13. Warp Zone to World 5

Near the end of World 4-2, add another secret ceiling route.

Mario should be able to:

1. Use the moving platforms to reach the ceiling.
2. Travel right above the normal exit pipe.
3. Enter a hidden Warp Zone chamber.
4. Discover a single warp pipe.
5. Enter the pipe to travel to World 5-1.

Display an appropriate "WELCOME TO WARP ZONE!" message with the destination number 5.

## 14. Hidden Vine Warp Zone — Worlds 6, 7, and 8

World 4-2 should contain a second Warp Zone, accessed through a hidden vine.

### Discovery sequence

1. Mario reaches a section containing hidden blocks below brick blocks.
2. The player reveals the hidden blocks by jumping into them.
3. The revealed blocks provide a way to reach the higher bricks.
4. Hitting the appropriate brick reveals a beanstalk/vine.
5. The vine grows upward.
6. Mario can climb the vine using Up.
7. Climbing transitions him into a sky bonus area.
8. Mario traverses the sky area and reaches three warp pipes.

### Warp destinations

Use three pipes in this left-to-right order:

- Left → World 6-1
- Middle → World 7-1
- Right → World 8-1

Display:

```text
     WELCOME TO WARP ZONE!

        6       7       8

       PIPE    PIPE    PIPE
```

The sky environment should use:

- Bright blue background
- Clouds
- Elevated platforms
- Green warp pipes
- Classic pixel-art presentation

### Vine mechanics

Implement reusable climbable-vine support.

- Press Up to climb.
- Press Down to descend where supported.
- Horizontal movement is restricted while attached.
- Mario can detach at suitable positions.
- Camera transitions correctly between the main level and the sky area.
- Vine animations and collision states must not interfere with regular jumping.

---

# PART IV — WARP ZONE ARCHITECTURE

## 15. Data-Driven Warp Connections

Avoid hardcoding every Warp Zone directly inside the Player class.

Extend the current level system to support declarative warp destinations.

Suggested TypeScript interfaces:

```typescript
type LevelId = `${number}-${number}`;

interface WarpDestination {
  levelId: LevelId;
  spawnId?: string;
}

interface WarpPipeConfig {
  id: string;
  x: number;
  y: number;
  destination: WarpDestination;
  entryDirection: "down";
  isSecret: boolean;
}

interface WarpZoneConfig {
  id: string;
  title: string;
  pipeIds: string[];
}
```

Example:

```typescript
const world12WarpPipes: WarpPipeConfig[] = [
  {
    id: "world12-warp-4",
    x: 0, // Replace with actual map coordinate
    y: 0,
    destination: { levelId: "4-1" },
    entryDirection: "down",
    isSecret: true
  },
  {
    id: "world12-warp-3",
    x: 0,
    y: 0,
    destination: { levelId: "3-1" },
    entryDirection: "down",
    isSecret: true
  },
  {
    id: "world12-warp-2",
    x: 0,
    y: 0,
    destination: { levelId: "2-1" },
    entryDirection: "down",
    isSecret: true
  }
];
```

Coordinates are placeholders. Determine correct values based on the existing tile map.

### Warp system requirements

- Support multiple warp connections per level.
- Support normal pipe travel and secret warp travel.
- Support transitions between different level environments.
- Validate destination identifiers.
- Handle missing or invalid destinations safely.
- Allow future warp zones to be added through level data.
- Preserve player state during transitions.
- Prevent duplicate transition triggers.
- Avoid starting multiple level-loading operations simultaneously.
- Avoid spurious pipe activation while Mario is merely standing or crouching near a pipe.

Use a single reusable pipe-transition system.

## 16. Level Registry

Create or extend a central level registry.

Every level should have a unique identifier.

Example:

```typescript
interface LevelDefinition {
  id: LevelId;
  world: number;
  stage: number;
  theme: string;
  timeLimit: number;
  playerSpawn: { x: number; y: number };
  tiles: unknown;
  enemies: unknown[];
  pipes: WarpPipeConfig[];
}
```

Adapt these interfaces to the existing architecture rather than duplicating types that already exist.

The game should be able to load any registered level by ID.

Examples:

```typescript
levelManager.loadLevel("1-1");
levelManager.loadLevel("4-1");
levelManager.loadLevel("8-4");
```

### Normal progression

Use the following sequence:

- 1-1 → 1-2 → 1-3 → 1-4 → 2-1
- 2-1 → 2-2 → 2-3 → 2-4 → 3-1
- Continue through World 8-4.

Do not assume the next level is always the next stage within the same world.

Castle completion should advance to the next world's first stage.

After completing World 8-4, trigger the game's victory state.

---

# PART V — NEW ENEMIES AND ENVIRONMENTAL MECHANICS

## 17. Additional Enemy Types

Implement the enemies necessary for Worlds 2–8.

### Cheep Cheep

- Underwater swimming behavior.
- Some variants move horizontally.
- Some variants jump from the water in bridge stages.
- Damage Mario on contact.
- Interact appropriately with fireballs.

### Blooper

- Underwater enemy.
- Moves using irregular vertical/horizontal bursts.
- Pursues Mario within appropriate movement constraints.
- Causes damage on collision.

### Hammer Bro

- Stands on platforms.
- Throws hammers in arcs.
- Periodically jumps between platforms.
- Can be defeated by stomping or suitable attacks.
- Hammer projectiles use collision detection.

### Lakitu

- Flies above the playable terrain.
- Moves relative to Mario and the camera.
- Periodically drops Spiny eggs.
- Can be defeated where reachable.

### Spiny

- Hatches or appears from Lakitu's eggs.
- Walks along platforms.
- Damages Mario when touched.
- Cannot be defeated through ordinary stomping.
- Can be defeated by suitable power-ups or shell interactions.

### Bullet Bill

- Emerges from cannons or designated spawn patterns.
- Moves horizontally.
- Can be stomped when appropriate.
- Damages Mario on other contact.

### Buzzy Beetle

- Behaves similarly to a Koopa.
- Can retract into a shell.
- Is resistant to fireballs.
- Can be kicked and used against enemies.

### Podoboo / Lava Bubble

- Periodically jumps from lava.
- Follows a predictable vertical trajectory.
- Damages Mario on contact.
- Returns to the lava.

### Bowser variations

Reuse the existing Bowser system, but support different behavior profiles in later castles.

Possible differences:

- Movement patterns
- Fireball frequency
- Hammer throwing
- Increased hazard density

## 18. Environmental Mechanics

Implement reusable environment systems for:

- Water physics
- Lava hazards
- Moving elevator platforms
- Balance lifts
- Narrow athletic platforms
- Falling platforms where needed
- Rotating fire bars
- Bullet Bill cannons
- Vines
- Hidden blocks
- Looping castle sections
- Connected pipe/bonus areas

### Moving platforms

Mario must correctly inherit platform movement while standing on them.

Avoid:

- Falling through moving platforms
- Slipping off stationary-relative positions
- Camera jitter
- Missed landings caused by inconsistent update order

### Fire bars

- Rotate around a fixed pivot.
- Use time-based rotation.
- Detect collision accurately.
- Support configurable length, orientation, and speed.

### Lava

- Use animated pixel-art lava tiles.
- Falling into lava causes immediate death.
- Lava geometry should not be treated like ordinary solid ground.

---

# PART VI — VISUAL THEMES

## 19. Level Themes

Create reusable palettes and backgrounds for:

**Overworld**
- Blue sky
- Clouds
- Bushes
- Hills
- Brown ground
- Green pipes

**Nighttime**
- Dark sky
- Bright foreground tiles
- Appropriate classic NES-style contrasting colors

**Underground**
- Black background
- Blue and dark brick formations
- Dimmer decorative elements

**Underwater**
- Blue aquatic background
- Coral and underwater scenery
- Water-specific animations
- Sea creatures

**Athletic**
- Elevated wooden/mushroom platforms
- Large gaps
- Clouds and sky
- Sparse ground

**Castle**
- Dark background
- Gray stone blocks
- Lava
- Fire bars
- Castle-specific obstacles

Reuse the existing sprite renderer and tile system.

Do not implement a completely different rendering engine for each environment.

---

# PART VII — GAME PROGRESSION AND PLAYER STATE

## 20. Persistent State

Extend the game session state to track:

```typescript
interface GameProgress {
  currentLevel: LevelId;
  score: number;
  coins: number;
  lives: number;
  playerPowerState: "small" | "super" | "fire";
  highestWorldReached: number;
}
```

Adapt this to existing types and game state.

### Required behaviors

- Normal level completion preserves persistent player progress.
- Secret warp travel also preserves progress.
- Death removes a life and restarts according to the existing game rules.
- World transitions display the correct level label.
- World intro screens display correct lives.
- Player input is disabled during transitions.
- Time resets to the destination level's intended starting value.
- Level-specific enemies and interactive objects reset correctly when loading a fresh level.

## 21. Level Selection for Testing

Add an optional development-only level selection feature.

This is intended to make testing all 32 levels practical.

For example:

- Press a designated debug key to open a level selection overlay.
- Choose any world and stage.
- Load that level immediately.

Requirements:

- Disabled by default in normal gameplay.
- Clearly marked as a development tool.
- Does not replace normal world progression.
- Does not interfere with warp-zone mechanics.

Consider using a development-only flag such as:

```typescript
const DEBUG_LEVEL_SELECT = import.meta.env.DEV;
```

The debug selector should list only registered, playable levels.

---

# PART VIII — TESTING AND VALIDATION

## 22. World 1-2 Warp Zone Test

This is a mandatory acceptance test.

Starting from World 1-2:

1. Mario moves through the level normally.
2. Mario reaches the moving lift section near the exit.
3. Mario rides a lift up.
4. Mario jumps onto the ceiling.
5. Mario walks right above the normal exit pipe.
6. Mario reaches the hidden chamber.
7. "WELCOME TO WARP ZONE!" is visible.
8. Three green pipes are visible.
9. The pipes are labeled 4, 3, and 2 from left to right.
10. Entering the left pipe loads World 4-1.
11. Entering the middle pipe loads World 3-1.
12. Entering the right pipe loads World 2-1.

Test all three destinations independently.

Confirm the correct spawn, world label, camera position, game state, and preserved player progress.

## 23. World 4-2 Warp Zone Tests

Verify:

- The ceiling passage leads to the World 5 warp.
- The hidden blocks can be discovered.
- The secret vine can be revealed.
- Mario can climb the vine.
- The sky area loads correctly.
- The three sky warp pipes lead to 6-1, 7-1, and 8-1.
- Normal World 4-2 completion still leads to 4-3.

## 24. Additional Regression Tests

Test the following:

- World 1 still works after the expansion.
- All 32 levels load without errors.
- Every level has a valid completion condition.
- Standard progression works across world boundaries.
- Mario cannot enter unintended solid pipes.
- Warp transitions do not create infinite loops.
- Warping does not duplicate enemies.
- Underwater controls activate and deactivate correctly.
- Moving platforms carry Mario correctly.
- Castle mazes loop only when intended.
- Bowser encounters remain functional.
- Death and respawn work in all environments.
- Player power-ups persist across level transitions.
- HUD world numbers update correctly.
- Camera state resets when loading a new level.
- Completing 8-4 triggers the final victory state.

### Build validation

After making changes:

1. Run the TypeScript compiler.
2. Run the production build.
3. Launch the game.
4. Test the warp-zone interactions if browser interaction is available.
5. Fix any errors discovered.

Do not mark the expansion complete merely because the build succeeds. Gameplay and collision behavior must also be validated.

---

# PART IX — IMPLEMENTATION ORDER

## 25. Development Phases

Implement the expansion in the following order.

### Phase 1 — World 1-2 Warp Zone

- Inspect existing level/pipe code.
- Extend World 1-2's geometry.
- Add the moving-platform-to-ceiling secret path.
- Add the Warp Zone chamber.
- Implement the three warp destinations.
- Preserve session state.
- Verify all three paths.

This should be the first fully working milestone.

### Phase 2 — Level Registry and World Progression

- Register all world/stage identifiers.
- Build reusable cross-world transitions.
- Add data-driven warp support.
- Add a debug level selector.
- Ensure existing World 1 behavior remains correct.

### Phase 3 — Worlds 2 and 3

- Implement all eight levels.
- Add underwater movement.
- Add aquatic enemies.
- Add night themes.
- Add required moving-platform mechanics.
- Verify both worlds are fully playable.

### Phase 4 — World 4 and Warp Zones

- Implement all four levels.
- Add Lakitu and Spinies.
- Add the castle maze system.
- Add the World 5 ceiling warp.
- Add the vine-accessed Worlds 6–8 warp.
- Test every warp destination.

### Phase 5 — Worlds 5, 6, and 7

- Add all twelve levels.
- Expand enemy systems.
- Implement additional castle hazards.
- Confirm standard progression works.

### Phase 6 — World 8

- Build the final four levels.
- Implement the final castle routing.
- Add final Bowser encounter.
- Add victory sequence.

### Phase 7 — Final Polish

- Improve visual authenticity.
- Refine enemy behavior.
- Fix collision bugs.
- Verify animations and transitions.
- Test all levels.
- Confirm stable performance.

**Complete a working milestone before moving to the next. If the implementation is too large for one pass, prioritize fully functional Warp Zones and playable levels rather than incomplete content across all eight worlds.**

---

# PART X — FINAL ACCEPTANCE CRITERIA

The expansion is complete when:

- [ ] The existing game remains fully playable.
- [ ] All eight worlds are implemented.
- [ ] All 32 levels can be loaded and completed.
- [ ] World 1-2 has its original hidden Warp Zone.
- [ ] The World 1-2 Warp Zone is reached by climbing above the normal exit.
- [ ] The three World 1-2 pipes correctly lead to Worlds 4, 3, and 2.
- [ ] World 4-2 has a ceiling warp to World 5.
- [ ] World 4-2 has a vine-accessed sky Warp Zone to Worlds 6, 7, and 8.
- [ ] Warp connections work without disrupting player progress.
- [ ] Underwater and nighttime environments function correctly.
- [ ] Later-world enemies and hazards are implemented.
- [ ] Castle levels and Bowser encounters work.
- [ ] World progression works correctly from 1-1 through 8-4.
- [ ] Completing World 8-4 triggers the final victory sequence.
- [ ] There are no major rendering, collision, loading, or input bugs.

## Final Instructions

Begin by examining the current codebase and identifying the existing level loading, camera, platform physics, pipe interaction, and session state systems.

**Do not rebuild the game from scratch. Extend what already works.**

Your first priority is making the hidden World 1-2 Warp Zone fully playable, including its ceiling access route and all three warp destinations.

Then extend world progression, implement the remaining worlds, and add the World 4-2 warp zones.

Use the original 1985 NES Super Mario Bros. as the primary gameplay and level-design reference, while avoiding unnecessary architectural complexity.

Deliver actual working code, not just design documents or implementation plans. Verify each major feature before considering it complete.