export const once = (fn) => {
  let called = false;
  return function (...args) {
    if (called) return;
    called = true;
    return fn.apply(this, args);
  };
};

export const reduce = async (r, a) => {
  return await r.reduce(
    (f, fn) => f.then(fn), //
    Promise.resolve(a),
  );
};

export const reduceEach = async (reducers, each) => {
  return await Promise.all(each.map((one) => reduce(reducers, one)));
};

export default { once, reduce, reduceEach };
