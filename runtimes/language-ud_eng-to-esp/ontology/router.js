import remedy from "./methods/remedy/index.js";
// import validateUnit from "./methods/validate/unit/index.js";

export default async function router(runtime) {
  runtime.router.route("/install/tags", async (ctx, next) => {
    throw new Error("Not implemented");
  });

  runtime.router.route("/install/units", async (ctx, next) => {
    throw new Error("Not implemented");
  });

  runtime.router.route("/remedy", async (ctx, next) => {
    const { issue } = ctx.request.body;
    const result = await remedy(issue, ctx);
    ctx.body = { data: result };
  });

  return runtime;

  // router.route("/predict/tags", async (ctx, next) => {
  //   const { issue } = ctx.request.body;
  //   const issues = await predict(input, ctx.locals);
  //   ctx.body = { data: issues };
  // });

  // router.route("/autocomplete/tags", async (ctx, next) => {
  //   const { issue } = ctx.request.body;
  //   const result = await autocomplete(input, ctx.locals);
  //   ctx.body = { data: result };
  // });

  // router.route("/predict/units", async (ctx, next) => {
  //   const input = ctx.request.body;
  //   const issues = await predict(input, ctx.locals);
  //   ctx.body = { data: issues };
  // });

  // router.route("/validate/unit", async (ctx, next) => {
  //   const input = ctx.request.body;
  //   const result = await validateUnit(input, ctx.locals);
  //   ctx.body = { data: result };
  // });

  // router.route("/deduplicate/units", async (ctx, next) => {
  //   const { unit } = ctx.request.body;

  //   if (!["pron", "det"].includes(unit.data.annotation.pos)) {
  //     return {
  //       isValid: false,
  //       message: "Unit deduplication not implemented for pos: " + unit.data.annotation.pos,
  //     };
  //   }
  //   const issues = [];

  //   const validation = await deduplicate(unit, locals);

  //   if (!validation.isValid) issues.push(...validation.issues);
  //   issues.forEach((issue) => (issue.context.unit = unit));

  //   ctx.body = { data: { isValid: issues.length === 0, issues } };
  // });
}
