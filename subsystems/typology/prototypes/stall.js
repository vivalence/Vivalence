// The Stall is the terminal's buffer-render cursor: `active` points into a filtered
// `source`, and a PHASE — owned by the THREAD, mirrored through the `phase` atom here —
// decides how the cursor reacts when (source, active) change and what a buffer's
// release() means.
//
//   inert       does nothing; a deliberate null `active` is respected (homepage empty-state).
//   manual      cursor discipline only: auto-focus + advance-on-release. The app drives pulls.
//   continuous  manual + pull() via `pull` to keep depth() buffers queued; release refills.
//   escort      continuous that comes home: restore the launch buffer when the queue drains.
//
// The stall NEVER persists or touches emitters. Eviction rides the release hook (the
// terminal wires removeOne). The fetch is `pull` (the thread's AIMED-installed thread.pull).
// The phase is READ LIVE, never written here — drivers (C-panel, buffer-apps) set
// thread.phase; the stall only reacts. A release bridge wired under one phase no-ops once
// the thread's phase changes.

export const Phase = Object.freeze({
  INERT: "inert",
  MANUAL: "manual",
  CONTINUOUS: "continuous",
  ESCORT: "escort",
});

export function Stall({ source, active, phase, pull = null, depth = () => 1 }) {
  const teardowns = [];
  const wired = new WeakSet();
  const hooks = { release: [] };
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
    // post-step shared by react + release: continuous keeps the queue topped up; escort
    // never fetches — it walks a pre-loaded queue and, on drain, returns to the launch buffer:
    // the one buffer OUTSIDE the filtered queue (the hub), derived from the source, not stored.
    refill() {
      const current = phase.get();
      if (current === Phase.CONTINUOUS) stall.pull();
      if (current === Phase.ESCORT && !stall.items().length)
        active.set(source.get().find((buffer) => !stall.filter(buffer)) ?? null);
    },

    // cursor → the buffer after the active one (wrapping); first when active is gone/null.
    advance() {
      const list = stall.items();
      if (!list.length) return active.set(null);
      const at = list.findIndex((buffer) => buffer.id === stall.active()?.id);
      active.set(list[at + 1] ?? list[0]);
    },

    // cursor discipline. The filtered queue drives the cursor: when items exist, land on the
    // first unless the active one is already among them — auto-focus (null), seize (escort's
    // filtered-out home), skip a deleted active. When the queue is empty, clear the pointer
    // UNLESS the active buffer is still PARKED in the source — a filtered-out remainder the app
    // deliberately holds (escort's home / a hub). A buffer that's been EVICTED (gone from
    // source) or a null active clears: it must not stay rendered after ✓ just because the hub
    // keeps the source non-empty.
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
      } finally {
        // BEEF handle errors!
        locked = false;
      }
    },

    // a buffer reported done. phase-gated by a LIVE read → a stale bridge no-ops off-phase.
    release(buffer) {
      if (phase.get() === Phase.INERT) return; // app/target self-manages
      if (stall.active()?.id === buffer.id) stall.advance();
      for (const hook of hooks.release) hook(buffer); // eviction (terminal: drop + removeOne)
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

  // the one reaction, selected by the live phase. inert never reaches here (no subscription).
  const react = () => {
    if (phase.get() === Phase.INERT) return;
    stall.settle();
    stall.refill();
  };

  // bridge each new buffer's release into the stall, then react. nanostores fires-on-subscribe,
  // so this primes the current buffers + runs the first react — no init call.
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

  // phase is owned by the thread; the stall re-engages on every change. inert installs
  // nothing ("as much nothing as possible").
  phase.subscribe((current) => {
    stall.deactivate();
    if (current === Phase.INERT) return;
    observe();
  });

  return stall;
}
