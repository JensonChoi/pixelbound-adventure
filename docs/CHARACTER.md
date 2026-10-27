# Super Mario Bros. — Character Selection and Castle Rescue Sequences

## Project Context

You have already implemented a web-based recreation of the original 1985 NES Super Mario Bros. using HTML, CSS, TypeScript, and the Canvas 2D API.

The existing game includes:

- Eight worlds containing 32 playable levels.
- Mario's movement, jumping, running, and collision mechanics.
- Enemies, power-ups, interactive blocks, and collectibles.
- Castle levels with Bowser encounters.
- Secret warp zones in Worlds 1-2 and 4-2.
- World progression, player lives, scoring, and level transitions.
- An 8-bit visual presentation.

I now want to expand the game with three features:

1. **Playable Luigi:** Add an option to select Luigi instead of Mario before starting a new game.
2. **Toad Rescue Scenes:** At the end of each castle in Worlds 1–7, Mario or Luigi rescues Toad, who explains that Princess Peach is in another castle.
3. **Princess Peach Rescue:** At the end of World 8-4, the selected character finally rescues Princess Peach, triggering a special ending sequence.

This is an update to the existing project, NOT a rebuild.

**Inspect the current codebase before making changes. Preserve the existing engine, all 32 levels, level geometry, warp zones, enemy interactions, and game progression.**

---

# PART I — PLAYABLE CHARACTER SELECTION

## 1. Add Luigi as a Playable Character

Implement Luigi as a fully playable character alongside Mario.

Both characters must be able to:

- Walk and run.
- Jump and skid.
- Crouch.
- Enter pipes.
- Swim underwater.
- Stomp enemies.
- Collect coins.
- Use mushrooms, fire flowers, and stars.
- Break bricks.
- Shoot fireballs.
- Climb vines.
- Complete all 32 levels.
- Use the secret warp zones.
- Defeat Bowser.
- Rescue Toad and Princess Peach.

The selected character must be used consistently throughout the entire game.

### Character appearance

**Mario:**
- Red hat.
- Red shirt.
- Brown or blue overall detailing, consistent with the existing NES sprites.
- Original 8-bit Mario proportions.

**Luigi:**
- Green-and-white 8-bit color palette based on the original NES Luigi.
- The same overall sprite dimensions and proportions as Mario.
- Green and white coloring adapted to the existing sprite system.

For this update, prioritize the original 1985 NES appearance rather than Luigi's later taller and thinner appearance.

Luigi should be immediately distinguishable from Mario through his sprite colors.

## 2. Luigi Animations

Luigi must have working animations for:

- Idle.
- Walking.
- Running.
- Jumping.
- Falling.
- Skidding.
- Crouching as Super Luigi.
- Swimming.
- Climbing vines.
- Throwing fireballs.
- Taking damage.
- Dying.
- Entering pipes.
- Sliding down flagpoles.
- Castle completion.
- Rescuing Toad.
- Rescuing Princess Peach.

Reuse Mario's animation logic whenever possible.

Prefer creating Luigi's sprites through palette swaps or shared animation frames rather than duplicating the entire player rendering implementation.

## 3. Character Physics

Luigi should initially use **the exact same movement physics as Mario**, consistent with the original NES Super Mario Bros.

Both characters should share:

- Walking speed.
- Running speed.
- Ground acceleration.
- Friction.
- Jump velocity.
- Gravity.
- Air control.
- Collision hitboxes.
- Power-up behavior.

Do not automatically give Luigi a higher jump, lower traction, or slower movement.

Those differences belong to later Mario games and are not required for this 1985 NES recreation.

The two characters should differ visually, but gameplay balance should remain identical.

## 4. Character Selection Menu

Modify the existing title screen to allow the player to choose between Mario and Luigi before starting a new game.

The menu should resemble the original NES game's minimalist 8-bit styling.

Example:

```text
        SUPER MARIO BROS.

          1 PLAYER GAME

          SELECT PLAYER

          > MARIO
            LUIGI

          PRESS ENTER TO START
```

### Menu controls

