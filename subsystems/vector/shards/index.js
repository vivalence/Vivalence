export * as patterns from "./patterns.js";
export * as caching from "./caching.js";

const attach = (key, val) => async (ctx, next) => {
  ctx[key] = val;
  return await next();
};

function status(vector) {
  vector.open("/status", async (input, ctx) => {
    return { status: "success", code: 200 };
  });
}
// aperture.open("/manifest", async (body, ctx) => ({
//   ...ctx.runtime.config.manifest,
// }));

export const aperture = { status };
export const context = { attach };
