import tacticMiddlewares from "./tactic.js";

function boot(runtime) {
  for (const tactic of runtime.tactics.values()) {
    tactic.router.middleware.push(...tacticMiddlewares);
  }
}

export default { boot };
