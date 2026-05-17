import { assertEquals, assertExists } from "@std/assert"
import { Vector, Signal, steer, Mask } from "@vivalence/typology"
import { Paladin, populate, resolve } from "@vivalence/paladin/typology"
import paladin from "@vivalence/paladin"
import { fromFileUrl, dirname, resolve as resolvePath } from "@std/path"
import { init } from "../trajectories/instance/init.js"

await paladin.ikiro

const HERE = dirname(fromFileUrl(import.meta.url))
const LOCALHOST_WAFER = resolvePath(HERE, "../../../registry/wafers/@vivalence/variant/localhost")

async function installLocalhost() {
  const dest = await Deno.makeTempDir({ prefix: "ghost-wafer-localhost-" })
  const trajectory = new Vector()
  const instance = trajectory.branch("/instance")
  init(instance)
  const result = await steer.invoke(trajectory, new Signal("/instance/init"), steer.direct)({
    argv: [LOCALHOST_WAFER, dest],
    flags: {},
    body: {},
  })
  return { dest, result }
}

async function mkPaladin(variantDir) {
  const paladin = new Paladin()
  paladin.env.set("VIVA_VARIANT_MOUNT", variantDir)
  paladin.env.set("VIVA_REPOSITORY_MOUNT", variantDir)
  paladin.env.set("VIVA_SYSTEM_MODE", "DEVELOPMENT")
  paladin.env.set("VIVA_SYSTEM_ROLE", "SUDO")
  await populate.scopes(paladin)
  return paladin
}

Deno.test("localhost wafer: install produces expected tree", async () => {
  const { dest, result } = await installLocalhost()

  assertEquals(result.status, "INSTALLED")
  assertEquals(result.type, "variant")
  assertEquals(result.destination, dest)

  const expected = [
    "environment/secrets.jsonc",
    "environment/services.jsonc",
    "environment/variant.jsonc",
    "localhost.viva.js",
  ]
  assertEquals(result.files, expected)
})

Deno.test("localhost wafer: resolves into runtime/clients/services/daemons", async () => {
  const { dest } = await installLocalhost()

  const paladin = await mkPaladin(dest)
  await resolve.variant(paladin)

  assertEquals(paladin.variant.runtime.slug, "runtime")
  assertEquals(paladin.variant.runtime.traits, ["EMBEDDED"])

  assertEquals(Object.keys(paladin.variant.clients).sort(), ["ghost", "kajuit"])
  assertEquals(paladin.variant.clients.ghost.slug, "ghost")
  assertEquals(paladin.variant.clients.kajuit.slug, "kajuit")

  assertEquals(paladin.variant.services.length, 2)
  const serviceSlugs = paladin.variant.services.map((s) => s.slug).sort()
  assertEquals(serviceSlugs, ["multiplayer", "nlp-stanza"])
  for (const service of paladin.variant.services) {
    assertEquals(service instanceof Mask, true)
    assertExists(service.mount?.absolute)
  }

  assertEquals(paladin.variant.daemons.length, 1)
  const daemon = paladin.variant.daemons[0]
  assertEquals(daemon instanceof Mask, true)
  assertEquals(daemon.slug, "brazilian")
  assertEquals(daemon.kernel.length, 5)
  assertEquals(daemon.modes.length, 15)
  assertEquals(daemon.hallucinators.length, 3)
  assertExists(daemon.lighthouse)
  assertExists(daemon.datamap)
  assertExists(daemon.consume?.nlp)
})
