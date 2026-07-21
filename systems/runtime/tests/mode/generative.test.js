import { specimen, Vector, Mode, Aperture, Path, shape, shard } from "@vivalence/typology";
import { GENERATIVE } from "@vivalence/runtime/daemon/traits";

function buildMode({ generator, slug = "gen-test" } = {}) {
  const mode = new Mode({ manifest: { type: "chaosmonkey", slug, traits: ["GENERATIVE"] } });
  mode.aperture = new Aperture();
  mode.mount = new Path(`/mode/chaosmonkey/${slug}`);
  if (generator) mode.module.generator = generator;
  return mode;
}

function buildDaemon(directory) {
  return { mountpoint: { absolute: directory } };
}

function provision(mode, daemon) {
  mode.tools = new Vector();
  mode.tools.use(shard.context.bind("daemon", daemon));
  mode.tools.use(shard.context.bind("mode", mode));
}

let directory;

specimen.describe("GENERATIVE tool supply", { sanitizeResources: false, sanitizeOps: false }, () => {
  specimen.beforeAll(async () => {
    directory = await Deno.makeTempDir({ prefix: "generative-" });
  });
  specimen.afterAll(async () => {
    await Deno.remove(directory, { recursive: true });
  });

  specimen.it("a mode-exported generator replaces the fallback", async () => {
    const generator = new Vector();
    generator.branch("/view").open({ nature: "/render" }, () => "sentinel");
    const mode = buildMode({ generator, slug: "authored" });
    const daemon = buildDaemon(directory);
    provision(mode, daemon);

    await GENERATIVE(mode, daemon);

    const call = shape.object(mode.tools);
    specimen.expect(await call.view.render({})).toBe("sentinel");
    specimen.expect(call.view.inspect).toBe(undefined);
    specimen.expect(typeof mode.gen.bundle).toBe("function");
    specimen.expect(typeof mode.gen.buffer).toBe("function");
  });

  specimen.it("a bare GENERATIVE mode gets the fallback render + inspect", async () => {
    const mode = buildMode({ slug: "bare" });
    const daemon = buildDaemon(directory);
    provision(mode, daemon);

    await GENERATIVE(mode, daemon);

    const call = shape.object(mode.tools);
    specimen.expect(typeof call.view.render).toBe("function");
    specimen.expect(typeof call.view.inspect).toBe("function");

    const inspected = await call.view.inspect({ hash: "f".repeat(64) });
    specimen.expect(inspected.message).toContain("unknown view");

    const refused = await call.view.render({ source: "" });
    specimen.expect(refused.message).toContain("render refused");
  });
});