- Up Arrow / W: Move selection upward.
- Down Arrow / S: Move selection downward.
- Enter: Confirm selection and begin.
- Optional: Allow clicking the menu options.

### Selection behavior

- Mario is selected by default.
- The current selection should be highlighted with a classic NES-style cursor or arrow.
- A small preview sprite of the selected character may appear beside the menu.
- Changing the selected character should update the preview immediately.
- Pressing Enter should begin a new game as the selected character.
- Once the game begins, character selection should be locked for that run.

Returning to the title screen should allow the player to select a different character.

### Important

This is NOT a two-player mode.

Only one character is active at a time.

Do not add multiplayer, split-screen gameplay, or simultaneous Mario/Luigi controls.

---

# PART II — PLAYER CHARACTER ARCHITECTURE

## 5. Shared Player System

Do not duplicate the existing Player class.

Instead, extend the player system to support multiple character identities.

Suggested TypeScript design:

```typescript
type CharacterId = "mario" | "luigi";

interface CharacterDefinition {
  id: CharacterId;
  displayName: string;
  spritePalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface PlayerSession {
  selectedCharacter: CharacterId;
}
```

Adapt these structures to the existing codebase.

The existing Player class should continue handling:

- Movement.
- Physics.
- Collision detection.
- Power-ups.
- Health/damage.
- Animation state.
- Input.
- Interaction with world objects.

The character definition should control visual identity.

### Recommended design

```typescript
const CHARACTERS = {
  mario: {
    id: "mario",
    displayName: "MARIO"
  },
  luigi: {
    id: "luigi",
    displayName: "LUIGI"
  }
} as const;
```

These definitions may be extended with palette and sprite information.

### State preservation

Character identity must persist through:

- Normal level completion.
- Castle completion.
- Death and respawn.
- Power-up transitions.
- Pipe travel.
- World 1-2 warp zones.
- World 4-2 warp zones.
- Game pause/resume.
- The final Princess Peach rescue.

Avoid creating a new default Mario instance whenever a level loads.

Every new level should use the character selected at the title screen.

---

# PART III — TOAD RESCUE SCENES

## 6. Castle Rescue Requirements

At the end of every castle except World 8-4, show Toad waiting in the castle's final room.

The affected levels are:

- World 1-4.
- World 2-4.
- World 3-4.
- World 4-4.
- World 5-4.
- World 6-4.
- World 7-4.

In the original game, Mario defeats Bowser, crosses the bridge, and reaches a character who reveals that Princess Peach is somewhere else.

Recreate this recognizable sequence.

### Required gameplay sequence

When the player reaches Bowser's bridge:

1. Mario or Luigi approaches Bowser.
2. The player reaches the axe at the end of the bridge.
3. The axe activates the bridge-collapse sequence.
4. Bowser falls into the lava.
5. The player moves into the castle's final chamber.
6. Toad is visible standing on the floor.
7. The player approaches Toad.
8. The game displays Toad's message.
9. The game pauses regular gameplay while the message is shown.
10. After a brief delay or player confirmation, the game advances to the next world.

The player must be able to see Toad as an actual sprite standing in the castle.

Do not replace Toad with a simple text-only completion screen.

## 7. Toad Visual Design

Implement an 8-bit Toad sprite inspired by the original Super Mario Bros.

### Appearance

- White mushroom cap.
- Red spots on the cap.
- Small face.
- Light-colored body.
- Blue or purple vest-like torso details where consistent with the selected palette.
- Compact proportions appropriate for the original game's sprite resolution.

Use crisp pixel-art rendering without antialiasing.

The sprite should match the overall visual scale of Mario and the castle environment.

### Animations

Implement at least:

- Idle pose.
- Simple celebratory animation.
- Optional brief bounce or arm movement.

Toad should remain in the castle room and should not behave like an enemy.

Toad must not:

- Take damage.
- Fall through the floor.
- Block the player unexpectedly.
- Move around the map.
- Trigger enemy collision logic.

## 8. Toad Dialogue

When the player reaches Toad, display the iconic original-style message:

**"THANK YOU MARIO!"**

