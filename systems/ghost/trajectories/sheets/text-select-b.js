import { render, Select, Text, React, useState, useEffect } from "@vivalence/sheets";

const DUMMY_ITEMS = ["alpha", "beta", "gamma", "delta"];

let listener = null;
let active = null;

const channel = {
  request(payload) {
    return new Promise((resolve) => {
      active = { ...payload, resolve };
      listener?.(active);
    });
  },
  subscribe(fn) {
    listener = fn;
    fn(active);
    return () => { listener = null; };
  },
  clear() {
    active = null;
    listener?.(null);
  },
};

function App() {
  const [current, setCurrent] = useState(active);
  const [lastPick, setLastPick] = useState(null);

  useEffect(() => channel.subscribe(setCurrent), []);

  if (current?.kind === "select") {
    return React.createElement(Select, {
      items: current.items,
      onSelect: (item) => {
        const value = item.value ?? item;
        setLastPick(value);
        current.resolve(value);
        channel.clear();
      },
    });
  }
  if (lastPick !== null) {
    return React.createElement(Text, { color: "green" }, `picked: ${lastPick}  (ctrl-c to exit)`);
  }
  return React.createElement(Text, { color: "gray" }, "idle");
}

let instance = null;
function ensureMounted() {
  if (instance) return;
  instance = render(React.createElement(App));
}

export function teardown() {
  instance?.unmount();
  instance = null;
}

export default async function textSelect(ctx) {
  ensureMounted();
  const items = ctx.signal?.params?.items ?? ctx.input?.items ?? DUMMY_ITEMS;
  return channel.request({ kind: "select", items });
}
