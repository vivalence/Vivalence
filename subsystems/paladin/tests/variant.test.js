import { specimen, Mask, v } from "@vivalence/typology";
import { Paladin, populate, resolve, integrate } from "@vivalence/paladin/typology";

const markerInline = `
export const manifest = { owner: "@vivalence", type: "variant", slug: "test", version: "0.0.1" };
export const runtime = { slug: "test-runtime", traits: ["EMBEDDED"] };
export const clients = {
  ghost: { slug: "ghost" },
  kajuit: { slug: "kajuit" },
};
export const services = [
  { slug: "multiplayer", module: "@vivalence/lighthouse/multiplayer" },
];
export const daemons = [
  { manifest: { type: "daemon", slug: "brazilian", version: "0.0.1" } },
];
`;

const markerManifestOnly = `
export const manifest = { owner: "@vivalence", type: "variant", slug: "minimal", version: "0.0.1" };
export const runtime = { slug: "minimal-runtime" };
`;

const markerDaemonTyped = `
export const manifest = { owner: "@vivalence", type: "daemon", slug: "stray", version: "0.0.1" };
`;

const markerInlineB = `
export const manifest = { owner: "@vivalence", type: "variant", slug: "test-b", version: "0.0.1" };
export const runtime = { slug: "test-runtime-b" };
`;

async function mkVariantDir(prefix, files) {
  const dir = await Deno.makeTempDir({ prefix: `paladin-variant-${prefix}-` });
  for (const [relPath, source] of Object.entries(files)) {
    const target = `${dir}/${relPath}`;
    await Deno.mkdir(target.substring(0, target.lastIndexOf("/")), { recursive: true });
    await Deno.writeTextFile(target, source);
  }
  return dir;
}

async function mkPaladin(variantDir) {
  const paladin = new Paladin();
  paladin.env.set("VIVA_VARIANT_MOUNT", variantDir);
  paladin.env.set("VIVA_REPOSITORY_MOUNT", variantDir);
  paladin.env.set("VIVA_SYSTEM_MODE", "DEVELOPMENT");
  paladin.env.set("VIVA_SYSTEM_ROLE", "SUDO");
  await populate.scopes(paladin);
  return paladin;
}

