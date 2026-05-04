// @beef maybe inline into pool?
export const Condition = Object.freeze({
  NOMINAL: "NOMINAL",
  EXHAUSTED: "EXHAUSTED",
  ERROR: "ERROR",
});

export const Yield = Object.freeze({
  NOMINAL: (buffers, meta) => ({ condition: "NOMINAL", buffers, ...meta }),
  EXHAUSTED: (meta) => ({ condition: "EXHAUSTED", buffers: [], ...meta }),
  ERROR: (error, meta) => ({ condition: "ERROR", buffers: [], error, ...meta }),
});
