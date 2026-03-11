import { array } from "./index.js";

export const retry =
  (fn, { attempts = 3, delay = 200, backoff = 2 } = {}) =>
  async (...args) => {
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn(...args);
      } catch (e) {
        if (i === attempts - 1) throw e;
        await new Promise((r) => setTimeout(r, delay * backoff ** i));
      }
    }
  };

export const resilient = async (
  thunks,
  { attempts = 3, delay = 200, backoff = 2, onEach } = {},
) => {
  const results = [];
  const failures = [];
  for (const [i, thunk] of thunks.entries()) {
    let lastError;
    for (let a = 0; a < attempts; a++) {
      try {
        results.push(await thunk());
        lastError = null;
        break;
      } catch (e) {
        // console.log("resilient error"); console.error(e);
        lastError = e;
        if (a < attempts - 1) await new Promise((r) => setTimeout(r, delay * backoff ** a));
      }
    }
    if (lastError) failures.push({ index: i, error: lastError });
    onEach?.(results.length + failures.length, thunks.length);
  }
  return { results, failures };
};

export const batched = async (thunks, size, { delay = 0, onChunk, afterChunk } = {}) => {
  const results = [];
  for (const chunk of array.chunk(thunks, size)) {
    results.push(...(await Promise.all(chunk.map((f) => f()))));
    await afterChunk?.();
    onChunk?.(results.length, thunks.length);
    if (delay) await new Promise((r) => setTimeout(r, delay));
  }
  return results;
};

export const linear = async (thunks, { onEach } = {}) => {
  const results = [];
  for (const thunk of thunks) {
    results.push(await thunk());
    onEach?.(results.length, thunks.length);
  }
  return results;
};
