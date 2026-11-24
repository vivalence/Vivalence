import { crypto, hash as hashing } from "@vivalence/typology";

export const hash = (paladin) => {
  paladin.hash = {
    tree: async (root) =>
      await Promise.all(
        (await paladin.find.index(root)).map(async (file) => [
          file.path,
          await crypto.digestBytes(await Deno.readFile(`${root}/${file.path}`)),
        ]),
      ),

    fold: (marks) =>
      marks
        .toSorted(([a], [b]) => (a < b ? -1 : 1))
        .reduce((folded, [path, mark]) => hashing.string(folded + path + mark), hashing.string("")),
  };
};
