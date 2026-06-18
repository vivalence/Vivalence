const noop = () => {};
const isStore = (value) => typeof value?.subscribe === "function";

function bind(value, path, emit) {
  if (isStore(value)) {
    let inner = noop;
    const off = value.subscribe((next) => {
      inner();
      inner = bind(next, path, emit);
    });
    return () => {
      inner();
      off();
    };
  }
  if (!path.length) {
    emit(value ?? null);
    return noop;
  }
  const [head, ...rest] = path;
  const next = typeof head === "function" ? head(value) : value?.[head];
  return bind(next, rest, emit);
}

export function chain(root, ...path) {
  return {
    subscribe(run) {
      return bind(root, path, run);
    },
  };
}
