import assert from "node:assert/strict";
import { page } from "./page.mjs";
const rows=[{time:1,id:"b"},{time:1,id:"a"},{time:2,id:"c"}];
const first=page(rows,{size:1});
assert.deepEqual(first,{items:[{time:1,id:"a"}],next:{time:1,id:"a"}});
assert.equal(page(rows,{size:1,after:first.next}).items[0].id,"b");