**"BUT OUR PRINCESS IS IN ANOTHER CASTLE!"**

If Luigi is selected, replace the name dynamically:

**"THANK YOU LUIGI!"**

**"BUT OUR PRINCESS IS IN ANOTHER CASTLE!"**

### Text styling

- White pixel font.
- All capital letters.
- Black castle background.
- Center-aligned text.
- Consistent NES visual style.
- No modern speech bubbles or dialogue boxes.

Example:

```text
        THANK YOU MARIO!

       BUT OUR PRINCESS IS
       IN ANOTHER CASTLE!
```

For Luigi:

```text
        THANK YOU LUIGI!

       BUT OUR PRINCESS IS
       IN ANOTHER CASTLE!
```

### Dynamic dialogue

Never hardcode "MARIO" in the actual dialogue rendering.

Read the selected player's display name from the shared character state.

Use a reusable dialogue system that can render different messages for Toad and Princess Peach.

## 9. Rescue Scene Behavior

During the Toad rescue sequence:

- Disable normal player controls.
- Stop enemy updates or ensure no enemies can interrupt the scene.
- Disable player damage.
- Stop the regular countdown timer.
- Keep the rescued Toad visible.
- Display the dialogue cleanly.
- Play a short retro completion sound.
- Wait approximately 3–5 seconds, or allow the player to continue using Enter.

After the scene, advance to the next world's first level.

### Important level progression

| Castle completed | Next level |
|---|---|
| 1-4 | 2-1 |
| 2-4 | 3-1 |
| 3-4 | 4-1 |
| 4-4 | 5-1 |
| 5-4 | 6-1 |
| 6-4 | 7-1 |
| 7-4 | 8-1 |

Do not accidentally reload the castle after the rescue scene.

Do not route these endings through a generic flagpole animation.

The rescue sequence must be part of the actual castle completion logic.

---

# PART IV — PRINCESS PEACH RESCUE

## 10. Final Castle — World 8-4

At the end of World 8-4, the player should finally rescue Princess Peach.

This must be a special ending, visually and logically distinct from the seven Toad rescue sequences.

### Required sequence

1. Mario or Luigi navigates the final castle.
2. The player encounters the final Bowser.
3. The player defeats Bowser through the existing castle mechanics.
4. Bowser falls into the lava or otherwise completes his defeat animation.
5. The player enters the final castle chamber.
6. Princess Peach is visible waiting inside the chamber.
7. The player approaches Princess Peach.
8. Princess Peach displays a thank-you message.
9. A special victory sound plays.
10. The game transitions to the final victory screen.

The sequence should feel like a satisfying ending to the entire eight-world adventure.

## 11. Princess Peach Sprite

Create a recognizable 8-bit Princess Peach sprite inspired by the original NES game.

### Appearance

- Small golden crown.
- Blonde or yellow hair.
- Pink or light-colored dress, depending on the NES palette.
- Pixel-art facial features.
- Approximately human-sized relative to Super Mario.
- Authentic early NES proportions.

Do not use modern high-resolution character artwork.

The sprite must match the pixel density and visual style of the existing game.

### Peach animations

Implement:

- Idle standing pose.
- Optional simple celebration pose.
- Small celebratory movement when the player approaches.

Peach should remain stationary during the initial rescue sequence.

Do not create combat behavior, collision damage, or autonomous wandering.

## 12. Princess Peach Dialogue

The ending should recognize the selected playable character.

For Mario:

```text
        THANK YOU MARIO!

      YOUR QUEST IS OVER.

      WE PRESENT YOU A
      NEW QUEST.

      PRESS ENTER TO CONTINUE
```

For Luigi:

```text
        THANK YOU LUIGI!

      YOUR QUEST IS OVER.

      WE PRESENT YOU A
      NEW QUEST.

      PRESS ENTER TO CONTINUE
```

These messages are intended to evoke the original NES ending.

If a second quest or harder mode is not already implemented, do not suggest that a new quest is immediately playable.

Instead, use:

```text
        THANK YOU MARIO!

      YOUR QUEST IS OVER.

      YOU SAVED THE PRINCESS!

      PRESS ENTER TO CONTINUE
```

