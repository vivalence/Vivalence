import { crypto, hash } from "@vivalence/typology";

export default function stamp(paladin) {
  const fold = (marks) =>
    marks
      .toSorted(([a], [b]) => (a < b ? -1 : 1))
      .reduce((folded, [path, mark]) => hash.string(folded + path + mark), hash.string(""));

  const tree = async (root) =>
    await Promise.all(
      (await paladin.find.index(root)).map(async (file) => [file.path, await crypto.digestBytes(await Deno.readFile(`${root}/${file.path}`))]),
    );

  paladin.stamp = { fold, tree };
}
