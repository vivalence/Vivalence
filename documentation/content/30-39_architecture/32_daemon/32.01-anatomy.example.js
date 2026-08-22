import { Span, shape } from "@vivalence/typology"

export const name = "32.01-anatomy"

// The standalone variant's .env, minus a machine: the repo is the registry,
// a scratch home under gitignored testament/ stands in for the usual variant
// mounts, secrets are placeholders. Everything below is the real boot,
// staged by hand so each stage can be inspected — run.js drives the same
// lifecycle, with die.resolve() cascading the daemon stages itself.
function environment() {
  if (Deno.env.get("VIVA_VARIANT_MOUNT")) return
  const repo = new URL("../../../../", import.meta.url).pathname
  const scratch = `${repo}testament/docs-anatomy`
  try { Deno.removeSync(scratch, { recursive: true }) } catch { /* first run */ } // fresh boot every capture
  Deno.mkdirSync(scratch, { recursive: true })
  Deno.env.set("VIVA_SYSTEM_MODE", "DEVELOPMENT")
  Deno.env.set("VIVA_SYSTEM_ROLE", "SUDO")
  Deno.env.set("VIVA_REPOSITORY_MOUNT", repo)
  Deno.env.set("VIVA_VARIANT_MOUNT", `${repo}registry/viva/variant/standalone`)
  Deno.env.set("VIVA_LEDGER_MOUNT", `${scratch}/ledger`)
  Deno.env.set("VIVA_MOUNTPOINT_MOUNT", `${scratch}/mountpoint`)
  Deno.env.set("SECRET_VIVA_JWT", "docs-placeholder")
  Deno.env.set("SECRET_VIVA_ANTHROPIC_API_KEY", "docs-placeholder")
}