Replace "MARIO" with "LUIGI" dynamically.

### Victory behavior

After Princess Peach's dialogue:

- Transition into the existing victory state.
- Display the selected character's name.
- Show the player's final score.
- Play a short victory fanfare.
- Allow returning to the title screen.
- Optionally allow starting a new game.

Do not automatically reset the game as soon as Peach appears.

Allow enough time for the player to appreciate the rescue.

---

# PART V — CASTLE ENDING SYSTEM

## 13. Unified Castle Completion Architecture

Implement a reusable castle-ending system rather than writing separate completion logic for all eight castles.

Suggested structure:

```typescript
type RescueCharacter = "toad" | "peach";

interface CastleEndingConfig {
  world: number;
  levelId: string;
  rescueCharacter: RescueCharacter;
  nextLevel?: string;
  isFinalCastle: boolean;
}
```

Example:

```typescript
const castleEndings: CastleEndingConfig[] = [
  {
    world: 1,
    levelId: "1-4",
    rescueCharacter: "toad",
    nextLevel: "2-1",
    isFinalCastle: false
  },
  {
    world: 8,
    levelId: "8-4",
    rescueCharacter: "peach",
    isFinalCastle: true
  }
];
```

Create equivalent configurations for Worlds 2–7.

### Castle state machine

Use explicit states where appropriate:

```typescript
enum CastleEndingState {
  NONE,
  BOWSER_DEFEATED,
  BRIDGE_COLLAPSING,
  WALKING_TO_RESCUE,
  RESCUE_DIALOGUE,
  TRANSITIONING
}
```

Integrate these states with the game's existing state system rather than introducing conflicting state machines.

### State safety

Ensure:

- A castle ending activates only once.
- Bowser's defeat cannot trigger duplicate transitions.
- The rescue sequence does not start before the castle's intended completion condition.
- The camera remains focused on the final chamber.
- Player death cannot occur during the rescue sequence.
- Dialogue does not restart every frame.
- The selected character persists after the scene.
- The correct next level loads.
- World 8-4 transitions to final victory instead of World 9-1.

---

# PART VI — HUD AND UI UPDATES

## 14. Dynamic Player Name

Update the HUD so it displays the selected character's name.

Mario example:

```text
MARIO         WORLD        TIME
015200         3-1          386
```

Luigi example:

```text
LUIGI         WORLD        TIME
015200         3-1          386
```

Character name changes must also apply to:

- Game Over screens.
- Level intro screens, if they display the player name.
- Victory screens.
- Rescue dialogue.
- Any other UI components that currently hardcode Mario's name.

Do not change the original score, time, or world display behavior unnecessarily.

## 15. Power-Up Sprites

Support both characters in all power-up states.

### Small Mario / Small Luigi

Use each character's normal 8-bit color palette.

### Super Mario / Super Luigi

Use larger sprites while preserving each character's identity.

### Fire Mario / Fire Luigi

Create appropriate Fire-state palettes.

Ensure Luigi remains visually distinguishable from Mario when powered up.

### Star power

Preserve the existing flashing palette effect.

Character identity should return correctly after star invincibility ends.

---

# PART VII — TESTING AND ACCEPTANCE

## 16. Character Selection Tests

Verify the following:

1. Title screen displays Mario and Luigi.
2. Mario is selected by default.
3. Up/Down changes selection.
4. Selecting Luigi starts the game as Luigi.
5. Luigi uses green-themed 8-bit sprites.
6. Luigi's movement physics match Mario's.
7. Luigi can collect mushrooms and fire flowers.
8. Luigi can enter pipes and climb vines.
9. Luigi can use warp zones.
10. Luigi remains selected after dying and respawning.
11. Luigi remains selected after world transitions.
12. Luigi's name appears correctly in the HUD.
13. Returning to the title screen allows changing characters.

## 17. Toad Rescue Tests

Test each castle individually:

- 1-4
- 2-4
- 3-4
- 4-4
- 5-4
- 6-4
- 7-4

For each castle, verify:

