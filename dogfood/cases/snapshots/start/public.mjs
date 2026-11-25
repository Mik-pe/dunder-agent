import assert from "node:assert/strict";
import {readSnapshot} from "./read.mjs"; import {writeSnapshot} from "./write.mjs";
const items=[{name:"one",pinned:true},{name:"one",pinned:false}];
assert.deepEqual(readSnapshot(writeSnapshot(items)),items);
assert.equal(JSON.parse(writeSnapshot(items)).version,2);
