import tacticMiddlewares from "./tactic/index.js";
import gameMiddlewares from "./game/index.js";

function boot(runtime) {
  for (const tactic of runtime.modules.tactics) {
    tacticMiddlewares(tactic);
  }
  for (const game of runtime.modules.games) {
    gameMiddlewares(game);
  }
}

export default { boot };
