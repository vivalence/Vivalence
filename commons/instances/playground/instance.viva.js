import paladin from "@vivalence/paladin";
import { v } from "@vivalence/typology";

export const manifest = { type: "instance", slug: "playground", version: "0.0.1" };

export const datamap = { module: "@commons/datamap/libsql" };

export const lighthouse = {
  module: "@commons/lighthouse/multiplayer",
  statics: { remote: () => paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE") },
};

// the stub ALONE — playground is the deterministic testbed: no key, no network, no bill, and
// every activity you watch is one you scripted. swap in anthropic when you want a real model,
// but not beside the stub: the cortex resolves by nearest tune and the two would shadow.
export const hallucinators = [
  {
    module: "@commons/hallucinator/stub",
    statics: {
      scripts: {
        slow: "--deltas 40 --pace 300ms",
        stalled: "--stall 20s --deltas 8",
        toolstorm: "--tool lookup --rounds 3 --pace 120ms --stall 2s",
        flaky: "--fault retryable",
        hung: "--timeout",
      },
    },
  },
];

export const daemons = [
  {
    manifest: { type: "daemon", slug: "playground", version: "0.0.1", name: "Playground", description: "buffer reactivity + harness testbed", icon: { emoji: "🧪" } },
    kernel: [
      // G1 organic / self-managed (inert · manual)
      "@commons/playground/spawner",
      "@commons/playground/spawned",
      // G2 dealt / stall-managed (continuous · escort) — dealer is HARNESSED, needs cortex
      "@commons/playground/dealer",
      "@commons/playground/card",
      // G3 intent-driven / self-config (all phases via intents)
      "@commons/playground/automaton",
      // G4 thread-driven / live-switch (hot-swap phase + cursor)
      "@commons/playground/switchboard",
      // chaosmonkey harness testbed — baseline control, object-render, and the raw cortex caller
      "@commons/chaosmonkey/vision",
      "@commons/chaosmonkey/oracle",
      "@commons/chaosmonkey/reader",
    ],
  },
];

export const runtime = {
  manifest: { slug: "runtime" },
  statics: {
    serve: () => paladin.env.get("VIVA_RUNTIME_SERVE"),
    remote: () => paladin.env.get("PUBLIC_VIVA_RUNTIME_REMOTE"),
  },
};

export const clients = [
  {
    manifest: { type: "client", slug: "anima" },
    statics: { serve: () => paladin.env.get("VIVA_CLIENT_ANIMA_SERVE") },
  },
];

export const services = [
  {
    manifest: { type: "service", slug: "multiplayer" },
    module: "@commons/lighthouse/multiplayer",
    secrets: { jwt: () => paladin.secret.get("SECRET_VIVA_JWT") },
    statics: { serve: () => paladin.env.get("VIVA_LIGHTHOUSE_SERVE") },
  },
];

export const environment = v.environment({
  VIVA_RUNTIME_ORIGIN: v.url().desc("Scheme and authority the runtime is reachable at. Every address below derives from it. Offset from hello-world's 2501 so both instances can run at once.").default("http://localhost:2502").group("addresses"),
  VIVA_CLIENT_ANIMA_ORIGIN: v.url().desc("Scheme and authority the anima browser client is reachable at.").default("http://localhost:1795").group("addresses"),
  VIVA_RUNTIME_SERVE: v.url().desc("Base URL the runtime serves on. Everything else hangs off this latch.").default("${VIVA_RUNTIME_ORIGIN}/").group("addresses"),
  VIVA_LIGHTHOUSE_SERVE: v.url().desc("Where the hosted lighthouse attaches inside the runtime's own path tree.").default("${VIVA_RUNTIME_ORIGIN}/attached/process/lighthouse/multiplayer").group("addresses"),
  VIVA_CLIENT_ANIMA_SERVE: v.url().desc("Where the anima browser client serves.").default("${VIVA_CLIENT_ANIMA_ORIGIN}/").group("addresses"),
  PUBLIC_VIVA_RUNTIME_REMOTE: v.url().desc("Runtime address the browser bundle calls. Reaches it through publish(), not a thunk.").default("${VIVA_RUNTIME_SERVE}").group("addresses"),
  PUBLIC_VIVA_LIGHTHOUSE_REMOTE: v.url().desc("Lighthouse address as CONSUMED — by the daemon, and by the browser after publish().").default("${VIVA_LIGHTHOUSE_SERVE}").group("addresses"),
  SECRET_VIVA_JWT: v.string({ minLength: 24 }).desc("Lighthouse signing secret. Minted at first init; rotate with: openssl rand -base64 24").default(() => btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24))))).group("keys"),
  SECRET_VIVA_ANTHROPIC_API_KEY: v.string().desc("Anthropic key. Unread while the stub is the only hallucinator — declared so a swap needs no schema edit.").group("keys").optional(),
});