export async function run() {
  environment()
  const repo = new URL("../../../../", import.meta.url).pathname
  const tame = (path) => String(path).replaceAll(Deno.env.get("VIVA_MOUNTPOINT_MOUNT"), "«mountpoint»").replaceAll(repo, "«repo»/")
  const hooked = console.log // strip ANSI color codes from boot output for a clean capture
  console.log = (...args) => hooked(...args.map((arg) => (typeof arg === "string" ? arg.replace(/\x1b\[[0-9;]*m/g, "") : arg)))

  const span = new Span("boot")
  span.open()

  // ── 1 · paladin — import time ──────────────────────────────────────────────
  const stage1 = span.branch("paladin")
  stage1.open()
  const { default: paladin } = await import("@vivalence/paladin")
  console.log("── 1 · paladin — import time")
  const held = Object.keys(paladin.env.vars)
  console.log(`env       ${held.filter((key) => key.startsWith("VIVA_")).length} VIVA_ · ${held.filter((key) => key.startsWith("PUBLIC_")).length} PUBLIC_ · secrets held apart`)
  console.log(`scope     variant → ${tame(paladin.scope.variant.absolute)}`)
  stage1.note({ env: held.length })
  stage1.close()

  // ── 2 · variant.mount() ────────────────────────────────────────────────────
  const stage2 = span.branch("mount")
  stage2.open()
  console.log("── 2 · paladin — variant.mount()")
  const module = await import(`${repo}registry/viva/variant/standalone/standalone.viva.js`)
  console.log(`pre       module.runtime.statics.serve = ${typeof module.runtime.statics.serve} — a thunk; the declaration is data`)
  await paladin.variant.mount()
  console.log(`post      variant.runtime.statics.serve = ${paladin.variant.runtime.statics.serve.absolute}`)
  const [mask] = paladin.variant.daemons
  console.log(`mask      daemon ${mask.slug} → ${tame(mask.mount.absolute)}`)
  console.log(`kernel    ${mask.kernel.length} inline modules — validated`)
  console.log(`publish   ${Object.keys(paladin.env.vars).filter((key) => key.startsWith("PUBLIC_")).length} PUBLIC_ vars folded from environment/variant.jsonc → process env`)
  stage2.note({ daemons: paladin.variant.daemons.length, services: paladin.variant.services.length })
  stage2.close()

  // ── 3 · runtime — Die.populate() ───────────────────────────────────────────
  const stage3 = span.branch("runtime")
  stage3.open()
  console.log("── 3 · runtime — Die.populate()")
  const { Die, Runtime } = await import("@vivalence/runtime")
  const die = new Die({ good: new Runtime() })
  await die.populate()
  console.log(`latch     ${die.good.latch.absolute}`)
  console.log(`pensieve  ${[...paladin.vip.pensieve.keys()].sort().join(" ")}`)
  console.log(`daemons   ${die.good.daemons.map((child) => child.good.mount.nature).join(" ")}`)
  console.log(`processes /attached/process/${die.good.processes.map((child) => `${child.type}/${child.slug}`).join(" ")}`)
  stage3.note({ daemons: die.good.daemons.length, processes: die.good.processes.length })
  stage3.close()

  const [daemonDie] = die.good.daemons

  // ── 4 · daemon — populate() ────────────────────────────────────────────────
  const stage4 = span.branch("daemon.populate")
  stage4.open()
  console.log("── 4 · daemon — populate()")
  const db = mask.mount.branch(mask.datamap.statics.db.file).absolute
  for (const file of [db, `${db}-wal`, `${db}-shm`]) await Deno.remove(file).catch(() => {}) // anatomy narrates a FIRST boot — force one even when a sibling example booted earlier in this capture
  const before = await Deno.stat(db).catch(() => null)
  console.log(`pre       ${tame(db)} — ${before ? "present" : "absent"}`)
  await daemonDie.populate()
  await Deno.stat(db)
  console.log(`post      ${tame(db)} — on disk, automigrated`)
  const entities = Object.keys(daemonDie.good.entities).filter((key) => key !== "em").sort()
  console.log(`entities  ${entities.join(" ")}`)
  const scoped = (fn) => daemonDie.datamap.shard.context(fn)
  const rows = await scoped(() => daemonDie.good.entities.mode.count())
  console.log(`modes     ${rows} rows in the daemon's own Mode table (recall + flashcard) — it records its composition`)
  console.log(`cortex    ${shape.cortex.strip(daemonDie.good.cortex).length} faculties registered`)
  stage4.note({ entities: entities.length, modes: rows })
  stage4.close()

  // ── 5 · daemon — resolve() ─────────────────────────────────────────────────
  const stage5 = span.branch("daemon.resolve")
  stage5.open()
  console.log("── 5 · daemon — resolve()")
  const mode = daemonDie.good.modes.playground.flashcard
  console.log(`pre       mode.call = ${typeof mode.call} · mode.app.view = ${typeof mode.app?.view} — the App is still a declaration`)
  await daemonDie.resolve()
  const seeded = await scoped(async () => ({ literal: await daemonDie.good.entities.literal.count(), symbol: await daemonDie.good.entities.symbol.count(), retention: await daemonDie.good.entities.retention.count() }))
  console.log(`dataset   literal ${seeded.literal} · symbol ${seeded.symbol} · retention ${seeded.retention} — first boot seeds, later boots skip`)
  console.log(`post      mode.call.load = ${typeof mode.call.load} · app.view ${mode.app.view.mount}`)
  stage5.note(seeded)
  stage5.close()

  // ── 6 · daemon — integrate() ───────────────────────────────────────────────
  const stage6 = span.branch("daemon.integrate")
  stage6.open()
  console.log("── 6 · daemon — integrate()")
  await daemonDie.integrate()
  console.log(`call      Connection ${daemonDie.connection.url.origin} — inline transmitter, same shape, no socket`)
  console.log(`prune     declaration IS ≡ database WAS — nothing removed`)
  stage6.close()

  // ── 7 · runtime — resolve() ────────────────────────────────────────────────
  const stage7 = span.branch("runtime.resolve")
  stage7.open()
  console.log("── 7 · runtime — resolve()")
  await die.resolve()
  const tree = shape.strip(die.good.aperture)
  const names = (node) => Object.keys(node?.branches ?? {}).sort().join(" ")
  console.log(`tree      / → ${names(tree)}`)
  console.log(`          /daemon/standalone → ${names(tree.branches.daemon.branches.standalone)}`)
  stage7.close()

  // ── 8 · the server is a function ───────────────────────────────────────────
  const stage8 = span.branch("serve")
  stage8.open()
  console.log("── 8 · the server is a function — launch is Deno.serve(port, handle)")
  const handle = shape.http(die.good.aperture)
  const get = async (path) => {
    const response = await handle(new Request(`http://internal${path}`))
    return { status: response.status, body: await response.json() }
  }

  const daemons = await get("/metadata/daemons")
  console.log(`GET  /metadata/daemons — ${daemons.status} ${JSON.stringify(daemons.body)}`)
  const guarded = await get("/daemon/standalone/metadata/modes")
  console.log(`GET  /daemon/standalone/metadata/modes — ${guarded.status} ${guarded.body?.error?.code} — mounted, routing, locked: identity comes from the lighthouse`)

  // announce, minus the socket: the exact call integrate() makes, dispatched
  // through the tree it targets — the lighthouse lives INSIDE this aperture.
  const announce = await handle(new Request("http://internal/attached/process/lighthouse/multiplayer/entities/daemon/ensure", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ data: { slug: daemonDie.slug, url: daemonDie.good.url.absolute } }),
  }))
  const registered = await announce.json()
  console.log(`POST /attached/process/lighthouse/multiplayer/entities/daemon/ensure — ${announce.status} {slug: ${JSON.stringify(registered.slug)}}`)
  console.log("UP")
  stage8.note({ daemons: daemons.status, guarded: guarded.status, announce: announce.status })
  stage8.close()

  span.close()
  await die.disintegrate()
  console.log = hooked

  if (daemons.status !== 200) throw new Error(`/metadata/daemons ${daemons.status}`)
  if (guarded.status !== 401) throw new Error(`metadata/modes expected 401, got ${guarded.status}`)
  if (announce.status !== 200) throw new Error(`announce ${announce.status}`)
  if (seeded.literal !== 2 || seeded.symbol !== 2) throw new Error(`dataset seeded ${JSON.stringify(seeded)}`)
  return span.records
}
