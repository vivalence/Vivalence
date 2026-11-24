import { specimen, steer, ToolCall, Vector } from "@vivalence/typology";

const named = (steps) => {
  const underscored = steps.map((step) => step.nature).filter((nature) => nature.includes("_"));
  if (underscored.length) throw new Error(`a tool step carries "_": ${underscored.join(" · ")}`);
  return new ToolCall(steps).name;
};

specimen.it("Q39A (R8) — a tool step never carries _; every name round-trips", () => {
  const armed = new Vector();
  armed.branch("/teacher/word_list").open({ nature: "/deal" }, () => ({}));
  armed.branch("/teacher/francesca").open({ nature: "/drill" }, () => ({}));
  const verdicts = steer.trie.leaves(armed).map(({ steps }) => {
    try {
      const name = named(steps);
      return { name, back: new ToolCall(name).signal.pathname };
    } catch (error) {
      return { refused: error.message };
    }
  });
  console.log(JSON.stringify(verdicts, null, 2));
  specimen.expect(verdicts[1].back).toBe("/teacher/francesca/drill");
});
