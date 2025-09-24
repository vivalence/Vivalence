export const attach = (key, val) => async (ctx, next) => {
  ctx[key] = val;
  return await next();
};

export function status(vector) {
  vector.open("/status", async (input, ctx) => {
    return { status: "success", code: 200 };
  });
}
// aperture.open("/manifest", async (body, ctx) => ({
//   ...ctx.runtime.config.manifest,
// }));

export const aperture = { status }; // datamap
export const context = { attach };
export const middleware = { identity: attach }; //legacy
