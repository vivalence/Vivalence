export const once = (fn) => {
  let called = false;
  return function (...args) {
    if (called) return;
    called = true;
    return fn.apply(this, args);
  };
};

export const every = (n, fn) => (done, total) =>
  (done % n === 0 || done === total) && fn(done, total);

export const debounce = (fn, ms = 0) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
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
