// ── aperture snapshot · the CONSUMER vantage ─────────────────────────────────
// Interaction mode 2: a real Connection over shard.transmitter.fetcher → live :2501.
// Captures what a CLIENT receives over the wire from the daemon's /metadata aperture,
// the twin of the die's in-process instance snapshots (*.brazilian.json):
//   /daemon/<slug>/metadata/modes                          → modes.aperture.json
//   /daemon/<slug>/mode/<type>/<slug>/metadata/{manifest,aperture}
//                                                          → <type>-<slug>.aperture.json
// /metadata/* IS auth-gated (live daemon returns Unauthorized), so the `live` fixture
// lighthouse-logs-in and attaches the Bearer token. The daemon slug is DERIVED from
// /metadata/daemons — never pinned. Skips only when the runtime is down, and says why:
// `deno task runtime/run`.
import { specimen } from "@vivalence/typology";
import { live } from "./scenarios/fixtures.js";

const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false; // write the *-aperture.snapshot.json files (dry:true to preview)

const routes = (node, prefix = "") => {
  const out = [];
  if (node?.effect) {
    const leaf = { path: prefix || "/" };
    const effect = node.effect;
    if (effect.methods) leaf.methods = effect.methods;
    if (effect.input !== undefined) leaf.input = effect.input?.type ?? true;
    if (effect.output !== undefined) leaf.output = effect.output?.type ?? true;
    if (effect.yields !== undefined) leaf.yields = effect.yields?.type ?? true;
    out.push(leaf);
  }
  for (const [segment, child] of Object.entries(node?.branches ?? {})) {
    out.push(...routes(child, `${prefix}/${segment}`));
  }
  return out;
};

describe("aperture snapshot: /metadata (consumer vantage)", { sanitizeResources: false, sanitizeOps: false }, () => {
  let runtime;

  specimen.beforeAll(async () => {
    runtime = await live();
    if (runtime.reason) console.log("  SKIP:", runtime.reason);
    else console.log(`  LIVE: ${runtime.base} → daemon "${runtime.slug}" as ${runtime.identity?.slug}`);
  });
  const test = (name, fn) => it(name, async () => { if (runtime.slug) await fn(runtime.connection, runtime.slug); });

  test("modes catalog → modes.aperture.json", async (connection, daemon) => {
    const modes = await connection.call(`/daemon/${daemon}/metadata/modes`, {});
    console.log(`\n===BEGIN /metadata/modes===\n${JSON.stringify(modes, null, 2)}\n===END===\n`);
    // wire data is already JSON-safe (server shape.strip'd) — identity parse, no fold.
    const { path } = snapshot(modes, { base, dry: DRY, parse: (x) => x, locate: "modes-aperture.snapshot.json" });
    console.log(`[aperture ${DRY ? "DRY" : "WRITE"}] modes catalog → ${path} · ${modes.length} modes`);
    expect(Array.isArray(modes)).toBe(true);
    expect(modes.length).toBeGreaterThan(0);
  });

  test("per-mode metadata → <type>-<slug>.aperture.json", async (connection, daemon) => {
    const modes = await connection.call(`/daemon/${daemon}/metadata/modes`, {});
    for (const mode of modes) {
      const stem = `/daemon/${daemon}/mode/${mode.type}/${mode.slug}/metadata`;
      const manifest = await connection.call(`${stem}/manifest`, {});
      const aperture = await connection.call(`${stem}/aperture`, {});
      const pojo = { manifest, routes: routes(aperture) };
      const { path } = snapshot(pojo, { base, dry: DRY, parse: (x) => x, locate: `${mode.type}-${mode.slug}-aperture.snapshot.json` });
      const bytes = JSON.stringify(pojo).length;
      console.log(`[aperture ${DRY ? "DRY" : "WRITE"}] ${mode.type}/${mode.slug} → ${path} · ${bytes} bytes · ~${Math.ceil(bytes / 4)} tokens`);
      if (mode.slug === "aprende")
        console.log(`\n===BEGIN aprende.aperture===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
    }
  });
});
