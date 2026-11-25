export class Ledger {
  constructor() { this.balance = new Map(); this.seen = new Set(); }
  apply(batch) {
    for (const { account, id, cents } of batch) {
      if (!Number.isSafeInteger(cents)) throw new TypeError("cents");
      if (this.seen.has(id)) continue;
      this.balance.set(account, (this.balance.get(account) ?? 0) + cents);
      this.seen.add(id);
    }
  }
  total(account) { return this.balance.get(account) ?? 0; }
}
