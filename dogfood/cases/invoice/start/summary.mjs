import {lineTotal} from "./money.mjs";
export function summary(lines) {
  return lines.reduce((s,line)=>s+lineTotal(line),0);
}
