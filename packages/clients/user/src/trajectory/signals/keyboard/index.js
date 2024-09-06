const listeners = new Map();

const createSignal = (key) => {
  const signal = (props) => {
    signal.id = Math.random().toString(36).substring(2, 15);
    return Object.entries(props).reduce((signal, [key, val]) => {
      signal[key] = value;
      return signal;
    }, signal);
  };

  signal.id = Math.random().toString(36).substring(2, 15);
  signal.key = key;
  signal.type = "keyboard";

  signal.listen = (effect) => {
    listeners.set(signal.key, effect);
  };

  return signal;
};

const handleKeydown = (event) => {
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;
  const effect = listeners.get(event.key) || listeners.get(event.code);
  // console.log("KEYDOWN", event, effect);
  if (effect) effect(event);
};

const signals = [
  "Escape",
  "Enter",
  "ArrowUp",
  "ArrowDown",
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""),
].reduce((signals, key) => {
  signals[key] = createSignal(key);
  return signals;
}, {});

signals["Space"] = createSignal("Space");

const initialize = () => {
  window.addEventListener("keydown", handleKeydown);
  return () => {
    window.removeEventListener("keydown", handleKeydown);
  };
};

const clean = () => {
  listeners.clear();
};

export { signals, initialize, clean };
