import { build } from 'esbuild';
import { writeFile, mkdir } from 'node:fs/promises';
const result=await build({entryPoints:['src/main.ts'],bundle:true,format:'iife',write:false,outdir:'dist',minify:true});
const js=result.outputFiles.find(f=>f.path.endsWith('.js')).text;
const css=result.outputFiles.find(f=>f.path.endsWith('.css')).text;
await mkdir('dist',{recursive:true});
await writeFile('dist/play.html',`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Super Mario Bros. — The 8-bit Arcade</title><style>${css}</style></head><body><div id="app"></div><script>${js.replaceAll('</script','<\\/script')}</script></body></html>`);
console.log('Standalone offline game: dist/play.html');
