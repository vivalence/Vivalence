import { crypto, hash as hashing } from "@vivalence/typology";

const ascending = ([a], [b]) => (a < b ? -1 : 1);

export const fold = (marks) =>
  marks
    .toSorted(ascending)
    .reduce((folded, [path, mark]) => hashing.string(folded + path + mark), hashing.string(""));

const mark = async (root, file) => [
  file.path,
  await crypto.digestBytes(await Deno.readFile(`${root}/${file.path}`)),
];

export const tree = async (paladin, root) =>
  await Promise.all((await paladin.find.index(root)).map((file) => mark(root, file)));
