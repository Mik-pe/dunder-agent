export function writeSnapshot(items) {
  return JSON.stringify({version:1,names:items.map(x=>x.name)});
}
