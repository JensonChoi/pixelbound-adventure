// Development route authoring: searches ordinary input sequences against the real simulation.
// The resulting fixture is replayed independently by tests; no gameplay state is patched.
import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
await build({ entryPoints: ['scripts/route-search.ts'], outfile: '.test-build/route-search.mjs', bundle: true, platform: 'node', format: 'esm' });
const result = spawnSync(process.execPath, ['.test-build/route-search.mjs', ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(result.status ?? 1);
