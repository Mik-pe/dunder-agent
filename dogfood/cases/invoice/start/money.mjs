export function lineTotal({cents, quantity, discountBps = 0}) {
  return cents * quantity - Math.round(cents * quantity * discountBps / 10000);
}
