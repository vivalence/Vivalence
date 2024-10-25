import { signals as KeyboardSignals, clean } from "./keyboard/index.js";
import { signals as NavigationSignals } from "./navigation/index.js";
import { signals as SurfaceSignals } from "./surface/index.js";

export default {
  navigation: NavigationSignals,
  keyboard: KeyboardSignals,
  surface: SurfaceSignals,
  clean: () => clean(),
};
