// limit: 2200 chars
// probe: a piece's own colour through the fold and into the stage's node, his dataset, base against edit.
// the part `hinge` is given "#e8590c", the placement `tail.hinge.1` "warning": in the probe's rows only.
// run: deno run -A --no-check .ikiro/reference/m127/colour.probe.js <root holding base/ and edit/> <out dir>
const [root, out] = Deno.args;
const DATASET = "/Users/finn/.viva/registry/droneaid/topographies/models/dataset/literals";

const parts = (await import(`${DATASET}/parts.js`)).default;
const placements = (await import(`${DATASET}/placements.js`)).default;
const rows = new Map(structuredClone([...parts, ...placements]).map((one) => [one.slug, one]));

rows.get("hinge").trait.STAGED = { colour: "#e8590c" };
rows.get("tail.hinge.1").trait.STAGED = { colour: "warning" };

const SHOWN = ["tail.hinge.0", "tail.hinge.1", "tail.tail_half_a.0"];

for (const side of ["base", "edit"]) {
  const { resolve } = await import(`${root}/${side}/assembly/domain/assembly/resolve.js`);
  const { entries } = await import(`${root}/${side}/assembly/modes/guide/editor/buffer/kit/frames.js`);
  const fold = resolve(rows, "interceptor");
  const nodes = entries(fold, { asset: (file) => file }).flatMap((entry) => entry.nodes);
  for (const slug of SHOWN) {
    const placed = fold.placements.find((one) => one.slug === slug);
    const node = nodes.find((one) => one.slug === slug);
    await Deno.writeTextFile(`${out}/${side}.${slug}.placement.json`, JSON.stringify(placed, null, 2));
    await Deno.writeTextFile(`${out}/${side}.${slug}.node.json`, JSON.stringify(node, null, 2));
  }
  console.log(side, fold.placements.length, "placements", fold.placements.filter((one) => one.colour).length, "wear a colour");
}
