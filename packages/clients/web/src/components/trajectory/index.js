import { get, writable } from "svelte/store";
import signals from "./signals/index.js";
import root from "./root.js";

const log = (step) => (map) => (console.log(`[LOG] (${step}) - `, map), map);
const validate = (signal, effect) => {
  if (!!signal && !!effect && typeof signal.listen === "function") {
    return true;
  }
  return false;
};
const effectuate = (trajectory, signal, effect) => {
  if (typeof effect === "function") {
    signal.listen((event) => effect(event, trajectory), trajectory);
  }
};
const secure = (t, fn) => {
  return (...args) => {
    if (t.runtime) {
      return fn(...args);
    } else {
      throw new Error("Trajectory runtime not initialized");
    }
  };
};

const createTrajectory = (locals) => {
  const trajectory = { locals, signals, map: writable(new Map()), mode: writable("closed") };

  trajectory.set = (signal, effect) => {
    if (Array.isArray(signal)) {
      if (effect) throw new Error("Invalid signal or effect");
      signal.forEach(([s, e]) => trajectory.set(s, e));
      return trajectory;
    }
    if (validate(signal, effect)) {
      effectuate(trajectory, signal, effect);
      trajectory.map.update((m) => {
        m.set(signal, effect);
        return m;
      });
    } else throw new Error("Invalid signal or effect");
    return trajectory;
  };
  trajectory.setMode = (newMode) => {
    trajectory.mode.set(newMode);
    return trajectory;
  };

  trajectory.clean = () => {
    signals.clean();
    trajectory.map.update(() => new Map());
    trajectory.set(trajectory.signals.keyboard["Escape"], () => trajectory.root());
    return trajectory;
  };
  trajectory.root = () => root(trajectory);
  trajectory.use = (mw) => mw(trajectory);
  trajectory.initialize = (l) => (trajectory.locals = l);

  return trajectory;
};

const trajectory = createTrajectory();

export default trajectory;
