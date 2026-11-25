import assert from "node:assert/strict";
import {readSnapshot} from "./read.mjs"; import {writeSnapshot,exportNames} from "./write.mjs";
assert.deepEqual(readSnapshot('{"version":1,"names":["","a","a"]}'),["","a","a"].map(name=>({name,pinned:false})));
assert.deepEqual(readSnapshot('{"version":2,"items":[{"name":"x"}]}'),[{name:"x",pinned:false}]);
assert.throws(()=>readSnapshot('{"version":9,"names":[]}'));
const items=[{name:"β",pinned:true},{name:"--",pinned:false},{name:"A",pinned:true},{name:"A",pinned:true}];
assert.equal(exportNames(items),"β\nA\nA"); assert.equal(exportNames([]),"");
assert.deepEqual(readSnapshot(writeSnapshot(items)),items);
