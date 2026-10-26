# Repository Guidelines

## Project Structure & Module Organization

- `src/core/`: Game state, fixed-step loop, physics, keyboard input, and synthesized audio.
- `src/entities/`: Player state and shared entity contracts.
- `src/world/`: Tile helpers, level definitions, and World 1 progression.
- `src/graphics/`: Pixel sprites, bitmap lettering, and Canvas rendering.
- `src/main.ts` and `src/styles/`: Browser controls and responsive arcade interface.
- `tests/`: Gameplay tests and controller replays in `tests/fixtures/`.
- `scripts/`: Test bundling and standalone HTML generation. `visual_references/` contains design references, not bundled assets.

## Build, Test, and Development Commands

Use Node.js 22.12+ and npm:

- `npm install`: Install dependencies; commit intentional lockfile changes.
- `npm run dev`: Start the Vite development server.
- `npm run typecheck`: Check strict TypeScript without emitting files.
- `npm test`: Bundle tests with esbuild and run Node's built-in test runner.
- `npm run build`: Type-check and generate the Vite build plus offline `dist/play.html`.
- `npm run preview`: Serve the production build locally.

Do not commit generated `dist/`, `.test-build/`, or `node_modules/` files.

## Coding Style & Naming Conventions

Use strict TypeScript, four-space indentation in TypeScript modules, single quotes, and semicolons. Match surrounding style in existing CSS and test files; avoid unrelated formatting changes. Use PascalCase for classes/types, camelCase for functions/fields, and UPPER_SNAKE_CASE for constants. No formatter or linter is configured.

Keep simulation deterministic at 60 Hz and separate from rendering/audio. Put level geometry in data and physics tuning in `src/core/Physics.ts`. Use local original assets; avoid game engines and externally hosted resources.

## Testing Guidelines

Name tests `tests/*.test.mjs`; use descriptive behavior names and `node:assert/strict`. Add regression coverage for gameplay changes. Preserve full-course input replays; investigate failures before changing fixtures. No percentage coverage threshold is configured.

Run tests and the production build before submitting. For visual/input changes, inspect the browser at desktop and narrow widths and report any verification limits.

## Commit & Pull Request Guidelines

The repository has no commits yet, so no historical message convention exists. Use concise imperative subjects, such as “Move restart beside pause.” Keep commits focused.

PRs should explain behavior changes, link related issues when applicable, list validation commands/results, and include screenshots for visible changes. Preserve current defaults: five starting lives and restart through the page button, with no R shortcut.
