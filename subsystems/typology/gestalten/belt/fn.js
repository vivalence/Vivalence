export const once = (fn) => {
  let called = false;
  return function (...args) {
    if (called) return;
    called = true;
    return fn.apply(this, args);
  };
};

export const memo = (fn, key = JSON.stringify) => {
  const cache = new Map();
  return function (...args) {
    const at = key(args);
    if (!cache.has(at)) cache.set(at, fn.apply(this, args));
    return cache.get(at);
  };
};

export const every = (n, fn) => (done, total) =>
  (done % n === 0 || done === total) && fn(done, total);

export const debounce = (fn, ms = 0) => {
  let timer;
  const debounced = function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
};

//
export const reduce = async (r, a) => {
  return await r.reduce(
    (f, fn) => f.then(fn), //
    Promise.resolve(a),
  );
};

export const reduceEach = async (reducers, each) => {
  return await Promise.all(each.map((one) => reduce(reducers, one)));
};

// the ASYNC `once` (feedback_inflight_promise_guard). `once` above guards SYNC
// re-entry; inflight shares ONE in-flight run across concurrent callers and memoizes
// the resolved promise (no stampede). belt is a lib → both reject policies:
// retry=true (default) clears the slot on rejection so a failed setup re-runs;
// retry=false caches the rejection permanently. Success always memoizes.
export const inflight = (fn, { retry = true } = {}) => {
  let promise = null;
  return (...args) =>
    (promise ??= Promise.resolve(fn(...args)).catch((error) => {
      if (retry) promise = null;
      throw error;
    }));
};
