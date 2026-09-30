import { Dataset, hash } from "@vivalence/typology";
import paladin from "@vivalence/paladin";

const installer = Deno.readTextFile(new URL("../../lifecycle/mode/traits/dataset.js", import.meta.url));

export const stamp = async (mode) => {
  const dataset = new Dataset(mode.module.dataset ?? {});
  const mount = mode.module.source;
  const files = [];
  for (const sources of Object.values(dataset.sources)) {
    for (const source of sources) {
      if (source.load) {
        files.push(["load", source.stamp ? String(await source.stamp(mode)) : ""]);
        continue;
      }
      if (source.rows) {
        files.push(["rows", JSON.stringify(source.rows)]);
        continue;
      }
      const at = `${mount.dirname}/${source.walk ?? source.read}`;
      if (source.walk) {
        for (const file of await paladin.find.walk(/./)(at)) {
          files.push([file.absolute, await Deno.readTextFile(file.absolute).catch(() => "")]);
        }
      } else {
        files.push([at, await Deno.readTextFile(at).catch(() => "")]);
      }
    }
  }
  return files
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .reduce((folded, [path, text]) => hash.string(folded + path + text), hash.string(await installer));
};
