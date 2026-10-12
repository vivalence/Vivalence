import { snapshot } from "@vivalence/typology/specimen";

// on client this is used by telemetry.  telemetry is our scaffold utility to serve as the client side abstraction for logging and DX devexp. it all flows through paladin. paladin knows how to handle certain scalars, teypology primitives and prototypes, but never environement's semantic primitives.
// handles $stores but not $thread or ctx.daemon.

export default function (paladin) {
  const SNAP = new URL("./.snapshots/", import.meta.url).pathname;
  // scribe serves some clever abstraction over our instances daemons(.modes) services and both the runtime and the clients. i want scribe architecture to respond or rather be computed as a functino of environemnt ad hoc. i want to use scribe as a function of traces and spans, architected for usage inside aperture ctxs, runtime lifecycling, client side dom, terminal, and mode logging, with different backends and protocols for writing to ledger, writing to mountpoint, writing to stdout, writing to console, or to g and h panels, or some inline provided arbitrary function F. also used in testing!

  (input) =>
    snapshot(input, {
      base: SNAP,
      // depth: 6,
      // locate: () => `riddler-assistant-${ctx.input.buffer}.snapshot.json`,
    });

  paladin.scribe = {
    // log {json, store, object, string}
    // snapshot {json, store, object, string}
    // dictate
  };
}
