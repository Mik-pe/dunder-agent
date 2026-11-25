export function page(records, { size, after = null }) {
  const ordered = records.sort((a, b) => a.time - b.time);
  const rest = ordered.filter(row => after === null || row.time > after);
  const items = rest.slice(0, size);
  return { items, next: items.length === size ? items.at(-1).time : null };
}
