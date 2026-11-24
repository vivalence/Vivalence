import { crypto, hash as hashing } from "@vivalence/typology";

const ascending = ([a], [b]) => (a < b ? -1 : 1);

const fold = (marks) =>
  marks
    .toSorted(ascending)
    .reduce((folded, [path, mark]) => hashing.string(folded + path + mark), hashing.string(""));

export const hash = (paladin) => {
  const mark = async (root, file) => [
    file.path,
    await crypto.digestBytes(await Deno.readFile(`${root}/${file.path}`)),
  ];

  const tree = async (root) =>
    await Promise.all((await paladin.find.index(root)).map((file) => mark(root, file)));

  paladin.hash = {
    tree,
    fold,
  };
};
