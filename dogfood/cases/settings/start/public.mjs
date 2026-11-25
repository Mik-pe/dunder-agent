import assert from "node:assert/strict";
import { settings } from "./settings.mjs";
const d = { view: { size: 12, wrap: true } };
assert.deepEqual(settings(d, { view: { size: 20 } }, { view: { wrap: false } }),
  { view: { size: 20, wrap: false } });
