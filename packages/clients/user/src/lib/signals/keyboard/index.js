// let signals = {};

// signals.enter = {type: "keyboard", key: "enter", props: { onSelect: () => {} },};
// signals.s = {type: "keyboard", key: "s", props: { onSelect: () => {} },};
// export const middleware = (map) => {
//   for (let [key, value] of Object.entries(signals)) {
//     map.set(value, null);
//   }
//   return map;
// };

// export default signals;
import { matrix } from "../matrix/matrix.js";

const createSignal = (key, type: "KEYBOARD") => {
  const signal = (props) => {
    console.log("keyboard signal", this, key, type, props);
  };
  signal.key = key;
  signal.type = type;
  return signal;
};
const signals = [
  createSignal("Enter"),
  createSignal("s"),
  createSignal("ArrowUp"),
  createSignal("ArrowDown"),
];

const middleware = (map) => {
  Object.values(signals).forEach((signal) => {
    signal.onEffect = (effect) => {
      // IMPORTANT: This is a side effect and must be cleaned
      // also: i should only need one event emitter.
      // onEffect stores the fn in a internal signal:fn.
      // the event emitter pulls the fn and calls it.
      // -- idempotent? debounced? throttled?

      document.addEventListener("keydown", (event) => {
        if (event.key === signal.key) {
          effect(event);
          // remove the event listener document.removeEventListener("keydown", effect);
        }
      });
    };
    map.set(signal, null);
  });
  return map;
};

export default middleware;
