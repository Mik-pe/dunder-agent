import assert from "node:assert/strict";
import {schedule} from "./jobs.mjs";
const j=(id,...after)=>Object.freeze({id,after:Object.freeze(after)});
assert.deepEqual(schedule(Object.freeze([j("z","b","a","b"),j("a"),j("q","b"),j("b"),j("r")])),["a","b","z","q","r"]);
assert.deepEqual(schedule([]),[]);
assert.throws(()=>schedule([j("a"),j("a")]),/duplicate/i);
assert.throws(()=>schedule([j("a","b"),j("b","a"),j("c","x")]),/missing/i);
assert.throws(()=>schedule([j("a","a")]),/cycle/i);
