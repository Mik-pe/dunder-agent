export function readSnapshot(raw) {
  const data = JSON.parse(raw);
  return data.names.map(name => ({ name, pinned: false }));
}
