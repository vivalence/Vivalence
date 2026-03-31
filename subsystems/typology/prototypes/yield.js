export const Condition = Object.freeze({
  NOMINAL:   "NOMINAL",
  EXHAUSTED: "EXHAUSTED",
  ERROR:     "ERROR",
});

export const Yield = Object.freeze({
  NOMINAL:   (buffers, meta) => ({ condition: "NOMINAL", buffers, ...meta }),
  EXHAUSTED: (meta)          => ({ condition: "EXHAUSTED", buffers: [], ...meta }),
  ERROR:     (error, meta)   => ({ condition: "ERROR", buffers: [], error, ...meta }),
});

export function accumulator() {
  const state = { buffers: [], condition: null, meta: null, error: null };
  return {
    buffer(buf)        { state.buffers.push(buf); },
    exhaust(meta)      { state.condition = "EXHAUSTED"; state.meta = meta; },
    error(error, meta) { state.condition = "ERROR"; state.error = error; state.meta = meta; },
    nominal(meta)      { state.condition = "NOMINAL"; state.meta = meta; },
    resolve(returned) {
      if (returned != null && !returned.condition) {
        const extra = Array.isArray(returned) ? returned.flat() : [returned];
        state.buffers.push(...extra);
      }
      if (state.condition === "ERROR")     return Yield.ERROR(state.error, state.meta);
      if (state.condition === "EXHAUSTED") return Yield.EXHAUSTED(state.meta);
      if (!state.buffers.length)           return Yield.EXHAUSTED(state.meta);
      return Yield.NOMINAL(state.buffers, state.meta);
    },
    get used() { return state.buffers.length > 0 || state.condition !== null; },
  };
}
