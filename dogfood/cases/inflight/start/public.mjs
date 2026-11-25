import assert from "node:assert/strict";
import { cache } from "./cache.mjs";
let calls=0;
const c=cache(async key=>{ calls++; return key; },25,()=>0);
assert.deepEqual(await Promise.all([c.get("a"),c.get("a")]),["a","a"]);
assert.equal(calls,1);
