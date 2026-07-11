import paladin from "@vivalence/paladin";
import { Url } from "@vivalence/typology";

export const playground = {
  manifest: { type: "daemon", slug: "playground", version: "0.0.1" },
  docs: { name: "Playground", valence: "buffer reactivity testbed", icon: { emoji: "🧪" } },
  statics: {},
  kernel: [
    // G1 organic / self-managed (inert · manual)
    "@playground/playground/spawner",
    "@playground/playground/spawned",
    // G2 dealt / stall-managed (continuous · escort) — dealer is HARNESSED, needs cortex
    "@playground/playground/dealer",
    "@playground/playground/card",
    // G3 intent-driven / self-config (all phases via intents)
    "@playground/playground/automaton",
    // G4 thread-driven / live-switch (hot-swap phase + cursor)
    "@playground/playground/switchboard",
    // chaosmonkey harness testbed — baseline control + object-render demo
    "@playground/chaosmonkey/vision",
    "@playground/chaosmonkey/oracle",
  ],
  lighthouse: {
    module: "@viva/lighthouse/multiplayer",
    statics: { remote: () => new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")) },
  },
  datamap: {
    module: "@viva/datamap/libsql",
    statics: { db: { file: `playground.viva.db` } },
  },
  // dealer's HARNESSED + CONVERSATIONAL + /oracle resolve a cortex from this hallucinator.
  hallucinators: [
    {
      module: "@viva/hallucinator/anthropic",
      statics: {},
      secrets: { key: () => paladin.secret.get("SECRET_VIVA_ANTHROPIC_API_KEY") },
    },
  ],
  consume: {},
};
