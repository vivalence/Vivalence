// every bound the reader answers to, in one place. `extract` needs `chars` and nothing else —
// reading it from `hop.js` would drag the network module into the graph of a pure function.
export const LIMITS = {
  hops: 5,
  timeout: 15_000,
  bytes: 2_000_000,
  chars: 24_000,
  images: 12,
};
