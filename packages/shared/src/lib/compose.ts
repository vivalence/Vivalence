export default function compose(middleware: Function[]) {
  if (!Array.isArray(middleware))
    throw new TypeError("Middleware stack must be an array!");

  return function (context: any, next?: Function) {
    let index = -1;

    function dispatch(i: number): Promise<any> {
      if (i <= index)
        return Promise.reject(new Error("next() called multiple times"));

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
