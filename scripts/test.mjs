import { build } from 'esbuild';
import { mkdir, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
await mkdir('.test-build', { recursive: true });
const entries=(await readdir('tests')).filter(f=>f.endsWith('.test.mjs')).map(f=>'tests/'+f);
await build({entryPoints:entries,outdir:'.test-build',bundle:true,platform:'node',format:'esm',outExtension:{'.js':'.mjs'},logLevel:'silent'});
const result=spawnSync(process.execPath,['--test',...entries.map(f=>f.replace('tests/','.test-build/'))],{stdio:'inherit'});
process.exit(result.status??1);
