import { specimen } from "@vivalence/typology";
import { document, fire, parts, screen, window } from "../scenarios/index.js";

const pane = (text) => {
  const element = document.createElement("section");
  element.textContent = text;
  return element;
};

const sized = (element) =>
  Object.defineProperty(element, "getBoundingClientRect", {
    value: () => ({ left: 0, right: 1000, top: 0, bottom: 500, width: 1000, height: 500 }),
  });

specimen.describe("Split · Seam — the design's .split and its .seam (dom.js skeleton)", () => {
  specimen.it("Split lays its children in a flex row by direction; the Seam is a bare div.seam.v", () => {
    const rig = screen(() => parts.Split({ direction: "row-reverse", children: [pane("frame"), parts.Seam({ align: "left", onDrag: () => {}, onShare: () => {}, onReset: () => {} }), pane("dock")] }));
    const split = rig.target.querySelector(".split");
    specimen.expect(split.style.flexDirection).toBe("row-reverse");
    specimen.expect(split.innerHTML).toBe('<section>frame</section><div class="seam v" data-seam="1" title="drag · double-click resets · /split"></div><section>dock</section>');
    rig.close();
  });

  specimen.it("a drag reports the live share and ONE clamped share at release; .drag while held", () => {
    const live = [];
    const shares = [];
    const rig = screen(() => parts.Split({ direction: "row", children: [pane("a"), parts.Seam({ align: "right", onDrag: (share) => live.push(share), onShare: (share) => shares.push(share), onReset: () => {} }), pane("b")] }));
    sized(rig.target.querySelector(".split"));
    const seam = rig.target.querySelector(".seam");
    fire(seam, "pointerdown", { clientX: 600, clientY: 0 });
    specimen.expect(seam.classList.contains("drag")).toBe(true);
    fire(window, "pointermove", { clientX: 500, clientY: 0 });
    fire(window, "pointermove", { clientX: 950, clientY: 0 });
    fire(window, "pointerup", { clientX: 100, clientY: 0 });
    specimen.expect(live).toEqual([0.4, 0.5, 0.2]);
    specimen.expect(shares).toEqual([0.8]);
    specimen.expect(seam.classList.contains("drag")).toBe(false);
    fire(window, "pointermove", { clientX: 500, clientY: 0 });
    specimen.expect(live.length).toBe(3);
    rig.close();
  });

  specimen.it("a left dock measures from the left edge; double-click resets", () => {
    const shares = [];
    const reset = [];
    const rig = screen(() => parts.Split({ direction: "row-reverse", children: [parts.Seam({ align: "left", onDrag: () => {}, onShare: (share) => shares.push(share), onReset: () => reset.push(1) })] }));
    sized(rig.target.querySelector(".split"));
    const seam = rig.target.querySelector(".seam");
    fire(seam, "pointerdown", { clientX: 300, clientY: 0 });
    fire(window, "pointerup", { clientX: 300, clientY: 0 });
    fire(seam, "dblclick");
    specimen.expect([shares, reset]).toEqual([[0.3], [1]]);
    rig.close();
  });

  specimen.it("a top or bottom seam runs h and measures along y; an align with no seam is loud; clamps to 20–80", () => {
    const rig = screen(() => parts.Split({ direction: "column", children: [parts.Seam({ align: "top", onDrag: () => {}, onShare: () => {}, onReset: () => {} })] }));
    specimen.expect(rig.target.querySelector(".seam").classList.contains("h")).toBe(true);
    rig.close();
    specimen.expect([parts.ALONG.top({ top: 0, height: 500 }, { clientY: 150 }), parts.ALONG.bottom({ bottom: 500, height: 500 }, { clientY: 150 })]).toEqual([0.3, 0.7]);
    const loud = screen(() => parts.Split({ direction: "column", children: [parts.Seam({ align: "middle", onDrag: () => {}, onShare: () => {}, onReset: () => {} })] }));
    sized(loud.target.querySelector(".split"));
    specimen.expect(() => fire(loud.target.querySelector(".seam"), "pointerdown", { clientX: 0, clientY: 0 })).toThrow("no seam along \"middle\"");
    loud.close();
    specimen.expect([parts.clamp(0), parts.clamp(0.5), parts.clamp(1)]).toEqual([0.2, 0.5, 0.8]);
  });
});

specimen.describe("Float — the messenger's grip, corner, drag and resize (dom.js skeleton · app.js dockdrag)", () => {
  specimen.it("the grip is a bare span.dgrip; a float sits in its corner until placed, min folds it to 280 wide and auto tall", () => {
    const rig = screen(() => parts.Grip({ onGrip: () => {} }));
    specimen.expect(rig.target.innerHTML).toBe('<span class="dgrip" data-fn="dockresize" aria-hidden="true"></span>');
    rig.close();
    specimen.expect(parts.perch("left", null, false)).toEqual({ position: "absolute", left: "12px", bottom: "12px" });
    specimen.expect(parts.perch("right", { x: 10, y: 20, w: 400, h: 300 }, true)).toEqual({ position: "absolute", left: "10px", top: "20px", width: "280px", height: "auto" });
    specimen.expect([parts.perch("top", null, false), parts.perch("bottom", null, false)]).toEqual([{ position: "absolute", right: "12px", top: "12px" }, { position: "absolute", right: "12px", bottom: "12px" }]);
    specimen.expect(() => parts.perch("middle", null, false)).toThrow("no corner for \"middle\"");
  });
});