specimen.describe("resolve.variant", () => {
  specimen.describe("happy path inline", () => {
    let paladin;
    specimen.beforeAll(async () => {
      const dir = await mkVariantDir("happy", { "test.viva.js": markerInline });
      paladin = await mkPaladin(dir);
      await resolve.variant(paladin);
    });

    specimen.it("runtime populated from marker exports", () => {
      specimen.expect(paladin.variant.runtime.slug).toBe("test-runtime");
      specimen.expect(paladin.variant.runtime.traits).toContain("EMBEDDED");
    });

    specimen.it("clients populated keyed by slug", () => {
      specimen.expect(Object.keys(paladin.variant.clients).sort()).toEqual(["ghost", "kajuit"]);
    });

    specimen.it("services Mask-wrapped with mount", () => {
      specimen.expect(paladin.variant.services.length).toBe(1);
      const service = paladin.variant.services[0];
      specimen.expect(service).toBeInstanceOf(Mask);
      specimen.expect(service.slug).toBe("multiplayer");
      specimen.expect(service.mount.absolute).toContain("service_multiplayer");
    });

    specimen.it("daemons Mask-wrapped with mount", () => {
      specimen.expect(paladin.variant.daemons.length).toBe(1);
      const daemon = paladin.variant.daemons[0];
      specimen.expect(daemon).toBeInstanceOf(Mask);
      specimen.expect(daemon.slug).toBe("brazilian");
      specimen.expect(daemon.mount.absolute).toContain("daemon_brazilian");
    });
  });

  specimen.describe("omitted fields default to empty", () => {
    let paladin;
    specimen.beforeAll(async () => {
      const dir = await mkVariantDir("omitted", { "minimal.viva.js": markerManifestOnly });
      paladin = await mkPaladin(dir);
      await resolve.variant(paladin);
    });

    specimen.it("runtime present", () => {
      specimen.expect(paladin.variant.runtime.slug).toBe("minimal-runtime");
    });

    specimen.it("clients defaults to empty object", () => {
      specimen.expect(paladin.variant.clients).toEqual({});
    });

    specimen.it("services defaults to empty array", () => {
      specimen.expect(paladin.variant.services).toEqual([]);
    });

    specimen.it("daemons defaults to empty array", () => {
      specimen.expect(paladin.variant.daemons).toEqual([]);
    });
  });

  specimen.describe("no variant-typed file → throws", () => {
    specimen.it("empty variant dir throws", async () => {
      const dir = await mkVariantDir("empty", {});
      const paladin = await mkPaladin(dir);
      let err;
      try {
        await resolve.variant(paladin);
      } catch (e) {
        err = e;
      }
      specimen.expect(err).toBeDefined();
      specimen.expect(err.message).toContain("No variant manifest");
      specimen.expect(err.message).toContain(dir);
    });

    specimen.it("only daemon-typed file present → throws no-marker", async () => {
      const dir = await mkVariantDir("wrongtype", { "stray.viva.js": markerDaemonTyped });
      const paladin = await mkPaladin(dir);
      let err;
      try {
        await resolve.variant(paladin);
      } catch (e) {
        err = e;
      }
      specimen.expect(err).toBeDefined();
      specimen.expect(err.message).toContain("No variant manifest");
    });
  });

  specimen.describe("multiple variant-typed files → throws", () => {
    specimen.it("two markers throws with both paths", async () => {
      const dir = await mkVariantDir("multi", {
        "a.viva.js": markerInline,
        "b.viva.js": markerInlineB,
      });
      const paladin = await mkPaladin(dir);
      let err;
      try {
        await resolve.variant(paladin);
      } catch (e) {
        err = e;
      }
      specimen.expect(err).toBeDefined();
      specimen.expect(err.message).toContain("Multiple variant manifests");
      specimen.expect(err.message).toContain("a.viva.js");
      specimen.expect(err.message).toContain("b.viva.js");
    });
  });

  specimen.describe("marker in subdir is discovered (tree-wide scan)", () => {
    let paladin;
    specimen.beforeAll(async () => {
      const dir = await mkVariantDir("nested", { "sub/marker.viva.js": markerInline });
      paladin = await mkPaladin(dir);
      await resolve.variant(paladin);
    });

    specimen.it("runtime resolves from nested marker", () => {
      specimen.expect(paladin.variant.runtime.slug).toBe("test-runtime");
    });
  });

  specimen.describe("integrate.validate enforces circuitry schemas", () => {
    specimen.it("happy variant passes", async () => {
      const dir = await mkVariantDir("validate-ok", { "test.viva.js": markerInline });
      const paladin = await mkPaladin(dir);
      await resolve.variant(paladin);
      await integrate.validate(paladin);
    });

    specimen.it("rejects daemon missing manifest", async () => {
      const dir = await mkVariantDir("bad-daemon", {
        "test.viva.js": `
          export const manifest = { owner: "@vivalence", type: "variant", slug: "broken", version: "0.0.1" };
          export const daemons = [{ kernel: [] }];
        `,
      });
      const paladin = await mkPaladin(dir);
      await resolve.variant(paladin);
      await specimen.expect(integrate.validate(paladin)).rejects.toThrow(/daemon.*manifest/);
    });

    specimen.it("rejects service missing module", async () => {
      const dir = await mkVariantDir("bad-service", {
        "test.viva.js": `
          export const manifest = { owner: "@vivalence", type: "variant", slug: "broken", version: "0.0.1" };
          export const services = [{ slug: "no-module" }];
        `,
      });
      const paladin = await mkPaladin(dir);
      await resolve.variant(paladin);
      await specimen.expect(integrate.validate(paladin)).rejects.toThrow(/service.*module/);
    });
  });

  specimen.describe("bak/ subdir is skipped", () => {
    let paladin;
    specimen.beforeAll(async () => {
      const dir = await mkVariantDir("bakskip", {
        "test.viva.js": markerInline,
        "bak/stray.viva.js": markerInlineB,
      });
      paladin = await mkPaladin(dir);
      await resolve.variant(paladin);
    });

    specimen.it("bak marker ignored — root marker wins", () => {
      specimen.expect(paladin.variant.runtime.slug).toBe("test-runtime");
    });
  });
});
