import { Signal, specimen, ToolCall } from "@vivalence/typology";

const natures = (reference) => new Signal(reference).array.map((step) => step.nature);
const within = (inner, outer) => natures(outer).every((nature, index) => natures(inner)[index] === nature);
const named = (reference) => new ToolCall(natures(reference).map((nature) => ({ nature }))).name;
const tail = (reference, from) => `/${natures(reference).slice(natures(from).length).join("/")}`;

const readings = (thread, reference) => [reference, `${thread.daemon}/mode${reference}`, `${thread.mode}${reference}`];
const project = (thread, absolute) => {
  if (within(absolute, thread.mode)) return tail(absolute, thread.mode);
  if (within(absolute, `${thread.daemon}/mode`)) return tail(absolute, `${thread.daemon}/mode`);
  return absolute;
};

const mint = (tooled, absolute) => {
  const steps = natures(absolute);
  const taken = Object.values(tooled).map((held) => held.as);
  for (let size = 1; size <= steps.length; size++) {
    const as = `/${steps.slice(-size).join("/")}`;
    if (!taken.includes(as)) return { ...tooled, [absolute]: { load: "eager", as } };
  }
  throw new Error(`no free name for ${absolute}`);
};

const widths = {
  flat: (thread, absolute) => natures(absolute).map((nature, index, steps) => `/${steps.slice(-(index + 1)).join("/")}`),
  nested: (thread, absolute) => [project(thread, absolute), absolute],
  deep: (thread, absolute) => [absolute],
};
const minted = (slugging, thread) => (tooled, absolute) => {
  const taken = Object.values(tooled).map((held) => held.as);
  const as = widths[slugging](thread, absolute).find((candidate) => !taken.includes(candidate));
  return { ...tooled, [absolute]: { load: "eager", as } };
};

const loads = [
  "/daemon/education/mode/teacher/francesca/drill",
  "/daemon/education/mode/tactic/harvest/drain",
  "/daemon/chess/mode/teacher/francesca/drill",
  "/runtime/runtime/mode/harness/runtime/fs",
];
const leaves = { "/runtime/runtime/mode/harness/runtime/fs": ["/read", "/write"] };
const declared = (reference, name) => (leaves[reference] ?? [""]).map((leaf) => named(`${name}${leaf}`));
const francesca = { daemon: "/daemon/education", mode: "/daemon/education/mode/teacher/francesca" };
const harvest = { daemon: "/daemon/education", mode: "/daemon/education/mode/tactic/harvest" };
const coach = { daemon: "/daemon/chess", mode: "/daemon/chess/mode/teacher/coach" };

specimen.describe("three ways to name a loaded tool", () => {
  specimen.it("the same four loads, the thread moving francesca → harvest → chess", () => {
    const out = [""];
    const sum = (names) => names.join("").length;
    const absolute = loads.flatMap((reference) => declared(reference, reference));
    out.push(`A absolute · ${sum(absolute)} chars · every thread`, ...absolute.map((name) => `  ${name}`));
    for (const [label, thread] of [["francesca", francesca], ["harvest", harvest], ["chess coach", coach]]) {
      const names = loads.flatMap((reference) => declared(reference, project(thread, reference)));
      out.push(`B projected · ${sum(names)} chars · thread ${label}`, ...names.map((name) => `  ${name}`));
      for (const reference of loads) {
        const back = readings(thread, project(thread, reference)).filter((reading) => loads.includes(reading));
        specimen.expect(back).toEqual([reference]);
      }
    }
    const tooled = loads.reduce(mint, {});
    const aliased = loads.flatMap((reference) => declared(reference, tooled[reference].as));
    out.push(`C aliased · ${sum(aliased)} chars · every thread`, ...aliased.map((name) => `  ${name}`), JSON.stringify({ TOOLED: tooled }, null, 2));
    for (const slugging of ["flat", "nested", "deep"]) {
      const held = loads.reduce(minted(slugging, francesca), {});
      const names = loads.flatMap((reference) => declared(reference, held[reference].as));
      out.push(`C · ${slugging} · ${sum(names)} chars · minted at thread francesca, kept on every thread`, ...names.map((name) => `  ${name}`));
    }
    console.log(out.join("\n"));
  });
});
