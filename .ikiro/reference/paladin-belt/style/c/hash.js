import { crypto, hash as hashing } from "@vivalence/typology";

const ascending = ([a], [b]) => (a < b ? -1 : 1);

export class Hash {
  constructor(paladin) {
    this.paladin = paladin;
  }

  fold(marks) {
    return marks
      .toSorted(ascending)
      .reduce((folded, [path, mark]) => hashing.string(folded + path + mark), hashing.string(""));
  }

  async mark(root, file) {
    return [file.path, await crypto.digestBytes(await Deno.readFile(`${root}/${file.path}`))];
  }

  async tree(root) {
    const files = await this.paladin.find.index(root);
    return await Promise.all(files.map((file) => this.mark(root, file)));
  }
}
