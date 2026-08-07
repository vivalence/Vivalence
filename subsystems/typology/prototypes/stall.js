export const Phase = Object.freeze({
  INERT: "inert",
  MANUAL: "manual",
  CONTINUOUS: "continuous",
  ESCORT: "escort",
});

export function Stall({ source, active, phase, pull = null, depth = () => 1 }) {
  const teardowns = [];
  const wired = new WeakSet();
  const hooks = {
    release: [
      (that, old) => {
        console.log("Stall on release", { that, old });
      },
    ],
  };
  let locked = false;

  const stall = {
    $source: source,
    $active: active,
    $phase: phase,
    on: { release: (callback) => (hooks.release.push(callback), stall) },
    filter: () => true,

    items: () => source.get().filter(stall.filter),
    active: () => active.get(),
    only(predicate) {
      stall.filter = predicate;
      return stall;
    },
    refill() {
      const current = phase.get();
      if (current === Phase.CONTINUOUS) stall.pull();
      if (current === Phase.ESCORT && !stall.items().length)
        active.set(source.get().find((buffer) => !stall.filter(buffer)) ?? null);
    },

    advance() {
      const list = stall.items();
      if (!list.length) return active.set(null);
      const at = list.findIndex((buffer) => buffer.id === stall.active()?.id);
      active.set(list[at + 1] ?? list[0]);
    },

    settle() {
      const list = stall.items();
      if (list.length) {
        if (!list.some((buffer) => buffer.id === stall.active()?.id)) stall.advance();
        return;
      }
      const current = stall.active();
      if (!current || !source.get().some((buffer) => buffer.id === current.id)) active.set(null);
    },

    async pull() {
      if (locked || !pull || stall.items().length >= depth()) return;
      locked = true;
      try {
        await pull(stall);
      } catch (error) {
        console.log("[STALL ERROR]", { error });
      } finally {
        locked = false;
      }
    },

    release(buffer) {
      if (phase.get() === Phase.INERT) return;
      if (stall.active()?.id === buffer.id) stall.advance();
      for (const hook of hooks.release) hook(buffer);
      stall.refill();
    },

    deactivate() {
      while (teardowns.length) teardowns.pop()();
      return stall;
    },

    toJSON: () => ({
      phase: phase.get(),
      active: stall.active()?.id ?? null,
      items: stall.items().map((buffer) => buffer.id),
      depth: depth(),
    }),
  };

  const react = () => {
    if (phase.get() === Phase.INERT) return;
    stall.settle();
    stall.refill();
  };

  const observe = () => {
    const step = () => {
      for (const buffer of stall.items()) {
        if (wired.has(buffer)) continue;
        wired.add(buffer);
        buffer.on.release(() => stall.release(buffer));
      }
      react();
    };
    teardowns.push(source.subscribe(step), active.subscribe(step));
  };

  phase.subscribe((current) => {
    stall.deactivate();
    if (current === Phase.INERT) return;
    observe();
  });

  return stall;
}
