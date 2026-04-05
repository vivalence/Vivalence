import { specimen, Env, Path, Mask } from "@vivalence/typology"
import { Paladin, Vip, Pensieve } from "@vivalence/paladin/typology"
import { populate, resolve, integrate } from "@vivalence/paladin/typology"

let paladin

specimen.describe("paladin", () => {

  specimen.describe("construction", () => {
    specimen.it("fresh Paladin has empty env, empty variant, belt attached", () => {
      paladin = new Paladin()
      specimen.expect(paladin.env).toBeInstanceOf(Env)
      specimen.expect(paladin.secret).toBeInstanceOf(Env)
      specimen.expect(paladin.variant.daemons).toEqual([])
      specimen.expect(paladin.variant.services).toEqual([])
      specimen.expect(paladin.variant.circuitry).toEqual([])
      specimen.expect(typeof paladin.read.json).toBe("function")
      specimen.expect(typeof paladin.read.viva).toBe("function")
      specimen.expect(typeof paladin.find.viva).toBe("function")
      specimen.expect(typeof paladin.find.json).toBe("function")
      specimen.expect(typeof paladin.check.env).toBe("function")
      specimen.expect(typeof paladin.state.dir).toBe("function")
    })
  })

  specimen.describe("population", () => {
    specimen.it("env loads VIVA_ vars from .env and process env", async () => {
      await populate.env(paladin)
      specimen.expect(paladin.env.has("VIVA_SYSTEM_MODE")).toBe(true)
      specimen.expect(paladin.env.has("VIVA_SYSTEM_ROLE")).toBe(true)
      specimen.expect(paladin.env.has("VIVA_SYSTEM_MOUNT")).toBe(true)
      specimen.expect(paladin.env.has("VIVA_VARIANT_MOUNT")).toBe(true)
    })

    specimen.it("scopes register conditional Path accessors", async () => {
      await populate.scopes(paladin)
      specimen.expect(paladin.scope.system).toBeInstanceOf(Path)
      specimen.expect(paladin.scope.registry).toBeInstanceOf(Path)
      specimen.expect(paladin.scope.variant).toBeInstanceOf(Path)
      specimen.expect(paladin.scope.circuitry).toBeInstanceOf(Path)
      specimen.expect(paladin.scope.environment).toBeInstanceOf(Path)
      specimen.expect(paladin.scope.mountpoint).toBeInstanceOf(Path)
      specimen.expect(paladin.scope.nonexistent).toBeUndefined()
    })

    specimen.it("scopes derive from env mounts", () => {
      specimen.expect(paladin.scope.system.absolute).toBe(paladin.env.get("VIVA_SYSTEM_MOUNT"))
      specimen.expect(paladin.scope.variant.absolute).toBe(paladin.env.get("VIVA_VARIANT_MOUNT"))
      specimen.expect(paladin.scope.registry.absolute).toContain("registry")
      specimen.expect(paladin.scope.circuitry.absolute).toContain("circuitry")
    })

    specimen.it("legacy aliases resolve to same paths", () => {
      specimen.expect(paladin.scope.tilde.absolute).toBe(paladin.scope.variant.absolute)
      specimen.expect(paladin.scope.circuits.absolute).toBe(paladin.scope.circuitry.absolute)
    })

    specimen.it("environment loads jsonc files into env, secrets into secret", async () => {
      await populate.environment(paladin)
      specimen.expect(paladin.env.has("VIVA_RUNTIME_SERVE")).toBe(true)
      specimen.expect(paladin.env.has("PUBLIC_VIVA_RUNTIME_REMOTE")).toBe(true)
      specimen.expect(paladin.env.has("SERVICE_NLP_PORT")).toBe(true)
      specimen.expect(paladin.secret.has("SECRET_VIVA_JWT")).toBe(true)
      specimen.expect(paladin.env.has("SECRET_VIVA_JWT")).toBe(false)
    })

    specimen.it("veryimportantpackage creates VIP when role is SUDO", async () => {
      await populate.veryimportantpackage(paladin)
      specimen.expect(paladin.vip).toBeInstanceOf(Vip)
      specimen.expect(paladin.vip.pensieve).toBeInstanceOf(Pensieve)
    })

    specimen.it("questions validates required env vars", async () => {
      await populate.questions(paladin)
      specimen.expect(paladin.role).toBe("SUDO")
      specimen.expect(paladin.mode).toBe("DEVELOPMENT")
    })

    specimen.it("is predicates reflect SUDO + DEVELOPMENT", () => {
      specimen.expect(paladin.is.sudo).toBe(true)
      specimen.expect(paladin.is.dev).toBe(true)
      specimen.expect(paladin.is.citizen).toBe(true)
      specimen.expect(paladin.is.veryimportant).toBe(true)
      specimen.expect(paladin.is.prod).toBe(false)
      specimen.expect(paladin.is.client).toBe(false)
      specimen.expect(paladin.is.runtime).toBe(false)
      specimen.expect(paladin.is.deployed).toBe(false)
    })
  })

  specimen.describe("resolution", () => {
    specimen.it("circuitry discovers .viva.js circuits from circuitry scope", async () => {
      await resolve.circuitry(paladin)
      specimen.expect(paladin.variant.circuitry.length).toBe(2)
      for (const circuit of paladin.variant.circuitry) {
        specimen.expect(circuit.manifest.type).toBe("circuit")
        specimen.expect(circuit.source).toBeInstanceOf(Path)
      }
      const slugs = paladin.variant.circuitry.map(c => c.manifest.slug).sort()
      specimen.expect(slugs).toEqual(["test-daemon", "test-system"])
    })

    specimen.it("variant compiles runtime, clients, daemons, services from circuitry", async () => {
      await resolve.variant(paladin)

      specimen.expect(paladin.variant.runtime.slug).toBe("test-runtime")
      specimen.expect(paladin.variant.runtime.traits).toContain("EMBEDDED")
      specimen.expect(paladin.variant.runtime.datamap.module).toBe("@vivalence/datamap/libsql")

      specimen.expect(Object.keys(paladin.variant.clients).sort()).toEqual(["html", "shell"])
      specimen.expect(paladin.variant.clients.html.slug).toBe("html")

      specimen.expect(paladin.variant.daemons.length).toBe(1)
      specimen.expect(paladin.variant.services.length).toBe(2)
    })

    specimen.it("daemons are Masks with mount paths and full module references", () => {
      const daemon = paladin.variant.daemons[0]
      specimen.expect(daemon).toBeInstanceOf(Mask)
      specimen.expect(daemon.slug).toBe("brazilian")
      specimen.expect(daemon.mount).toBeInstanceOf(Path)
      specimen.expect(daemon.mount.absolute).toContain("daemon_brazilian")
      specimen.expect(daemon.kernel.length).toBe(5)
      specimen.expect(daemon.modes.length).toBeGreaterThan(10)
      specimen.expect(daemon.datamap.module).toBe("@vivalence/datamap/libsql")
      specimen.expect(daemon.datamap.mount.absolute).toBe(daemon.mount.absolute)
      specimen.expect(daemon.lighthouse.module).toBe("@vivalence/lighthouse/multiplayer")
      specimen.expect(daemon.hallucinator.module).toBe("@vivalence/hallucinator/hal257")
    })

    specimen.it("services are Masks with mount paths", () => {
      const slugs = paladin.variant.services.map(s => s.slug).sort()
      specimen.expect(slugs).toEqual(["multiplayer", "nlp-stanza"])
      for (const service of paladin.variant.services) {
        specimen.expect(service).toBeInstanceOf(Mask)
        specimen.expect(service.mount).toBeInstanceOf(Path)
        specimen.expect(service.mount.absolute).toContain(`service_${service.slug}`)
      }
    })
  })

  specimen.describe("integration", () => {
    specimen.it("statements creates mount directories on disk", async () => {
      await integrate.statements(paladin)
      for (const daemon of paladin.variant.daemons) {
        const stat = await Deno.stat(daemon.mount.absolute)
        specimen.expect(stat.isDirectory).toBe(true)
      }
      for (const service of paladin.variant.services) {
        const stat = await Deno.stat(service.mount.absolute)
        specimen.expect(stat.isDirectory).toBe(true)
      }
    })

    specimen.it("publish writes PUBLIC_ vars to Deno.env", async () => {
      await integrate.publish(paladin)
      specimen.expect(Deno.env.get("PUBLIC_VIVA_RUNTIME_REMOTE")).toBeDefined()
      specimen.expect(Deno.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")).toBeDefined()
      specimen.expect(Deno.env.get("PUBLIC_VIVA_CLIENT_HTML_REMOTE")).toBeDefined()
    })

    specimen.it("questions completes without error", async () => {
      await integrate.questions(paladin)
    })
  })

  specimen.describe("belt", () => {
    specimen.it("find.viva discovers .viva files, skips bak/", async () => {
      const files = await paladin.find.viva(paladin.scope.circuitry)
      specimen.expect(files.length).toBe(2)
      for (const file of files) {
        specimen.expect(file).toBeInstanceOf(Path)
        specimen.expect(file.absolute).not.toContain("/bak/")
      }
    })

    specimen.it("find.json discovers .json/.jsonc files", async () => {
      const files = await paladin.find.json(paladin.scope.environment)
      specimen.expect(files.length).toBe(3)
    })

    specimen.it("read.viva imports and casts .viva.js modules", async () => {
      const files = await paladin.find.viva(paladin.scope.circuitry)
      const circuit = await paladin.read.viva(files[0])
      specimen.expect(circuit.manifest).toBeDefined()
      specimen.expect(circuit.manifest.type).toBe("circuit")
    })

    specimen.it("read.json parses JSONC files", async () => {
      const files = await paladin.find.json(paladin.scope.environment)
      const content = await paladin.read.json(files[0])
      specimen.expect(typeof content).toBe("object")
    })

    specimen.it("check.env passes for present vars, fails for missing", () => {
      const present = paladin.check.env(["VIVA_SYSTEM_MODE", "VIVA_SYSTEM_ROLE"])
      specimen.expect(present.fails).toBe(false)

      const missing = paladin.check.env(["NONEXISTENT_VAR_THAT_DOES_NOT_EXIST"])
      specimen.expect(missing.fails).toBe(true)
    })
  })

  specimen.describe("singleton equivalence", () => {
    let singleton

    specimen.beforeAll(async () => {
      singleton = (await import("@vivalence/paladin")).default
      await singleton.ikiro
    })

    specimen.it("fresh lifecycle produces same env keys as singleton", () => {
      specimen.expect(Object.keys(paladin.env.vars).sort()).toEqual(Object.keys(singleton.env.vars).sort())
    })

    specimen.it("fresh lifecycle produces same variant shape as singleton", () => {
      specimen.expect(paladin.variant.daemons.length).toBe(singleton.variant.daemons.length)
      specimen.expect(paladin.variant.services.length).toBe(singleton.variant.services.length)
      specimen.expect(paladin.variant.runtime.slug).toBe(singleton.variant.runtime.slug)
      specimen.expect(Object.keys(paladin.variant.clients).sort()).toEqual(Object.keys(singleton.variant.clients).sort())
    })

    specimen.it("fresh lifecycle produces same scope paths as singleton", () => {
      specimen.expect(paladin.scope.system.absolute).toBe(singleton.scope.system.absolute)
      specimen.expect(paladin.scope.variant.absolute).toBe(singleton.scope.variant.absolute)
      specimen.expect(paladin.scope.circuitry.absolute).toBe(singleton.scope.circuitry.absolute)
    })
  })
})
