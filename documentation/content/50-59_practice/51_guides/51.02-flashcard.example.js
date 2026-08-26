import { Span } from "@vivalence/typology"

export const name = "51.02-flashcard"

// The standalone instance's .env, minus a machine — a scratch home under
// gitignored testament/, placeholder secrets. The scratch is wiped by
// whichever example claims it first in a capture; boots after that reuse it.
function environment() {
  if (Deno.env.get("VIVA_INSTANCE_MOUNT")) return
  const repo = new URL("../../../../", import.meta.url).pathname
  const scratch = `${repo}testament/docs-anatomy`
  try { Deno.removeSync(scratch, { recursive: true }) } catch { /* first run */ }
  Deno.mkdirSync(scratch, { recursive: true })
  Deno.env.set("VIVA_SYSTEM_MODE", "DEVELOPMENT")
  Deno.env.set("VIVA_SYSTEM_ROLE", "SUDO")
  Deno.env.set("VIVA_REPOSITORY_MOUNT", repo)
  Deno.env.set("VIVA_INSTANCE_MOUNT", `${repo}registry/viva/instance/standalone`)
  Deno.env.set("VIVA_LEDGER_MOUNT", `${scratch}/ledger`)
  Deno.env.set("VIVA_MOUNTPOINT_MOUNT", `${scratch}/mountpoint`)
  Deno.env.set("SECRET_VIVA_JWT", "docs-placeholder")
  Deno.env.set("SECRET_VIVA_ANTHROPIC_API_KEY", "docs-placeholder")
}

export async function run() {
  environment()
  const hooked = console.log // strip ANSI color codes from boot output for a clean capture
  console.log = (...args) => hooked(...args.map((arg) => (typeof arg === "string" ? arg.replace(/\x1b\[[0-9;]*m/g, "") : arg)))

  const span = new Span("flashcard")
  span.open()

  // ── boot — the whole machine, headless ─────────────────────────────────────
  const boot = span.branch("boot")
  boot.open()
  console.log("── boot — mount the instance, raise the daemon")
  console.log("          (fresh boot: daemon + lighthouse databases automigrate, the dataset seeds)")
  const { default: paladin } = await import("@vivalence/paladin")
  const { Die, Runtime } = await import("@vivalence/runtime")
  await paladin.instance.mount()
  const die = new Die({ good: new Runtime() })
  await die.populate()
  const [daemonDie] = die.good.daemons
  await daemonDie.populate()
  await daemonDie.resolve()
  await daemonDie.integrate()
  const mode = daemonDie.good.modes.playground.flashcard
  console.log(`mode      ${mode.type}/${mode.slug} · ${mode.traits.join(" ")}`)
  boot.close()

  // every call below is what the view's buffer.mode.call.* dispatches —
  // the EXPOSED proxy over the deck vector, scoped like a request.
  const scoped = (fn) => daemonDie.datamap.shard.context(fn)
  const row = (literal) => `${literal.slug.padEnd(9)} streak ${literal.retention.streak} · seen ${literal.retention.seen} · last ${literal.retention.lastSignal ?? "—"}`

  // ── pre · load the deck ────────────────────────────────────────────────────
  const pre = span.branch("load.pre")
  pre.open()
  console.log("── pre · mode.call.load()")
  const deckPre = await scoped(() => mode.call.load())
  for (const literal of deckPre.output) console.log(`deck      ${row(literal)}`)
  pre.note({ literals: deckPre.output.length })
  pre.close()

  // ── review — three verdicts ────────────────────────────────────────────────
  const reviews = span.branch("review")
  reviews.open()
  console.log("── review · mode.call.review({ literal, remembered })")
  const verdict = async (literal, remembered) => {
    const result = await scoped(() => mode.call.review({ literal, remembered }))
    console.log(`review    ${literal.padEnd(6)} ${remembered ? "remembered" : "forgot    "} → streak ${result.output.streak} · seen ${result.output.seen} · ${result.output.lastSignal}`)
    return result.output
  }
  await verdict("ciao", true)
  const ciao = await verdict("ciao", false)
  const mondo = await verdict("mondo", true)
  console.log("          streak resets on a miss — seen never lies")
  reviews.close()

  // ── post · load again ──────────────────────────────────────────────────────
  const post = span.branch("load.post")
  post.open()
  console.log("── post · mode.call.load()")
  const deckPost = await scoped(() => mode.call.load())
  for (const literal of deckPost.output) console.log(`deck      ${row(literal)}`)
  const kept = await scoped(() => daemonDie.good.entities.retention.count())
  console.log(`kept      ${kept} rows in Retention — its own entity; reboot this file, the memory stays`)
  post.note({ retention: kept })
  post.close()

  span.close()
  await die.disintegrate()
  console.log = hooked

  if (ciao.streak !== 0 || ciao.seen !== 2 || ciao.lastSignal !== "FAILURE") throw new Error(`ciao drifted: ${JSON.stringify(ciao)}`)
  if (mondo.streak !== 1 || mondo.seen !== 1) throw new Error(`mondo drifted: ${JSON.stringify(mondo)}`)
  if (kept !== 2) throw new Error(`retention rows: ${kept}`)
  return span.records
}
