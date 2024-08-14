import Button from "./Button.svelte";

const createNavSignal = (key, component) => {
  const signal = ({ label, hint = null }) => {
    signal.label = label;

    if (typeof hint === "Boolean") signal.hint = `(${key})`;
    else if (typeof hint === "String") signal.hint = hint;

    return signal;
  };

  signal.id = Math.random().toString(36).substring(2, 15);
  signal.component = component;
  signal.key = key;
  signal.type = "navigation";

  signal.listen = (effect, matrix) => {
    signal.effect = effect;
    matrix.use((m) => m.set(m.signals.keyboard[signal.key], effect));
  };
  signal.trigger = (event) => {
    signal.effect(event);
  };

  return signal;
};
export const signals = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  .split("")
  .reduce((signals, key) => {
    signals[key] = createNavSignal(key, Button);
    return signals;
  }, {});
