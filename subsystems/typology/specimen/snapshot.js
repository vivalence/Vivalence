// ── specimen.snapshot ──────────────────────────────────────────────────────
// Ephemeral capture: a LIVE instance (MikroORM entity, Mode, Wafer, Vector…) → a
// curated, JSON-safe POJO → disk. The cata half only — deconstruct. The ana half
// (build/read) is deferred until we read from disk; `locate` is already read-safe
// (depends on meta, not the parsed body) so it drops in unchanged later.
//
//   snapshot(subject, { parse, locate, meta, depth, pick, omit, write })
//     parse(subject) → POJO   override the serializer. default = fold (below).
//     pick [field…]           allowlist top-level fields (instances with machinery —
//                             Mode.aperture/module/connection — want this).
//     omit [field…]           blocklist top-level fields — pick's dual. fold everything
//                             EXCEPT these (e.g. drop Mode.module, which duplicates the
//                             live aperture/emitter contract). applies after pick/parse.
//     depth                   circular-spine cut (default 2).
//     locate(meta, pojo)→path WHERE on disk. string used verbatim. meta is the
//                             read-safe key {type, slug, vantage}; pojo is a
//                             write-only convenience for naming from content.
//                             REQUIRED — there is no default; missing path throws.
//     meta                    addressing key, forwarded to locate.
//     base                    a relative locate result is resolved against this dir;
//                             an absolute locate passes through. Callers from a foreign
//                             cwd (e.g. a die launched in systems/runtime) pass an
//                             import.meta-derived base so the file lands where intended.
//     write  (default true)   false → return { pojo } only (for console.log first).
//     dry    (default false)  resolve { pojo, path } exactly as a real run would —
//                             where it WOULD write, what it WOULD write — but touch
//                             no disk. Preview the whole capture without side effects.
//
//   returns { pojo, path }  — path is the absolute, resolved target.
//
// cata pipeline:  write ∘ locate ∘ JSON.stringify ∘ fold
//
// ── working with snapshots (a tool, not a fixture) ──────────────────────────
// snapshot is a TOOLBOX instrument: point it at any live thing and capture a
// reviewable JSON shadow. It is not a committed golden-file harness (yet) — you
// reach for it to SEE a structure, diff two vantages, or freeze a reference.
//
// File convention — mirror the test file's:  <semantic>.snapshot.test.js
//   the produced artifact is               <semantic>.snapshot.json
//   <semantic> is all-dashes (kebab), the vantage is the last segment:
//     homepage-aprende-brazilian.snapshot.json   ← instance vantage (in-process)
//     homepage-aprende-aperture.snapshot.json    ← wire vantage (over HTTP)
//     modes-aperture.snapshot.json               ← a catalog capture
//   Snapshots live beside the tests that make them: <container>/tests/snapshots/.
//
// Two vantages, two transports (same modes, compared side by side):
//   instance — fold a LIVE object in-process. Mode/Domain instances carry machinery
//              (aperture/emitter Vectors, module, Status) → use pick/omit + depth.
//                snapshot(mode, { base, omit: ["module"], depth: 6,
//                                 locate: () => `${mode.type}-${mode.slug}-${daemon}.snapshot.json` })
//   aperture — call the daemon's /metadata aperture over a real Connection and
//              snapshot what the WIRE returns (already shape.strip'd, no machinery).
//              /metadata/* is auth-gated → lighthouse-login first, attach the Bearer:
//                const conn = new Connection(new Url("http://localhost:2501"), shard.transmitter.fetcher);
//                const { authority } = await conn.call("/attached/process/lighthouse/multiplayer/auth/login",
//                                                       { username, password });
//                conn.use((ctx, next) => (ctx.request.headers.set("authorization",
//                                                                  `Bearer ${authority.access}`), next()));
//                const modes = await conn.call("/daemon/<slug>/metadata/modes", {});
//                snapshot(modes, { base, locate: "modes-aperture.snapshot.json" });
//
// Workflow: dry first, then write.  Run with dry:true to preview every path + size
// (and console.log the pojo) without touching disk; eyeball it; flip dry:false to land
// the files. See systems/runtime/tests/aperture.snapshot.test.js for the wire vantage.

import { isAbsolute, join } from "@std/path";
import { shape } from "@vivalence/typology";

// noise the spine drags in: nanostore atoms, methods, the ORM/daemon back-refs.
const NOISE = (key, value) =>
  key.startsWith("$") || typeof value === "function" || key === "em" || key === "daemon";

// duck-types — keep the capture tool from importing entity/routing classes.
const isCollection = (value) => typeof value?.getItems === "function"; // MikroORM Collection
const isPath = (value) => typeof value?.nature === "string" && Array.isArray(value?.gauges); // Path/Pattern node
const isVector = (value) => value?.trajectories instanceof Map; // routing Vector (aperture/emitter/tools)

// the one combinator — a depth-bounded, cycle-guarded cata over an arbitrary live value.
//   Date → ISO · BigInt → string · Collection → item ids · Path → its nature string ·
//   Vector → its stripped contract (shape.strip: {effect?, branches}) · already-seen → cut
//   (kills self-references like status.subject === mode) · plain object → recurse, shed noise.
function fold(value, depth, seen = new WeakSet()) {
  if (value == null) return value;
  if (value instanceof Date) return value.toISOString();
  const kind = typeof value;
  if (kind === "bigint") return value.toString();
  if (kind !== "object") return value; // scalar leaf
  if (seen.has(value)) return undefined; // cycle leaf — the dominant source of bloat
  if (isCollection(value))
    return value.isInitialized?.() ? value.getItems().map((item) => item.id ?? item) : "[unloaded]";
  if (isPath(value)) return value.nature; // routing node → just its nature, drop the trace tree
  if (isVector(value)) return shape.strip(value); // Vector → contract, so /drill·/coach survive
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => fold(item, depth - 1, seen));
  if (depth <= 0) return value.id ?? undefined; // spine floor: entity→id, else cut
  const out = {};
  for (const key of Object.keys(value)) {
    if (NOISE(key, value[key])) continue;
    const folded = fold(value[key], depth - 1, seen);
    if (folded !== undefined) out[key] = folded;
  }
  return out;
}

export function snapshot(subject, options = {}) {
  const { parse, locate, meta = {}, depth = 2, pick, omit, base, write = true, dry = false } = options;

  const selected = parse
    ? parse(subject)
    : pick
      ? Object.fromEntries(pick.map((key) => [key, fold(subject[key], depth)]))
      : fold(subject, depth);

  const pojo = omit
    ? Object.fromEntries(Object.entries(selected).filter(([key]) => !omit.includes(key)))
    : selected;

  const located = typeof locate === "function" ? locate(meta, pojo) : locate;
  const path =
    typeof located === "string" && located && base && !isAbsolute(located)
      ? join(base, located)
      : located;

  if (write && !dry) {
    if (typeof path !== "string" || !path) throw new Error("snapshot: locate must resolve to a path");
    Deno.writeTextFileSync(path, JSON.stringify(pojo, null, 2));
  }
  return { pojo, path };
}
