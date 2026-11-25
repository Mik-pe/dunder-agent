import assert from "node:assert/strict";
import {readTable} from "./csv.mjs";
assert.deepEqual(readTable(['name,note\r','\nAda,"li','ne1\nline2"\r\n']),[["name","note"],["Ada","line1\nline2"]]);
