// limit: 4600 chars
// builder: the guide `soldering` onto a COPY of the droneaid package — its seed, its two pictures, the seed list,
// the seed test, the manifest's words, and its guide + six steps added to the two dataset files in the drain's own
// form. the other guides' entities are carried as they stand on disk: harvest.js is NOT run.
// run: deno run -A --no-check --config deno.jsonc .ikiro/reference/m127/soldering/soldering.build.js <root holding droneaid/> <pictures dir>
import { Datasink } from "@vivalence/typology";

const [root, pictures] = Deno.args;
const HERE = new URL(".", import.meta.url).pathname;
const GUIDES = `${root}/droneaid/topographies/guides`;
const PICTURES = ["3e32c1fc316b.webp", "6d8443726d85.webp"];

const swap = async (path, old, next, count = 1) => {
  const text = await Deno.readTextFile(`${GUIDES}/${path}`);
  const hits = text.split(old).length - 1;
  if (hits !== count) throw new Error(`${path}: ${hits} hits, wanted ${count}, of ${old.slice(0, 60)}`);
  await Deno.writeTextFile(`${GUIDES}/${path}`, text.replaceAll(old, next));
};

await Deno.copyFile(`${HERE}soldering.js`, `${GUIDES}/harvest/soldering.js`);
for (const name of PICTURES) await Deno.copyFile(`${pictures}/${name}`, `${GUIDES}/freight/manual/${name}`);

await swap("harvest/harvest.js", 'import * as mari from "./mari.js";\n', 'import * as mari from "./mari.js";\nimport * as soldering from "./soldering.js";\n');
await swap("harvest/harvest.js", "[quadrocopter, mari]", "[quadrocopter, mari, soldering]", 2);
await swap("tests/harvest.test.js", 'import * as mari from "../harvest/mari.js";\n', 'import * as mari from "../harvest/mari.js";\nimport * as soldering from "../harvest/soldering.js";\n');
await swap(
  "tests/harvest.test.js",
  '    expect(own.every((step) => !step.trait.LABELED.description.includes("Manual p"))).toBe(true);\n',
  '    expect(own.every((step) => !step.trait.LABELED.description.includes("Manual p"))).toBe(true);\n' +
    "    const joints = stepRows(soldering);\n" +
    "    expect(joints.length).toBe(6);\n" +
    "    expect(installs(joints)).toEqual([]);\n" +
    "    expect(guideRow(soldering).trait.SEQUENCED.subject).toBe(undefined);\n" +
    "    expect(guideRow(soldering).uses.map((one) => one.slug)).toEqual(joints.map((step) => step.slug));\n",
);
await swap(
  "guides.viva.js",
  "manual over the quadro, and mari, the Mari Drone manual over the interceptor; the manuals' pages on the freight. ",
  "manual over the quadro, mari, the Mari Drone manual over the interceptor, and soldering, the soldering checklist over no body; " +
    "the manuals' pages on the freight. ",
);

const ordered = (value) =>
  Array.isArray(value)
    ? value.map(ordered)
    : value && typeof value === "object"
      ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, ordered(value[key])]))
      : value;
const same = (rows) => JSON.stringify(ordered([...rows].sort((a, b) => (a.slug < b.slug ? -1 : 1))));

const { guideRow, stepRows } = await import(`${GUIDES}/harvest/rows.js`);
const soldering = await import(`${GUIDES}/harvest/soldering.js`);
const added = { "guides.js": [guideRow(soldering)], "steps.js": stepRows(soldering) };
for (const [file, rows] of Object.entries(added)) {
  const path = `${GUIDES}/dataset/literals/${file}`;
  const held = (await import(path)).default;
  const scratch = await Deno.makeTempFile({ suffix: ".js" });
  await Deno.writeTextFile(scratch, Datasink.canonical(held, "js"));
  const drained = (await import(scratch)).default;
  if (same(drained) !== same(held)) throw new Error(`${file}: the drain's form changes an entity — nothing written`);
  if (held.some((one) => rows.some((row) => row.slug === one.slug))) throw new Error(`${file}: holds a soldering entity already`);
  await Deno.writeTextFile(path, Datasink.canonical([...held, ...rows], "js"));
  console.log(JSON.stringify({ file, was: held.length, now: held.length + rows.length }));
}
