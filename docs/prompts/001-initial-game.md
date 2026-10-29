# Build an 8-Bit Super Mario Bros. Web Game

## Objective

Build a fully playable, polished, browser-based recreation of the original 1985 NES **Super Mario Bros.** using **HTML, CSS, and TypeScript**.

The game should closely resemble the original NES experience in terms of visuals, gameplay mechanics, physics, level design, enemy behavior, and overall presentation.

I am comfortable with authentic 8-bit pixel graphics. Prioritize faithful gameplay, smooth performance, responsive controls, and a nostalgic NES aesthetic over modern visual effects.

**Do not build a simple Mario-inspired platformer or a static demonstration. Build a complete, functioning side-scrolling game with an actual game loop, multiple levels, enemies, power-ups, lives, and win/lose conditions.**

## 1. Technology Stack

Use the following technologies:

- **HTML5** for the game container, menus, and interface.
- **CSS3** for layout, UI styling, and retro visual presentation.
- **TypeScript** for all game logic, physics, entity management, and rendering.
- **HTML5 Canvas 2D API** for rendering the game.
- **Vite** for development and bundling.
- **Web Audio API** for synthesized retro sound effects and music where practical.

Do not use React, Phaser, PixiJS, Three.js, or another game engine. Implement the gameplay engine directly in TypeScript.

The project should run locally using:

```bash
npm install
npm run dev
```

### Technical requirements

- Use `requestAnimationFrame` with a fixed timestep game loop (60 FPS simulation).
- Use a logical resolution of **256 × 240 pixels**, matching the NES output dimensions.
- Scale the game cleanly to modern screens while preserving the original aspect ratio.
- Disable canvas interpolation using `imageSmoothingEnabled = false`.
- Support high-DPI displays without blurring pixel art.
- Use object-oriented or component-based code with clear separation of concerns.
- Keep gameplay deterministic and independent of rendering frame rate.
- Minimize external dependencies.

## 2. Visual Design and Presentation

Recreate the recognizable visual style of the original Super Mario Bros. for NES. Visual references available under visual_references/ folder.

### Overall appearance

- Classic 8-bit pixel art.
- Bright blue overworld sky.
- Brown brick and ground tiles.
- Orange question blocks.
- Green pipes.
- Pixelated clouds, bushes, and hills.
- Original-style Mario character proportions.
- Pixelated enemies and animated objects.
- Black backgrounds for underground and castle levels.
- No antialiasing, gradients, or modern 3D effects.

Use a consistent 16 × 16 tile system.

Prefer programmatically generated pixel-art sprites, pixel grids, or locally created sprite sheets. Do not depend on unreliable external image URLs.

### Main character

Implement recognizable Mario-style sprites with animations for:

- Idle
- Walking
- Running
- Jumping
- Falling
- Skidding
- Crouching (Super Mario)
- Swimming (water levels, if implemented)
- Taking damage
- Dying
- Entering pipes
- Completing a level

Mario should face the direction of movement, and his animation speed should increase when running.

### HUD

Display a classic NES-style HUD at the top:

```text
MARIO           WORLD           TIME
012450   ×03     1-1             378
           COINS ×07
```

Include:

- Current score
- Number of coins collected
- Current world and level
- Remaining time
- Lives remaining (on the intermission screen)

Use a retro pixel font.

### Screens

Implement:

1. Title screen with "SUPER MARIO BROS." styling
2. Start game interaction
3. World/level intro screen
4. Actual gameplay screen
5. Pause screen
6. Game Over screen
7. Level completion screen
8. Victory screen after the final level

## 3. Controls

Implement smooth, precise keyboard controls.

| Key | Action |
|---|---|
| Left Arrow / A | Move left |
| Right Arrow / D | Move right |
| Space / Z | Jump |
| Shift / X | Run / Fireball |
| S / Down Arrow | Crouch or enter pipe |
| Enter | Start / Pause |
| R | Restart current level |

### Input behavior

