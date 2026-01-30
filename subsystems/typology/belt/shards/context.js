export const attach = (key, val) => async (ctx, next) => {
  // console.log({ attach: { key: { val } } });
  // if (!ctx) throw new Error("404 - not found: " + key);
  ctx[key] = val;
  // if (!ctx[key]) throw new Error("404 - not found: " + key);
  await next();
};
