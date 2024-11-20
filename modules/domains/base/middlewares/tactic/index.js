import getData from "./getData.js";
import buildRelations from "./buildRelations.js";
import injectGameCaller from "./injectGameCaller.js";
import injectRepetitionSignal from "./injectRepetitionSignal.js";

export default (tactic) => {
  tactic.router.middleware.push(async (ctx, next) => {
    const perf = performance.now();
    await next();
    const time = performance.now() - perf;
    console.log(`[Tactic] provisioning - ${time}ms`);
  });

  tactic.router.middleware.push(async (ctx, next) => {
    const url = new URL(ctx.request.url).pathname.split("/");
    const slug = url[url.indexOf("t") + 1];
    ctx.state.tactic = ctx.runtime.tactics.find((tactic) => tactic.manifest.slug === slug).manifest;
    await next();
  });

  tactic.router.middleware.pre(getData);
  tactic.router.middleware.pre(buildRelations);
  tactic.router.middleware.pre(injectGameCaller);

  tactic.router.middleware.post(injectRepetitionSignal);
};
