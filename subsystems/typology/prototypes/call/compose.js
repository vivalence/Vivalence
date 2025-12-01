// ??
const compose = (middlewares) => {
  if (!Array.isArray(middlewares))
    throw new TypeError("Middlewares must be an array");

  return (ctx, next) => {
    let index = -1;

    const dispatch = (i) => {
      if (i <= index)
        return Promise.reject(new Error("next() called multiple times"));

      index = i;
      const fn = middlewares[i];

      if (i === middlewares.length)
        return next ? next(ctx) : Promise.resolve(ctx);

      if (!fn) return Promise.resolve(ctx);

      try {
        return Promise.resolve(fn(ctx, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    };

    return dispatch(0);
  };
};

export default compose;
