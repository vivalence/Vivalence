// limit: 2500 chars
import paladin from "@vivalence/paladin";

const HOME = Deno.env.get("HOME");
const HOME_OF = new URL("../../../subsystems/typology/gestalten/bundle/", import.meta.url);
const ENTRY = `${HOME}/.viva/registry/education/modes/games/dojo/buffer/Dojo.svelte`;

const original = await Deno.readTextFile(new URL("svelte.js", HOME_OF));
const patched = original
  .replace(`"./importmap.js"`, JSON.stringify(new URL("importmap.js", HOME_OF).href))
  .replace(`"./pure.js"`, JSON.stringify(new URL("pure.js", HOME_OF).href))
  .replace("write: false,", "write: false, metafile: true,")
  .replace("return bundle.outputFiles;", "return bundle;");
if (patched === original || !patched.includes("metafile: true")) throw new Error("patch missed");
const copy = new URL("./metafile.patched.js", import.meta.url);
await Deno.writeTextFile(copy, patched);
try {
  const { svelte } = await import(copy.href);
  const built = await svelte(ENTRY, {
    prod: false,
    imports: {
      "@vivalence/typology": paladin.scope.repository.branch("subsystems/typology/mod.client.js").absolute,
      "@vivalence/drapes": paladin.scope.repository.branch("subsystems/drapes/mod.js").absolute,
      "@vivalence/drapes/": `${paladin.scope.repository.branch("subsystems/drapes").absolute}/`,
    },
    nodePaths: [paladin.scope.repository.branch("node_modules").absolute],
  });
  const names = Object.keys(built.metafile.inputs);
  const kinds = {};
  for (const name of names) {
    const kind = name.includes("node_modules") ? "node_modules" : name.split(":")[0].length < name.length && name.includes(":") ? `namespace ${name.split(":")[0]}` : "plain path";
    kinds[kind] = (kinds[kind] ?? 0) + 1;
  }
  console.log(JSON.stringify({
    inputs: names.length,
    kinds,
    samples: [names.find((name) => name.includes("Dojo.svelte")), names.find((name) => name.includes(":")), names.find((name) => name.includes("node_modules"))],
    outputBytes: built.outputFiles[0].text.length,
  }, null, 2));
} finally {
  await Deno.remove(copy);
  Deno.exit(0);
}
