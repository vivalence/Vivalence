import { specimen } from "@vivalence/typology";
import { fire, parts, screen } from "../scenarios/index.js";
import { oracle, shaped } from "../scenarios/shape.js";

specimen.describe("Catalog — dom.js:142: .pb of .prow (nat · args · val · chord), else the nothing-matches .krow", () => {
  specimen.it("the design's tree; the first row is selected; a click fills", () => {
    const filled = [];
    const rows = [{ nature: "/mode", parts: [{ t: "/", h: false }, ...parts.lit("mo", "mode")], args: "‹slug›", val: "seat a mode", chord: "ctrl-v m", cur: true }];
    const rig = screen(() => parts.Catalog({ rows, onFill: (row) => filled.push(row.nature) }));
    specimen.expect(shaped(rig.target)).toBe(oracle(`<div class="pb"><button class="prow sel" data-fn="fill" data-arg="/mode "><span class="nat">/<span class="hl">mo</span>de <span class="pri">•</span></span><span class="args">‹slug›</span><span class="val">seat a mode</span><span class="chord">ctrl-v m</span></button></div>`));
    fire(rig.target.querySelector(".prow"), "click");
    specimen.expect(filled).toEqual(["/mode"]);
    rig.close();
  });

  specimen.it("nothing matching says so", () => {
    const rig = screen(() => parts.Catalog({ rows: [] }));
    specimen.expect(shaped(rig.target)).toBe(oracle(`<div class="pb"><div class="krow"><span class="key">✕</span><span class="nm">nothing matches</span><span class="val">enter sends it anyway — the repl answers not found</span></div></div>`));
    rig.close();
  });

  specimen.it("a chooser carrying changes draws them below its options: a mode head, each reference before → after; a refusal says why", () => {
    const M = "/runtime/stub/mode/harness/stub";
    const changes = {
      said: "",
      fault: false,
      count: 1,
      head: "would change 1",
      rows: [
        { head: true, reference: M, mark: "", label: "harness/stub", sub: "runtime" },
        { head: false, reference: `${M}/fs`, mark: "○", label: "fs", sub: "● → ○" },
      ],
    };
    const items = [{ label: `${M}/fs`, signal: `/tool/unload ${M}/fs`, sub: "", cur: false, parts: [{ t: `${M}/fs`, h: false }] }];
    const drawn = screen(() => parts.Chooser({ filter: `${M}/fs`, items, changes, onPick: () => {} }));
    specimen.expect([...drawn.target.querySelectorAll(".crow.chg")].map((row) => [row.className, row.textContent])).toEqual([
      ["crow chg head", "harness/stubruntime"],
      ["crow chg", "○fs● → ○"],
    ]);
    specimen.expect(drawn.target.querySelector(".cf.chg").textContent).toBe("would change 1");
    drawn.close();
    const refused = screen(() => parts.Chooser({ filter: "/nowhere", items: [], changes: { ...changes, said: "matches nothing: /nowhere", fault: true, rows: [] }, onPick: () => {} }));
    specimen.expect([...refused.target.querySelectorAll(".crow.chg")].map((row) => [row.className, row.textContent])).toEqual([["crow chg fault", "matches nothing: /nowhere"]]);
    specimen.expect(refused.target.querySelector(".cf.chg")).toBe(null);
    refused.close();
    const plain = screen(() => parts.Chooser({ filter: "", items, onPick: () => {} }));
    specimen.expect(plain.target.querySelectorAll(".chg").length).toBe(0);
    plain.close();
  });

  specimen.it("lit splits the match out as the highlighted part", () => {
    specimen.expect(parts.lit("ode", "mode")).toEqual([{ t: "m", h: false }, { t: "ode", h: true }]);
    specimen.expect(parts.lit("", "mode")).toEqual([{ t: "mode", h: false }]);
    specimen.expect(parts.lit("zz", "mode")).toEqual([{ t: "mode", h: false }]);
  });
});
