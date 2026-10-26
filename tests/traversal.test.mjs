import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Game,GameState} from '../src/core/Game.ts';
// Recorded controller inputs, 16 simulation frames per action. No coordinate changes,
// invulnerability, skipped collisions, or disabled enemies during traversal.
const actions=[['right','run','jump'],['right','run'],['jump'],[],['left','run','jump'],['left','run'],['down']];
for(const id of ['1-1','1-2','1-3','1-4'])test(`continuous input replay clears ${id} with real collisions and enemies`,()=>{
 const g=new Game();g.load(id);g.state=GameState.PLAYING;g.levelIndex=['1-1','1-2','1-3','1-4'].indexOf(id);
 const route=JSON.parse(fs.readFileSync(`tests/fixtures/mario-route-${id}.json`,'utf8'));
 for(const action of route){for(const key of ['left','right','jump','run','down'])g.input.set(key,key,actions[action].includes(key));for(let i=0;i<16;i++){g.update();assert.notEqual(g.state,GameState.PLAYER_DYING);if(g.state===GameState.LEVEL_COMPLETE)break;}if(g.state===GameState.LEVEL_COMPLETE)break;}
 assert.equal(g.state,GameState.LEVEL_COMPLETE);assert.equal(g.lives,5);
});
