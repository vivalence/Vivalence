// limit: 1500 chars
// probe: the shape of one bundle paladin's bundler makes of a svelte entry — its keys, its entries, its imports.
// run: deno run -A --no-check --config deno.jsonc .ikiro/reference/m127/bundle-shape.probe.js <svelte entry> <out dir>
import { mime } from "@vivalence/typology";
import esbuild from "esbuild";
import paladin from "/Users/finn/vivalence/code/vivalence/subsystems/paladin/mod.js";

const [entry, out] = Deno.args;
const directory = await Deno.makeTempDir({ prefix: "stage-shape-" });
const bundle = await paladin.bundler(directory).bundle({ mime: mime.dom.svelte, entry });
console.log(Object.keys(bundle), Object.keys(bundle.json));
for (const one of bundle.json.entries) {
  console.log(Object.fromEntries(Object.entries(one).map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 120) : value])));
}
for await (const file of Deno.readDir(`${directory}/bundle`)) {
  const path = `${directory}/bundle/${file.name}`;
  console.log(file.name, file.isFile ? (await Deno.stat(path)).size : "dir");
  if (file.isFile && out) await Deno.copyFile(path, `${out}/${file.name}`);
}
await esbuild.stop();
await Deno.remove(directory, { recursive: true });
