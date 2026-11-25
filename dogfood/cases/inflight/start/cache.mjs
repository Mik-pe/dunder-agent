export function cache(load, ttl, now = Date.now) {
  const entries = new Map();
  return {
    async get(key) {
      const entry = entries.get(key);
      if (entry && now() < entry.until) return entry.value;
      const value = await load(key);
      entries.set(key, { value, until: now() + ttl });
      return value;
    },
    invalidate(key) { entries.delete(key); }
  };
}