- Holding jump should produce a higher jump than tapping it.
- Running should increase maximum horizontal speed.
- Mario should accelerate and decelerate naturally.
- Direction changes at high speed should produce skidding.
- Jumping while running should preserve horizontal momentum.
- Jumping on enemies should cause Mario to bounce.
- Inputs must work smoothly when multiple keys are held simultaneously.
- Prevent arrow keys and Space from scrolling the browser.
- Handle browser focus loss without leaving movement keys stuck.

Optional: Support controllers using the browser Gamepad API.

## 4. Movement and Physics

**This is one of the highest-priority features.**

The movement must feel as close as reasonably possible to the original NES Super Mario Bros.

### Horizontal movement

Implement:

- Acceleration from rest.
- Separate walking and running speeds.
- Friction/deceleration after releasing movement.
- Different ground and air movement behavior.
- Momentum preservation while jumping.
- Skidding when reversing direction at speed.

Avoid instant full-speed movement or instant stopping.

### Jumping

Implement:

- Variable-height jumping based on how long jump is held.
- Gravity-driven ascending and descending.
- Higher and longer jumps when running.
- Distinct small and Super Mario collision dimensions.
- Reliable head collision with overhead blocks.
- Jump cancellation when Mario hits a ceiling.
- Bounce mechanics when stomping enemies.

The jump arc should feel responsive, predictable, and nostalgic.

### Collision detection

Implement robust axis-aligned collision detection using hitboxes.

Support:

- Ground collisions
- Platform landings
- Ceiling collisions
- Wall collisions
- Pipes
- Brick blocks
- Question blocks
- Enemy collisions
- Projectile collisions
- Collectible interactions
- Moving platforms where applicable

Resolve horizontal and vertical collisions separately.

Avoid tunneling, clipping into walls, falling through floors, and jittering on platforms.

Use a consistent coordinate system and fixed timestep physics.

## 5. Tile-Based Level System

Build levels using a tile map system.

Each level should be defined using structured TypeScript data or JSON-like objects, separating level geometry from the game engine.

Support tile types such as:

- Empty space
- Solid ground
- Brick
- Question block
- Used question block
- Indestructible block
- Pipe top and body
- Stairs
- Hidden block
- Coin
- Platform
- Goal flagpole
- Castle entrance
- Underground entrance
- Decorative tiles

Level definitions should also specify:

- Background theme
- Spawn location
- Enemy positions and types
- Power-up locations
- Pipe connections
- Secret areas
- Time limit
- Level exit
- Music theme

### Scrolling

Implement classic horizontal side-scrolling:

- Mario starts on the left portion of the screen.
- The camera begins following Mario after he moves sufficiently right.
- The world scrolls smoothly as Mario advances.
- Tiles and objects render based on world coordinates.
- The camera must not expose areas outside the level.
- Preserve the classic behavior where Mario generally cannot backtrack once the camera has scrolled past an area.

Use camera culling to avoid rendering objects far outside the viewport.

## 6. Levels and World Progression

Prioritize accurate recreation of **World 1-1**, then build additional levels.

### World 1-1

Recreate the iconic opening level with:

- Blue sky
- Grassy hills and cloud decorations
- Long ground platforms
- First question-mark block
- Goombas
- Brick formations
- Mushroom power-up
- Green pipes of different heights
- Underground bonus area accessible via a pipe
- Coin collections
- Hidden blocks
- Staircase near the end
- Flagpole
- Small castle at the level exit

The level should be recognizable and feel authentic in overall progression, enemy placement, and obstacle design.

### World 1-2

Create an underground level with:

- Black background
- Blue underground bricks
- Narrow tunnels
- Goombas and Koopa Troopas
- Underground coin formations
- Moving platform sections
- Pipe transitions
- An exit leading back to the overworld

### World 1-3

Create an elevated platform level with:

- Blue sky
- Multiple floating platforms
- Gaps that require accurate jumping
- Moving platforms
- Koopa Troopas
- Vertical platform arrangements
- Flagpole at the end

### World 1-4

Create a castle level with:

- Dark background
- Gray castle blocks
- Lava pits
- Fire bars or rotating hazards
- Moving obstacles
- A boss encounter with Bowser
- An axe or bridge-release mechanism
- A successful castle completion sequence

### Additional progression

Architect the level system so that Worlds 2–8 can be added without changing the core engine.

