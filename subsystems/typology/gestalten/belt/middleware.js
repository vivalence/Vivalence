export function compose(middleware) {
  if (!Array.isArray(middleware)) throw new TypeError("Middleware stack must be an array!");

  return function (context, next) {
    let index = -1;

    function dispatch(i) {
      if (i <= index) return Promise.reject(new Error("next() called multiple times"));

      index = i;

      let fn = middleware[i];
      if (i === middleware.length) fn = next;
      if (!fn) return Promise.resolve(context);

      try {
        return Promise.resolve(fn(context, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  };
}

export const chain = (first, second) => (context, next) =>
  first(context, () => second(context, next));

export const forward = (_, n) => n();
