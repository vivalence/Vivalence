// limit: 1500 chars
// probe: the three stage views of an assembly package copy, bundled through paladin's own bundler
// run: deno run -A --no-check --config deno.jsonc .ikiro/reference/m127/bundle.probe.js <root holding assembly/>
import { mime } from "@vivalence/typology";
import esbuild from "esbuild";
import paladin from "/Users/finn/vivalence/code/vivalence/subsystems/paladin/mod.js";

const MODES = `${Deno.args[0]}/assembly/modes`;
const VIEWS = ["model/editor/buffer/Assembly.svelte", "guide/editor/buffer/Guide.svelte", "guide/player/buffer/Guide.svelte"];

const directory = await Deno.makeTempDir({ prefix: "stage-bundle-" });
const bundler = paladin.bundler(directory);

for (const view of VIEWS) {
  try {
    const bundle = await bundler.bundle({ mime: mime.dom.svelte, entry: `${MODES}/${view}` });
    console.log(JSON.stringify({ view, bytes: bundle.json.entries[0].bytes }));
  } catch (error) {
    console.log(JSON.stringify({ view, fault: String(error.message ?? error).slice(0, 900) }));
  }
}

await esbuild.stop();
await Deno.remove(directory, { recursive: true });
