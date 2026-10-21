import { is, Vector } from "@vivalence/typology";

const DIALECTS = [
  [(attrs) => is.string(attrs.description), (attrs) => ({ valence: attrs.description, load: "lazy" })],
  [() => true, (attrs) => attrs],
];

const sniff = (attrs) => DIALECTS.find(([test]) => test(attrs))[1](attrs);

export default function prime(paladin) {
  const directory = async (path) => {
    const primer = new Vector();
    const files = (await paladin.find.walk(/\.md$/)(path)).sort((a, b) => (a.absolute < b.absolute ? -1 : 1));
    for (const file of files) {
      const { attrs } = await paladin.read.frontmatter(file);
      const nature = file.absolute.slice(path.absolute.length + 1).replace(/\.md$/, "");
      primer.open({ ...sniff(attrs), nature }, async () => (await paladin.read.frontmatter(file)).body);
    }
    return primer;
  };

  paladin.prime = { directory };
}
