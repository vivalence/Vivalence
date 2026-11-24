// limit: 1800 chars
// probe: what the interceptor holds today — every part its fold places, count, whether a mesh or a generator draws it,
// and every part of the dataset no layer places. his dataset files, the domain's own resolve.
// run: deno run -A --no-check .ikiro/reference/m127/bill.probe.js
const DATASET = "/Users/finn/.viva/registry/droneaid/topographies/models/dataset/literals";
const { resolve } = await import("/Users/finn/.viva/registry/assembly/domain/assembly/resolve.js");

const parts = (await import(`${DATASET}/parts.js`)).default;
const placements = (await import(`${DATASET}/placements.js`)).default;
const rows = new Map([...parts, ...placements].map((one) => [one.slug, one]));

const fold = resolve(rows, "interceptor");
const counts = {};
for (const one of fold.placements) counts[one.ref] = (counts[one.ref] ?? 0) + 1;

const drawn = (trait) => (trait.MODELED?.file ? "GLB" : trait.PARAMETRIC?.generator ? "GEN" : "NONE");
for (const [slug, n] of Object.entries(counts).sort()) {
  console.log(String(n).padStart(3), drawn(fold.parts[slug] ?? {}).padEnd(5), slug);
}
console.log("missing:", fold.missing);
const placed = new Set(placements.map((one) => one.trait.PLACED.ref));
console.log("parts no layer places:", parts.filter((one) => !placed.has(one.slug)).map((one) => one.slug).join(" · "));
console.log("layers:", [...new Set(placements.map((one) => one.trait.PLACED.layer))].join(" · "));
