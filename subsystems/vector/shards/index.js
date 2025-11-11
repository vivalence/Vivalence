export * as patterns from "./patterns.js";
export * as secure from "./secure.js";
export * as caching from "./caching.js";

const attach = (key, val) => async (ctx, next) => {
  ctx[key] = val;
  return await next();
};

function status(status) {
  return async (input, ctx) => status;
}
// aperture.open("/manifest", async (body, ctx) => ({
//   ...ctx.runtime.config.manifest,
// }));

export const aperture = { status };
export const context = { attach };