If practical, implement additional worlds after World 1 is fully functional. Do not sacrifice quality or completeness of World 1 to produce many unfinished levels.

## 7. Enemy Behavior

Implement the following enemies using a shared entity system and individual behavior logic.

### Goomba

- Walks horizontally.
- Reverses direction upon hitting obstacles if appropriate to the implemented level behavior.
- Falls off ledges.
- Can be defeated by jumping on its head.
- Plays a squashing animation when defeated.
- Damages Mario on side contact.

### Green Koopa Troopa

- Walks horizontally.
- Can be stomped into its shell.
- Shell remains stationary initially.
- Mario can kick the shell.
- Moving shell defeats enemies it hits.
- Moving shell can damage Mario.
- Shell can rebound from walls.

### Red Koopa Troopa

- Similar to green Koopa.
- Patrols platforms without deliberately walking off their edges.

### Piranha Plant

- Emerges periodically from pipes.
- Retracts into pipes.
- Harms Mario on contact.
- Avoids emerging when Mario is too close, as appropriate.

### Additional enemies (if time permits)

- Buzzy Beetle
- Bullet Bill
- Cheep Cheep
- Hammer Bro
- Lakitu
- Spiny
- Blooper
- Bowser

### Enemy system requirements

- Spawn enemies based on level definitions.
- Activate enemies when approaching the visible camera area.
- Update only relevant nearby entities.
- Support interactions between enemies, Mario, shells, and projectiles.
- Properly handle death animations and entity cleanup.

## 8. Blocks and Interactive Objects

### Question blocks

When Mario hits a question block from below:

1. The block briefly bumps upward.
2. A coin or power-up appears.
3. A sound effect plays.
4. The block becomes a used block.
5. The score or inventory updates.

### Brick blocks

- Small Mario bumps the brick without destroying it.
- Super Mario can destroy bricks from below.
- Broken bricks produce small pixel debris.
- Some bricks contain coins or hidden items.

### Hidden blocks

- Initially invisible.
- Become visible when hit from below.
- May contain coins or special power-ups.

### Pipes

- Solid collision geometry.
- Some pipes allow entry by pressing Down.
- Pipe travel triggers a transition animation.
- Underground bonus areas can be accessed and exited.
- Mario appears from the connected destination pipe.

### Coins

- Can be collected in the air.
- May emerge from blocks.
- Play sound and visual effects on collection.
- Increase coin count and score.
- Every 100 coins awards an extra life.

## 9. Power-Ups and Player States

Implement a state system for:

- Small Mario
- Super Mario
- Fire Mario

### Super Mushroom

- Emerges from question blocks.
- Moves along the ground.
- Reverses direction when encountering obstacles.
- Can fall off platforms.
- Transforms Small Mario into Super Mario upon collection.

### Fire Flower

- Appears in appropriate blocks when Mario is already Super Mario.
- Transforms Super Mario into Fire Mario.
- Allows Mario to shoot fireballs.

### Fireballs

- Spawn in Mario's facing direction.
- Travel horizontally.
- Bounce along the ground.
- Collide with walls and enemies.
- Defeat eligible enemies.
- Support a limited number of active fireballs.

### Super Star

- Grants temporary invincibility.
- Causes Mario to flash or cycle colors.
- Defeats enemies on contact.
- Plays a special temporary music theme.
- Reverts to the normal state when the timer expires.

### Damage mechanics

- Small Mario dies from enemy contact.
- Super/Fire Mario shrinks when damaged.
- Provide temporary invulnerability after shrinking.
- Animate damage and transformation.
- Falling into pits causes death.
- Decrement lives and restart the level when appropriate.

## 10. Game State and Progression

Implement a proper game state machine.

States should include:

```typescript
enum GameState {
  TITLE,
  LEVEL_INTRO,
  PLAYING,
  PAUSED,
  PLAYER_DYING,
  LEVEL_COMPLETE,
  GAME_OVER,
  VICTORY
}
```

Track:

- Score
- Coins
- Lives
- Current world and level
- Player power-up state
- Remaining level time
- Completed levels

### Time system

- Each level has a countdown timer.
- Time decreases during active gameplay.
- Running out of time kills Mario.
- Completing a level converts remaining time into bonus points.

