import { Button } from "@vivalence/ui";

const createSignal = (key, component) => {
  const signal = ({ label, hint = null }) => {
    signal.label = label;
    signal.id = Math.random().toString(36).substring(2, 15);

    if (typeof hint === "Boolean") signal.hint = `(${key})`;
    else if (typeof hint === "String") signal.hint = hint;

    return signal;
  };

  // signal.id = Math.random().toString(36).substring(2, 15);
  signal.component = component;
  signal.key = key;
  signal.type = "navigation";

  signal.listen = (effect, trajectory) => {
    signal.effect = effect;
    trajectory.use((m) => m.set(m.signals.keyboard[signal.key](), effect));
  };
  signal.trigger = (event) => {
    signal.effect(event);
  };

  return signal;
};

const signals = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  .split("")
  .reduce((signals, key) => {
    signals[key] = createSignal(key, Button);
    return signals;
  }, {});

export { signals };
