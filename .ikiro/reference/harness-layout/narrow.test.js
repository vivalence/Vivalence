import { Signal, specimen, ToolCall } from "@vivalence/typology";

const natures = (reference) => new Signal(reference).array.map((step) => step.nature);
const within = (inner, outer) => natures(outer).every((nature, index) => natures(inner)[index] === nature);
const tail = (reference, from) => natures(reference).slice(natures(from).length);
const path = (steps) => `/${steps.join("/")}`;
const named = (reference) => new ToolCall(natures(reference).map((nature) => ({ nature }))).name;

const owner = (mode) => path(natures(mode).slice(0, 2));

const narrow = (mode, absolute) => {
  if (within(absolute, mode)) return path(tail(absolute, mode));
  const [kind, slug, , ...rest] = natures(absolute);
  if (within(absolute, owner(mode))) return path(rest);
  if (kind === "runtime") return path(["runtime", ...rest]);
  return path([kind, slug, ...rest]);
};

const widen = (mode, world, short) => {
  const [first, second, ...rest] = natures(short);
  const readings = [
    `${mode}${short}`,
    `${owner(mode)}/mode${short}`,
    first === "runtime" ? `${world.runtime}/mode${path([second, ...rest])}` : null,
    first === "daemon" ? `/daemon/${second}/mode${path(rest)}` : null,
    short,
  ];
  return readings.filter((reading) => reading && world.held.some((held) => within(reading, held)))[0];
};

const world = {
  runtime: "/runtime/runtime",
  held: [
    "/daemon/education/mode/teacher/francesca/drill",
    "/daemon/education/mode/tactic/harvest/drain",
    "/daemon/chess/mode/teacher/francesca/drill",
    "/runtime/runtime/mode/harness/runtime/fs/read",
    "/runtime/runtime/mode/harness/runtime/fs/write",
    "/runtime/runtime/mode/guide/editor/open",
  ],
};
const MODES = {
  "education · francesca": "/daemon/education/mode/teacher/francesca",
  "education · harvest": "/daemon/education/mode/tactic/harvest",
  "chess · coach": "/daemon/chess/mode/teacher/coach",
  "runtime · harness": "/runtime/runtime/mode/harness/runtime",
};

specimen.describe("narrow ⟷ widen", () => {
  specimen.it("every thread mode: names unique, each widens back to its absolute reference", () => {
    const out = [""];
    for (const [label, mode] of Object.entries(MODES)) {
      const names = world.held.map((absolute) => named(narrow(mode, absolute)));
      out.push(`mode ${label} · ${names.join("").length} chars`, ...names.map((name) => `  ${name}`));
      specimen.expect(new Set(names).size).toBe(names.length);
      for (const absolute of world.held) specimen.expect(widen(mode, world, narrow(mode, absolute))).toBe(absolute);
    }
    out.push(`absolute · ${world.held.map(named).join("").length} chars`);
    console.log(out.join("\n"));
  });
});
