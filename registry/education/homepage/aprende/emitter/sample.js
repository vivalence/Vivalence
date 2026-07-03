export const POOL_FACTOR = 1.4; // fetch this many × count of due, then weighted-sample down

// pool arrives weakness-ordered (weakest first); weight ∝ rank, so weak items
// surface more often but never identically — a soft spaced-repetition surrogate.
export function weightedSample(pool, count) {
  const bag = pool.map((literal, index) => ({ literal, weight: pool.length - index }));
  const chosen = [];
  while (chosen.length < count && bag.length) {
    const total = bag.reduce((sum, entry) => sum + entry.weight, 0);
    let threshold = Math.random() * total;
    let index = 0;
    while (threshold > bag[index].weight) {
      threshold -= bag[index].weight;
      index += 1;
    }
    chosen.push(bag.splice(index, 1)[0].literal);
  }
  return chosen;
}
