// import injectGameCaller from "./injectGameCaller.js";

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
    // pull orm ref?
    ctx.state.tactic = ctx.runtime.modules.tactics.find(
      (tactic) => tactic.entity.slug === slug,
    ).entity;
    await next();
  });

  // tactic.router.middleware.pre(injectGameCaller);
};
