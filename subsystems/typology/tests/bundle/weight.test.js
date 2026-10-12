import { specimen, bundle } from "@vivalence/typology";
import esbuild from "esbuild";
import { join } from "@std/path";

const repository = new URL("../../../../", import.meta.url).pathname.replace(/\/$/, "");
const typology = join(repository, "subsystems/typology/mod.client.js");
const LIMIT = 1024;
const ENTRY = `import { atom } from "@vivalence/typology"; globalThis.out = atom.chain;`;

const executes = async (text) => {
  const file = await Deno.makeTempFile({ suffix: ".mjs" });
  await Deno.writeTextFile(file, text);
  await import(`file://${file}`);
  return typeof globalThis.out;
};

specimen.describe("bundle weight — atom through the barrel", { sanitizeResources: false, sanitizeOps: false }, () => {
  specimen.afterAll(async () => {
    await esbuild.stop();
  });

  specimen.it(`esbuild: atom.chain ≤ ${LIMIT} B minified and runs`, async () => {
    const result = await esbuild.build({
      stdin: { contents: ENTRY, resolveDir: repository, loader: "js" },
      bundle: true,
      write: false,
      format: "esm",
      minify: true,
      plugins: [bundle.pure],
      alias: { "@vivalence/typology": typology },
      nodePaths: [join(repository, "node_modules")],
      mainFields: ["browser", "module", "main"],
      conditions: ["browser"],
    });
    const text = result.outputFiles[0].text;
    specimen.expect(text.length).toBeLessThanOrEqual(LIMIT);
    specimen.expect(await executes(text)).toBe("function");
  });

  specimen.it(`vite: atom.chain ≤ ${LIMIT} B minified and runs`, async () => {
    const dir = await Deno.makeTempDir();
    await Deno.writeTextFile(join(dir, "atom.probe.js"), ENTRY);
    await Deno.writeTextFile(
      join(dir, "vite.config.mjs"),
      [
        `import deno from "@deno/vite-plugin";`,
        `export default {`,
        `  plugins: [deno()],`,
        `  logLevel: "error",`,
        `  resolve: { alias: { "@vivalence/typology": ${JSON.stringify(typology)} } },`,
        `  build: {`,
        `    target: "es2022",`,
        `    outDir: ${JSON.stringify(join(dir, "out"))},`,
        `    minify: true,`,
        `    lib: { entry: ${JSON.stringify(join(dir, "atom.probe.js"))}, formats: ["es"], fileName: "atom" },`,
        `    rollupOptions: { treeshake: { moduleSideEffects: (id) => !id.includes("/subsystems/typology/") } },`,
        `  },`,
        `};`,
      ].join("\n"),
    );
    const run = await new Deno.Command("deno", {
      args: ["run", "-A", "npm:vite@6.3.3", "build", "--config", join(dir, "vite.config.mjs")],
      cwd: repository,
      stdout: "piped",
      stderr: "piped",
    }).output();
    specimen.expect(run.code, new TextDecoder().decode(run.stderr)).toBe(0);
    const text = await Deno.readTextFile(join(dir, "out/atom.mjs"));
    specimen.expect(text.length).toBeLessThanOrEqual(LIMIT);
    specimen.expect(await executes(text)).toBe("function");
  });
});
