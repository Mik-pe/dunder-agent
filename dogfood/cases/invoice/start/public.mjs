import assert from "node:assert/strict";
import {lineTotal} from "./money.mjs";import {summary} from "./summary.mjs";
assert.equal(lineTotal({cents:5,quantity:1,discountBps:1000}),5);
assert.deepEqual(summary([{currency:"USD",cents:100,quantity:2}]),[{currency:"USD",cents:200}]);