### Death and respawn

When Mario dies:

1. Play the death animation and sound.
2. Stop regular enemy/game updates.
3. Decrement the life counter.
4. Show the appropriate transition.
5. Restart the level if lives remain.
6. Show Game Over if no lives remain.

### Flagpole sequence

When Mario touches the flagpole:

1. Disable regular controls.
2. Animate Mario sliding down.
3. Award score based on flagpole contact height.
4. Move Mario toward the castle.
5. Play the level completion sequence.
6. Convert remaining time to score.
7. Load the next level.

## 11. Audio

Create an 8-bit-inspired audio system using the Web Audio API or locally provided audio assets.

Include sound effects for:

- Jump
- Coin collection
- Block bump
- Brick break
- Power-up emergence
- Power-up collection
- Enemy stomp
- Shell kick
- Fireball
- Player damage
- Player death
- Extra life
- Flagpole
- Level completion

Add looping chiptune music for:

- Overworld
- Underground
- Castle
- Invincibility

If original game music cannot be provided, compose short original chiptune tracks that capture the same energetic retro aesthetic.

Audio should start only after an appropriate user interaction to comply with browser autoplay restrictions.

Include a mute/unmute button.

## 12. User Interface

Build a polished browser interface surrounding the game.

### Layout

- Center the game canvas.
- Use a dark background outside the play area.
- Preserve the NES aspect ratio.
- Add a subtle retro border around the screen.
- Display the game title above or within the interface.
- Provide minimal on-screen instructions.
- Include a fullscreen option.
- Include mute/unmute controls.

### Responsive design

- Support modern desktop browsers.
- Scale proportionally based on available viewport dimensions.
- Maintain crisp pixel rendering.
- Do not allow the surrounding UI to interfere with keyboard controls.

### Optional mobile controls

If practical, add touch controls:

- Left button
- Right button
- Jump button
- Run/fire button

Ensure simultaneous touch inputs are supported.

## 13. Architecture

Organize the TypeScript project cleanly.

Suggested structure:

```text
src/
├── main.ts
├── core/
│   ├── Game.ts
│   ├── GameLoop.ts
│   ├── Renderer.ts
│   ├── Camera.ts
│   ├── InputManager.ts
│   ├── AudioManager.ts
│   └── GameState.ts
├── entities/
│   ├── Entity.ts
│   ├── Player.ts
│   ├── Enemy.ts
│   ├── Goomba.ts
│   ├── Koopa.ts
│   ├── PiranhaPlant.ts
│   ├── Bowser.ts
│   ├── Mushroom.ts
│   ├── FireFlower.ts
│   ├── Fireball.ts
│   └── Coin.ts
├── physics/
│   ├── Physics.ts
│   ├── Collision.ts
│   └── Constants.ts
├── world/
│   ├── TileMap.ts
│   ├── TileTypes.ts
│   ├── Level.ts
│   ├── LevelLoader.ts
│   └── LevelManager.ts
├── levels/
│   ├── world1-1.ts
│   ├── world1-2.ts
│   ├── world1-3.ts
│   └── world1-4.ts
├── graphics/
│   ├── SpriteManager.ts
│   ├── SpriteAnimator.ts
│   └── PixelArt.ts
├── ui/
│   ├── HUD.ts
│   ├── TitleScreen.ts
│   ├── PauseMenu.ts
│   └── GameOverScreen.ts
└── styles/
    └── main.css
```

Adjust the structure if a simpler architecture provides better maintainability.

### Code quality

- Use TypeScript strict mode.
- Avoid `any` unless genuinely necessary.
- Use constants for physics tuning.
- Avoid giant monolithic files.
- Separate rendering, physics, and input logic.
- Avoid unnecessary abstractions.
- Keep the engine extensible for new worlds, enemies, and power-ups.

## 14. Gameplay Polish

Add details that make the game feel authentic:

- Slight block-bump animations.
- Animated question blocks.
- Animated coins.
- Running animation with variable speed.
- Smooth camera scrolling.
- Mario's distinct skidding animation.
- Particle debris from broken bricks.
- Stomp-bounce effects.
- Enemy defeat animations.
- Power-up emergence animations.
- Player flashing during temporary invulnerability.
- Star-power visual effects.
- Screen transitions with NES-style timing.
- Pipe entry/exit animation.
- Flagpole celebration.

