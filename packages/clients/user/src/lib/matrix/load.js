import { matrix } from "./matrix.js";
import matrix from "$lib/matrix/index.js";
import keyboard from "$signals/keyboard";
import StrategyController from "$lib/modules/StrategyController.js";

function init() {
  matrix.use(keyboard.middleware);
  matrix.use((m) => m.set(keyboard.s, StrategyController));

  // Set initial menu state
  // matrix.update(m => {m.set('menuState', 'closed'); return m;});
}