- Toad is visible after Bowser is defeated.
- Toad is drawn at the correct size.
- Dialogue displays correctly.
- Mario receives the Mario dialogue.
- Luigi receives the Luigi dialogue.
- Enemy damage is disabled during the scene.
- The scene cannot trigger multiple times.
- The game advances to the correct next world.
- Player progress is preserved.

## 18. Princess Peach Rescue Tests

Test World 8-4 with both characters.

### Mario

- Mario defeats final Bowser.
- Mario reaches Peach.
- Peach thanks Mario.
- Victory sequence plays.
- Game displays correct final score.

### Luigi

- Luigi defeats final Bowser.
- Luigi reaches Peach.
- Peach thanks Luigi.
- Victory sequence plays.
- Game displays correct final score.

Make sure Peach never appears as the rescue character in Worlds 1–7.

Make sure Toad never replaces Peach in World 8-4.

## 19. Regression Tests

Verify all previously implemented features continue working:

- All 32 levels load.
- Mario's original controls work.
- Level scrolling works.
- Enemy collisions work.
- Power-ups function correctly.
- Warp zones remain accessible.
- World 1-2 warp pipes lead to Worlds 4, 3, and 2.
- World 4-2 warp pipes lead to Worlds 5, 6, 7, and 8.
- Bowser can still be defeated.
- Normal level progression remains functional.
- Death and Game Over work.
- No new TypeScript or runtime errors are introduced.

---

# PART VIII — IMPLEMENTATION PLAN

## Phase 1 — Character Selection

- Inspect the existing Player and title-screen implementations.
- Introduce a shared character identity system.
- Add the Mario/Luigi selection menu.
- Create Luigi's sprite palettes and animations.
- Update HUD names.
- Verify character identity persists through the game.

## Phase 2 — Toad

- Add an 8-bit Toad sprite.
- Create the rescue chamber and interaction trigger.
- Integrate with Bowser defeat logic.
- Add dynamic dialogue.
- Implement rescue scenes for Worlds 1–7.
- Verify world advancement.

## Phase 3 — Princess Peach

- Add an 8-bit Peach sprite.
- Modify World 8-4's final chamber.
- Implement the final rescue scene.
- Add dynamic Mario/Luigi dialogue.
- Implement the victory sequence.

## Phase 4 — Polish and Verification

- Improve animations and sprite palettes.
- Add rescue sound effects.
- Check UI alignment.
- Verify camera behavior.
- Run TypeScript and production builds.
- Test all castle endings.
- Check for gameplay regressions.

---

# FINAL ACCEPTANCE CRITERIA

The update is complete when:

- [ ] Mario and Luigi are both selectable on the title screen.
- [ ] Only one character is controlled in a playthrough.
- [ ] Luigi has distinct green-themed sprites and animations.
- [ ] Luigi has the same physics and abilities as Mario.
- [ ] HUD and dialogue use the selected character's name.
- [ ] Toad appears at the end of castles 1-4 through 7-4.
- [ ] Toad tells the player that Princess Peach is in another castle.
- [ ] Toad rescue scenes correctly advance to the next world.
- [ ] Princess Peach appears at the end of World 8-4.
- [ ] Peach thanks Mario or Luigi appropriately.
- [ ] Rescuing Peach triggers the final victory sequence.
- [ ] Existing 32 levels and warp zones continue working.
- [ ] No major rendering, gameplay, or progression bugs are introduced.

## Final Instructions

Start by examining the current project structure and the existing Player, Sprite, TitleScreen, Castle, and GameState implementations.

Reuse existing classes and components wherever practical.

**Do not rebuild the game. Extend the existing implementation.**

Prioritize functional gameplay and faithful NES-style presentation.

Complete the character selection feature first, then the Toad rescue sequences, and finally the Princess Peach ending.

Visual references are available in visual_references/.

Implement actual working code, not only design documents or a proposed architecture.

Run the application and verify the new behavior where testing tools are available.

The completed game should feel like an expanded single-player version of the original 1985 Super Mario Bros., where the player can choose either Mario or Luigi and eventually rescue Princess Peach.