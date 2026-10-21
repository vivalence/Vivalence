import { specimen } from "@vivalence/typology";
import { fire, parts, screen } from "../scenarios/index.js";
import { oracle, shaped } from "../scenarios/shape.js";

specimen.describe("Legend — dom.js:129: .keys.kcols of edges + the leader button", () => {
  specimen.it("the design's tree and titles; a press sends the key, the last button the leader", () => {
    const pressed = [];
    const rig = screen(() => parts.Legend({ edges: [{ key: "e", label: "entity", desc: "where am I" }, { key: "q", label: "quit", desc: "" }], selected: 0, onPress: (key) => pressed.push(key) }));
    specimen.expect(shaped(rig.target)).toBe(oracle(`<div class="keys kcols"><button class="sel" data-fn="press" data-arg="e" title="e · entity · where am I"><b>e</b><span class="kl">entity</span><i>where am I</i></button><button class="" data-fn="press" data-arg="q" title="q · quit"><b>q</b><span class="kl">quit</span><i></i></button><button data-fn="press" data-arg="leader"><b>ctrl-v</b><span class="kl">palette</span><i></i></button></div>`));
    specimen.expect([...rig.target.querySelectorAll("button")].map((button) => button.getAttribute("title"))).toEqual(["e · entity · where am I", "q · quit", null]);
    for (const button of rig.target.querySelectorAll("button")) fire(button, "click");
    specimen.expect(pressed).toEqual(["e", "q", "leader"]);
    rig.close();
  });
});
