import assert from "node:assert/strict";
import {lineTotal} from "./money.mjs";import {summary} from "./summary.mjs";
const l=(currency,cents,quantity=1,discountBps=0)=>({currency,cents,quantity,discountBps});
assert.equal(lineTotal(l("X",-5,1,1000)),-5);assert.equal(lineTotal(l("X",9007199254740991,2,5000)),9007199254740991);
assert.deepEqual(summary([l("USD",5,1,1000),l("EUR",7,0),l("USD",-5,1,1000)]),[{currency:"EUR",cents:0},{currency:"USD",cents:0}]);
for(const v of [l("X",1,-1),l("X",0.1),l("X",2,1,10001),l("X",2,1,1.5),l("X",Number.MAX_SAFE_INTEGER,2)]) assert.throws(()=>lineTotal(v));
assert.throws(()=>summary([l("X",Number.MAX_SAFE_INTEGER),l("X",1)]));
