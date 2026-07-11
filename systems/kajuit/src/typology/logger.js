// @beef this is shit
import { logger } from "@nanostores/logger";

// The ONE place nanostores logging is wired for the kajuit client. Covers the app
// shell (static stores) plus the dynamic entity stores — every terminal's
// thread/buffer, each terminal's per-thread stall phase/source, and every buffer's
// data — re-arming per-instance loggers as the collections change.
//
// Stall lives in typology and must NOT import the logger (it would poison the
// buffer-view bundle), so its stores are narrated here, from the app layer.

const short = (id) => String(id ?? "?").slice(0, 6);

// Subscribe to a collection atom; mount a per-item watcher as items appear, dispose it
// when they leave. `watch(item)` returns a destroy fn (or nothing).
function rearm($collection, watch) {
  const live = new Map(); // key → destroy
  const off = $collection.subscribe((items) => {
    const seen = new Set();
    for (const item of items ?? []) {
      const key = item?.id ?? item;
      seen.add(key);
      if (!live.has(key)) live.set(key, watch(item) ?? (() => {}));
    }
    for (const [key, destroy] of live) {
      if (seen.has(key)) continue;
      destroy();
      live.delete(key);
    }
  });
  return () => {
    off();
    for (const destroy of live.values()) destroy();
    live.clear();
  };
}

// @beef questionable.
function watchTerminal(terminal) {
  const unlog = logger({
    [`terminal ${short(terminal.id)} · terminal`]: terminal,
    [`terminal ${short(terminal.id)} · thread`]: terminal.$thread,
    [`terminal ${short(terminal.id)} · buffer`]: terminal.$buffer,
  });
  // the stall is nuked + recreated per thread, so re-log it on every thread change.
  // the terminal's own constructor subscriber runs first, so terminal.stall is already
  // the fresh instance by the time this fires.
  let unlogStall = null;
  const offThread = terminal.$thread.subscribe(() => {
    unlogStall?.();
    // log only the $phase atom. $source is a computed (thread.$buffers) that the logger
    // can't introspect (it reads atom internals), and the buffers are already covered by
    // the per-buffer $data logs below.
    unlogStall = terminal.stall?.$phase
      ? logger({ [`stall ${short(terminal.id)} · phase`]: terminal.stall.$phase })
      : null;
  });
  return () => {
    unlog();
    unlogStall?.();
    offThread();
  };
}

// @beef no.
export function narrate({ lighthouse, terminals, bridge, telemetry }) {
  const destroys = [
    logger({
      "lighthouse · status": lighthouse.$status,
      "terminals · active": terminals.$active,
      "bridge · dock": bridge.$dock,
    }),
    // faulted spans surface on the console; the pipe is the single egress for
    // connection telemetry, this is just one more drain on it.
    telemetry?.tap((record) => {
      if (record.verb === "fault") console.warn(`[trace] fault ${record.path}`, record.data);
    }) ?? (() => {}),
    rearm(terminals.$entities, watchTerminal),
    rearm(lighthouse.$daemons, (daemon) => {
      const $buffers = daemon?.entities?.buffer?.$entities;
      if (!$buffers) return;
      // buffers are high-cardinality — narrate data changes, skip mount/unmount noise.
      return rearm($buffers, (buffer) =>
        logger(
          { [`buffer ${short(buffer.id)} · data`]: buffer.$data },
          { messages: { mount: false, unmount: false } },
        ),
      );
    }),
  ];
  return () => destroys.forEach((destroy) => destroy());
}