Prioritize responsive gameplay over unnecessary visual effects.

## 15. Testing and Debugging

Verify that:

- Mario cannot pass through solid tiles.
- Mario can jump under and hit blocks reliably.
- Small Mario and Super Mario have correct hitbox behavior.
- Mario can jump onto pipes.
- Enemies walk and collide correctly.
- Goombas can be stomped.
- Koopas turn into kickable shells.
- Question blocks only activate as intended.
- Mushrooms move and can be collected.
- Fireballs collide properly.
- The camera scrolls correctly.
- Mario dies when falling into a bottomless pit.
- Lives and score update correctly.
- Level timer pauses when gameplay is paused.
- Flagpole completion properly advances to the next level.
- Restarting a level resets its entities and interactive blocks.
- Restarting or transitioning levels does not duplicate event handlers.
- The game remains playable at different browser window sizes.

Use browser testing or automated tests where available. Fix errors found during development rather than merely describing them.

## 16. Implementation Priorities

Build the game in working stages.

### Phase 1 — Core playable prototype

- Canvas setup
- Main game loop
- Input handling
- Mario rendering
- Movement and jumping physics
- Tile map
- Solid collisions
- Camera scrolling
- Basic World 1-1 geometry

The result must be immediately playable.

### Phase 2 — Core Mario gameplay

- Goombas
- Koopas
- Question blocks
- Bricks
- Coins
- Mushrooms
- Super Mario
- Damage and death
- HUD

### Phase 3 — Complete World 1-1

- Full level layout
- Underground bonus area
- Pipes
- Hidden blocks
- Flagpole sequence
- Scoring
- Level transitions
- Sound effects

### Phase 4 — Additional levels

- World 1-2
- World 1-3
- World 1-4
- Bowser encounter
- World progression

### Phase 5 — Polish

- Refined sprite animations
- Music
- Menu screens
- Visual effects
- Responsive UI
- Bug fixes
- Performance optimization

**Finish and verify each phase before introducing the next phase.**

## 17. Important Constraints

1. This should be a fully playable game, not a static visual mockup.
2. Use real physics and collision systems, not scripted character movement.
3. Avoid placeholder rectangles in the finished product; use actual pixel-art sprites.
4. Keep rendering crisp and pixelated.
5. Prioritize World 1-1 quality before adding more content.
6. Preserve the original game's overall visual proportions and movement feel.
7. Do not depend on externally hosted sprites or assets.
8. Do not leave important functionality as TODO comments or nonfunctional buttons.
9. Keep the code modular and maintainable.
10. If a feature is too large to implement completely, deliver a smaller fully functional feature set instead of partially implemented systems.
11. Use original or appropriately licensed assets when necessary; do not assume that NES graphics and audio are public domain.
12. The game should run without a backend or external API.

## 18. Acceptance Criteria

The project is successful when I can:

1. Open the game in a browser.
2. See a convincing retro Mario title screen.
3. Press Enter to start World 1-1.
4. Run, jump, accelerate, and skid naturally.
5. Navigate a scrolling level using keyboard controls.
6. Stomp Goombas and interact with Koopas.
7. Hit question blocks to spawn coins and mushrooms.
8. Collect a mushroom and transform into Super Mario.
9. Break bricks while powered up.
10. Enter and exit an underground bonus area.
11. Reach the flagpole and complete the level.
12. Advance to World 1-2.
13. Lose lives, die, respawn, and eventually reach Game Over.
14. Play continuously without major physics or collision bugs.

## Final Instructions

**Start implementing the actual game immediately.**

Do not stop after writing a development plan or architecture description. Create the complete project files and working implementation.

Focus on a high-quality, fully playable World 1-1 first, followed by the remaining World 1 levels.

Make reasonable implementation decisions independently rather than asking for clarification about minor details.

Before finishing, run the application, inspect the gameplay if browser tools are available, address TypeScript errors, and verify that the main gameplay mechanics work.

The final result should feel like playing the original 8-bit Super Mario Bros. in a modern web browser.