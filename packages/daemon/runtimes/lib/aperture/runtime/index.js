// import diagnostics from "./diagnostics/index.js";
// import dependencies from "./dependencies/index.js";
// import dependency from "./dependency/index.js";
// import instructions from "./instructions/index.js";

export default async function applyRuntimeAperture(runtime) {
  // runtime.aperture.router.middleware.push(async (ctx, next) => {
  //   console.log("apply runtime aperture middleware", ctx.runtime.entity);
  //   console.log("apply runtime aperture middleware", Object.keys(ctx.runtime));
  //   await next();
  // });

  // runtime.aperture.router.route("/runtime/get", (i, ctx) => ctx.runtime.entity);

  // runtime.aperture = await [
  // instructions,
  // dependency,
  // dependencies, //
  // diagnostics,
  // ].reduce((acc, fn) => acc.then(fn), Promise.resolve(runtime.aperture));

  return runtime;
}
