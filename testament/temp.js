// KOANS — boot & install (what 2026-05-25 enabled)
//
// run:  `deno run --env-file=./testament/.env -A ./testament/temp.js`
// uncomment the call beneath ONE koan.

import paladin from "@vivalence/paladin";

// ── KOAN 1 ── paladin boots bare. no ikiro. prototypes are siblings, constructed.
// expect: ikiro undefined; system/variant/vip present before any mount.
async function koan1_bareBoot() {
  console.log("ikiro:", paladin.ikiro); // undefined — wafer/ikiro gone
  console.log("siblings:", {
    system: paladin.system.constructor.name,
    variant: paladin.variant.constructor.name,
    vip: paladin.vip.constructor.name,
  });
  console.log("env (pre-mount, from --env-file):", paladin.env.vars);
}
// await koan1_bareBoot();

// ── KOAN 2 ── lazy variant mount. with env → mounts; bare → throws "no scope.variant".
// expect: runtime slug + daemons + services from the variant cake.
async function koan2_lazyVariant() {
  const scopes = () => ({
    variant: paladin.scope.variant?.absolute,
    mountpoint: paladin.scope.mountpoint?.absolute,
    environment: paladin.scope.environment?.absolute,
    system: paladin.scope.system?.absolute,
    repository: paladin.scope.repository?.absolute,
    registry: paladin.scope.registry?.absolute,
  });
  console.log("scopes (before mount):", scopes());
  await paladin.variant.mount();
  console.log("scopes (after mount):", scopes());
  console.log("runtime:", paladin.variant.runtime.slug);
  console.log(
    "daemons:",
    paladin.variant.daemons.map((d) => d.slug),
  );
  console.log(
    "services:",
    paladin.variant.services.map((s) => s.slug),
  );
}
// await koan2_lazyVariant();

// ── KOAN 3 ── system mount = machine ledger of running instances.
// expect: system mount materialized; instance roundtrips.
async function koan3_systemLedger() {
  await paladin.system.mount();
  await paladin.system.instances.write("koan", { mount: "/tmp/koan-demo" });
  console.log("instance:", await paladin.system.instances.read("koan"));
  console.log("system mount:", paladin.scope.system.absolute);
}
// await koan3_systemLedger();

// ── KOAN 4 ── fn.once — mounting is idempotent, no remount.
// expect: same Variant instance twice; resolve runs once.
async function koan4_mountOnce() {
  const a = await paladin.variant.mount();
  const b = await paladin.variant.mount();
  console.log("same instance:", a === b); // true
}
// await koan4_mountOnce();

// ── KOAN 5 ── repository scope explicit (env), not import.meta.url offset.
// expect: VIVA_REPOSITORY_MOUNT present; scope.repository resolves to it.
async function koan5_repoScope() {
  console.log("VIVA_REPOSITORY_MOUNT:", paladin.env.get("VIVA_REPOSITORY_MOUNT"));
  console.log("scope.repository:", paladin.scope.repository?.absolute);
  console.log("scope.registry:", paladin.scope.registry?.absolute); // derived from repository
}
// await koan5_repoScope();

// ─────────────────────────────────────────────
// CLI KOANS (run directly):
//
// K6  install — env-file anchor + generic symlinked launcher
//       deno task viva/install
//       cat ~/.config/viva/env        # export VIVA_REPOSITORY_MOUNT="…"
//       ls -la ~/.deno/bin/viva       # symlink → systems/ghost/ghost.sh (live edits)
//       viva instance/init            # dispatches (init stub: logs env)
//
// K7  dev watch — the command IS the toggle (watch loads testament/.env; run is bare)
//       deno task runtime/watch       # :2501 ALIVE, variant mounted
//       deno task ghost/watch         # bare — operator runs variant-free
//
// K8  publish graph self-contained (Q1) — dry-run, nothing pushed
//       cd subsystems/typology && deno publish --dry-run --allow-slow-types
