import assert from "node:assert/strict";
import {Ledger} from "./ledger.mjs";
const l=new Ledger(); l.apply([{account:"a",id:"x",cents:2},{account:"b",id:"x",cents:5}]);
assert.equal(l.total("a"),2); assert.equal(l.total("b"),5);
