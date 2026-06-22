// ── aperture snapshot · the CONSUMER vantage ─────────────────────────────────
// Interaction mode 2: a real Connection over shard.transmitter.fetcher → live :2501.
// Captures what a CLIENT receives over the wire from the daemon's /metadata aperture,
// the twin of the die's in-process instance snapshots (*.brazilian.json):
//   /daemon/<slug>/metadata/modes                          → modes.aperture.json
//   /daemon/<slug>/mode/<type>/<slug>/metadata/{manifest,aperture}
//                                                          → <type>-<slug>.aperture.json
// /metadata/* IS auth-gated (live daemon returns Unauthorized), so we lighthouse-login
// first and attach the Bearer token. Skips when the runtime is down — boot it first:
// `deno task runtime/run`.
import { specimen, Connection, Url, shard } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;
const BASE = "http://localhost:2501";
const DAEMON = "brazilian";
const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false; // write the *-aperture.snapshot.json files (dry:true to preview)

const alive = async () => {
  try { await fetch(BASE); return true; } catch { return false; }
};

describe("aperture snapshot: /metadata (consumer vantage)", { sanitizeResources: false, sanitizeOps: false }, () => {
  let skip = false;
  const conn = new Connection(new Url(BASE), shard.transmitter.fetcher);

  specimen.beforeAll(async () => {
    skip = !(await alive());
    if (skip) return void console.log("  SKIP: no runtime at", BASE);
    // /metadata/* is auth-gated → lighthouse login, then attach the Bearer on every call
    const res = await conn.call("/attached/process/lighthouse/multiplayer/auth/login", {
      username: "beef",
      password: "biggusdickus",
    });
    conn.use(async (ctx, next) => {
      ctx.request.headers.set("authorization", `Bearer ${res.authority.access}`);
      await next();
    });
  });
  const test = (name, fn) => it(name, async () => { if (!skip) await fn(); });

  test("modes catalog → modes.aperture.json", async () => {
    const modes = await conn.call(`/daemon/${DAEMON}/metadata/modes`, {});
    console.log(`\n===BEGIN /metadata/modes===\n${JSON.stringify(modes, null, 2)}\n===END===\n`);
    // wire data is already JSON-safe (server shape.strip'd) — identity parse, no fold.
    const { path } = snapshot(modes, { base, dry: DRY, parse: (x) => x, locate: "modes-aperture.snapshot.json" });
    console.log(`[aperture ${DRY ? "DRY" : "WRITE"}] modes catalog → ${path} · ${modes.length} modes`);
    expect(Array.isArray(modes)).toBe(true);
    expect(modes.length).toBeGreaterThan(0);
  });

  test("per-mode metadata → <type>-<slug>.aperture.json", async () => {
    const modes = await conn.call(`/daemon/${DAEMON}/metadata/modes`, {});
    for (const mode of modes) {
      const stem = `/daemon/${DAEMON}/mode/${mode.type}/${mode.slug}/metadata`;
      const manifest = await conn.call(`${stem}/manifest`, {});
      const aperture = await conn.call(`${stem}/aperture`, {});
      const pojo = { manifest, aperture };
      const { path } = snapshot(pojo, { base, dry: DRY, parse: (x) => x, locate: `${mode.type}-${mode.slug}-aperture.snapshot.json` });
      const bytes = JSON.stringify(pojo).length;
      console.log(`[aperture ${DRY ? "DRY" : "WRITE"}] ${mode.type}/${mode.slug} → ${path} · ${bytes} bytes · ~${Math.ceil(bytes / 4)} tokens`);
      if (mode.slug === "aprende")
        console.log(`\n===BEGIN aprende.aperture===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
    }
  });
});
