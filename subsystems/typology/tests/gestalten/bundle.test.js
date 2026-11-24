import { specimen, bundle } from "@vivalence/typology";
import esbuild from "esbuild";
import { join } from "@std/path";

const fixturesPath = new URL("../scenarios/fixtures/", import.meta.url).pathname;

specimen.describe("bundle", { sanitizeResources: false, sanitizeOps: false }, () => {
  specimen.afterAll(async () => {
    await esbuild.stop();
  });

  specimen.it("a svelte entry bundles with auto-pack", async () => {
    const entry = join(fixturesPath, "test-component.svelte");
    const { outputFiles } = await bundle.svelte(entry, { prod: false });
    specimen.expect(outputFiles.length).toBe(1);
    specimen.expect(outputFiles[0].text.length).toBeGreaterThan(0);
    specimen.expect(outputFiles[0].text).toContain("as default");
    specimen.expect(outputFiles[0].text).toContain("mount");
    specimen.expect(outputFiles[0].path).toBe(entry);
  });

  specimen.it("a surface's style id follows its sheet: a changed sheet lands beside the one a page still holds, an unchanged one keeps its id", async () => {
    const surface = join(await Deno.makeTempDir({ prefix: "bundle-sheet-" }), "surface.svelte");
    const nodePaths = [new URL("../../../../node_modules", import.meta.url).pathname];
    const styled = async (color) => {
      await Deno.writeTextFile(surface, `<p class="said">hello</p>\n\n<style>\n  .said {\n    color: ${color};\n  }\n</style>\n`);
      const { outputFiles } = await bundle.svelte(surface, { prod: false, nodePaths });
      return /hash: "(svelte-[a-z0-9]+)"/.exec(outputFiles[0].text)[1];
    };
    const red = await styled("red");
    specimen.expect(await styled("blue")).not.toBe(red);
    specimen.expect(await styled("red")).toBe(red);
  });
});
