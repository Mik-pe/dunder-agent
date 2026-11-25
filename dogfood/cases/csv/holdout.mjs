import assert from "node:assert/strict";
import {readTable} from "./csv.mjs";
const data='a,"b""c",\r\n\r\n"d\r\ne",f,';
const wanted=[["a",'b"c',""],[""],["d\r\ne","f",""]];
for(let i=0;i<=data.length;i++) assert.deepEqual(readTable([data.slice(0,i),"",data.slice(i)]),wanted);
assert.deepEqual(readTable([...data]),wanted);
assert.deepEqual(readTable([]),[]);assert.deepEqual(readTable([",\r"]),[["",""]]);
for(const bad of ['x"y','"x"z','"x']) assert.throws(()=>readTable([bad]),SyntaxError);
