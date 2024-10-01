import tacticMiddlewares from "./tactic/index.js";
import gameMiddlewares from "./game/index.js";

function boot(runtime) {
  for (const tactic of runtime.tactics.values()) {
    tacticMiddlewares(tactic);
  }
  for (const game of runtime.games.values()) {
    gameMiddlewares(game);
  }
}

export default { boot };
