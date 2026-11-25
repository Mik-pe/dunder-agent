import assert from "node:assert/strict";
import {schedule} from "./jobs.mjs";
assert.deepEqual(schedule([{id:"build",after:["gen"]},{id:"gen",after:[]},{id:"lint",after:[]}]),["gen","build","lint"]);
