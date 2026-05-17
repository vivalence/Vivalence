import { assertEquals, assertRejects } from "@std/assert"
import { Vector, Signal, steer } from "@vivalence/typology"
import paladin from "@vivalence/paladin"
import { init } from "../trajectories/instance/init.js"

await paladin.ikiro

const VARIANT_MANIFEST = `export const manifest = { owner: "@vivalence", type: "variant", slug: "fixture", version: "0.0.1" };`
const ALT_VARIANT_MANIFEST = `export const manifest = { owner: "@vivalence", type: "variant", slug: "alt", version: "0.0.1" };`
const DAEMON_MANIFEST = `export const manifest = { owner: "@vivalence", type: "daemon", slug: "stray", version: "0.0.1" };`

async function mkTree(prefix, files = {}) {
  const dir = await Deno.makeTempDir({ prefix: `ghost-init-${prefix}-` })
  for (const [relPath, source] of Object.entries(files)) {
    const target = `${dir}/${relPath}`
    const parent = target.substring(0, target.lastIndexOf("/"))
    await Deno.mkdir(parent, { recursive: true })
    await Deno.writeTextFile(target, source)
  }
  return dir
}

async function readTree(dir) {
  const out = []
  async function walk(d, prefix) {
    for await (const entry of Deno.readDir(d)) {
      const name = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.isDirectory) await walk(`${d}/${entry.name}`, name)
      else out.push(name)
    }
  }
  await walk(dir, "")
  return out.sort()
}

function cast(ctx) {
  const trajectory = new Vector()
  const instance = trajectory.branch("/instance")
  init(instance)
  return steer.invoke(trajectory, new Signal("/instance/init"), steer.direct)(ctx)
}

Deno.test("init: happy path — wafer copied to dest", async () => {
  const source = await mkTree("happy-src", {
    "fixture.viva.js": VARIANT_MANIFEST,
    "environment/variant.jsonc": "{}",
  })
  const dest = await Deno.makeTempDir({ prefix: "ghost-init-happy-dest-" })

  const result = await cast({ argv: [source, dest], flags: {}, body: {} })

  assertEquals(result.status, "INSTALLED")
  assertEquals(result.type, "variant")
  assertEquals(result.destination, dest)
  assertEquals(result.files, ["environment/variant.jsonc", "fixture.viva.js"])

  const copied = await readTree(dest)
  assertEquals(copied, ["environment/variant.jsonc", "fixture.viva.js"])
})

Deno.test("init: missing slug throws usage", async () => {
  await assertRejects(
    () => cast({ argv: [], flags: {}, body: {} }),
    Error,
    "usage:",
  )
})

Deno.test("init: dest with variant marker → refused without --force", async () => {
  const source = await mkTree("collide-src", { "fixture.viva.js": VARIANT_MANIFEST })
  const dest = await mkTree("collide-dest", { "existing.viva.js": ALT_VARIANT_MANIFEST })

  await assertRejects(
    () => cast({ argv: [source, dest], flags: {}, body: {} }),
    Error,
    "destination already contains a variant marker",
  )
})

Deno.test("init: --force wipes existing tree + reinstalls", async () => {
  const source = await mkTree("force-src", {
    "fixture.viva.js": VARIANT_MANIFEST,
    "environment/variant.jsonc": "{}",
  })
  const dest = await mkTree("force-dest", {
    "existing.viva.js": ALT_VARIANT_MANIFEST,
    "stale/leftover.txt": "to be wiped",
  })

  const result = await cast({ argv: [source, dest], flags: { force: true }, body: {} })

  assertEquals(result.status, "INSTALLED")
  const copied = await readTree(dest)
  assertEquals(copied, ["environment/variant.jsonc", "fixture.viva.js"])
})

Deno.test("init: dest with unrelated files but no variant marker → merges", async () => {
  const source = await mkTree("merge-src", { "fixture.viva.js": VARIANT_MANIFEST })
  const dest = await mkTree("merge-dest", {
    "scratch.txt": "unrelated",
    "subdir/file.txt": "more unrelated",
  })

  const result = await cast({ argv: [source, dest], flags: {}, body: {} })

  assertEquals(result.status, "INSTALLED")
  const copied = await readTree(dest)
  assertEquals(copied, ["fixture.viva.js", "scratch.txt", "subdir/file.txt"])
})

Deno.test("init: variant marker inside bak/ is ignored during collision scan", async () => {
  const source = await mkTree("bak-src", { "fixture.viva.js": VARIANT_MANIFEST })
  const dest = await mkTree("bak-dest", {
    "bak/stashed.viva.js": ALT_VARIANT_MANIFEST,
  })

  const result = await cast({ argv: [source, dest], flags: {}, body: {} })

  assertEquals(result.status, "INSTALLED")
})

Deno.test("init: daemon-typed .viva.js does NOT trigger collision", async () => {
  const source = await mkTree("daemon-src", { "fixture.viva.js": VARIANT_MANIFEST })
  const dest = await mkTree("daemon-dest", { "stray.viva.js": DAEMON_MANIFEST })

  const result = await cast({ argv: [source, dest], flags: {}, body: {} })

  assertEquals(result.status, "INSTALLED")
})

Deno.test("init: source path doesn't exist → throws", async () => {
  const dest = await Deno.makeTempDir({ prefix: "ghost-init-nosrc-dest-" })

  await assertRejects(
    () => cast({ argv: ["/nonexistent/wafer/path", dest], flags: {}, body: {} }),
    Error,
  )
})

Deno.test("init: dest created when missing", async () => {
  const source = await mkTree("mkdir-src", { "fixture.viva.js": VARIANT_MANIFEST })
  const parent = await Deno.makeTempDir({ prefix: "ghost-init-mkdir-parent-" })
  const dest = `${parent}/freshly-created`

  const result = await cast({ argv: [source, dest], flags: {}, body: {} })

  assertEquals(result.status, "INSTALLED")
  assertEquals(result.destination, dest)
  const copied = await readTree(dest)
  assertEquals(copied, ["fixture.viva.js"])
})

Deno.test("init: nested wafer tree copied recursively", async () => {
  const source = await mkTree("nested-src", {
    "fixture.viva.js": VARIANT_MANIFEST,
    "environment/variant.jsonc": '{ "VIVA_RUNTIME_SERVE": "http://localhost:2501" }',
    "environment/secrets.jsonc": "{}",
    "environment/services.jsonc": "{}",
  })
  const dest = await Deno.makeTempDir({ prefix: "ghost-init-nested-dest-" })

  const result = await cast({ argv: [source, dest], flags: {}, body: {} })

  assertEquals(result.status, "INSTALLED")
  const copied = await readTree(dest)
  assertEquals(copied, [
    "environment/secrets.jsonc",
    "environment/services.jsonc",
    "environment/variant.jsonc",
    "fixture.viva.js",
  ])
})
