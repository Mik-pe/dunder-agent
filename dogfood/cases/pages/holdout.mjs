import assert from "node:assert/strict";
import { page } from "./page.mjs";
const rows=Object.freeze([{time:4,id:"aa"},{time:3,id:"x"},{time:4,id:"A"},{time:5,id:"q"}]);
assert.deepEqual(page(rows,{size:2,after:{time:4,id:"B"}}),{items:[rows[0],rows[3]],next:null});
assert.deepEqual(page(rows,{size:1,after:4}),{items:[rows[3]],next:null});
assert.deepEqual(page(rows,{size:8,after:99}),{items:[],next:null});
for(const size of [0,-2,1.5]) assert.throws(()=>page(rows,{size}),RangeError);
assert.equal(rows[0].id,"aa");
