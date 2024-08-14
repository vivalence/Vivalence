import { get, writable } from "svelte/store";
import signals from "../signals/index.js";
import root from "./root.js";

const log = (step) => (map) => (console.log(`[LOG] (${step}) - `, map), map);
const validate = (signal, effect) => {
  if (!!signal && !!effect && typeof signal.listen === "function") {
    return true;
  }
  return false;
};
const effectuate = (matrix, signal, effect) => {
  if (typeof effect === "function") {
    signal.listen((event) => effect(event, matrix), matrix);
  }
};
const secure = (m, fn) => {
  return (...args) => {
    if (m.runtime) {
      return fn(...args);
    } else {
      throw new Error("Matrix runtime not initialized");
    }
  };
};

const createMatrix = (locals) => {
  const matrix = { locals, signals, map: writable(new Map()) };

  matrix.set = (signal, effect) => {
    if (validate(signal, effect)) {
      effectuate(matrix, signal, effect);
      matrix.map.update((m) => {
        m.set(signal, effect);
        return m;
      });
    } else throw new Error("Invalid signal or effect");
  };

  matrix.clean = () => (signals.clean(), matrix.map.update(() => new Map()), matrix);
  matrix.root = () => root(matrix);
  matrix.use = (mw) => mw(matrix);
  matrix.initialize = (l) => (matrix.locals = l);

  return matrix;
};

const matrix = createMatrix();

export default matrix;
