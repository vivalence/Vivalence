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
  specimen.it("a grip is a bare span.dgrip naming its edges; a float sits in its corner until placed, min folds it to 280 wide and auto tall", () => {
    const rig = screen(() => parts.Grip({ edges: ["bottom", "right"], onGrip: () => {} }));
    specimen.expect(rig.target.innerHTML).toBe('<span class="dgrip bottom right" data-fn="dockresize" aria-hidden="true"></span>');
    rig.close();
    specimen.expect(parts.GRIPS.map((edges) => edges.join(" "))).toEqual([
      "top",
      "right",
      "bottom",
      "left",
      "top left",
      "top right",
      "bottom left",
      "bottom right",
    ]);
    specimen.expect(parts.perch("left", null, false)).toEqual({ position: "absolute", left: "12px", bottom: "12px" });
    specimen.expect(parts.perch("right", { x: 10, y: 20, w: 400, h: 300 }, true)).toEqual({
      position: "absolute",
      left: "10px",
      top: "20px",
      width: "280px",
      height: "auto",
      "max-width": "calc(100% - 10px)",
      "max-height": "calc(100% - 20px)",
    });
    specimen.expect([parts.perch("top", null, false), parts.perch("bottom", null, false)]).toEqual([{ position: "absolute", right: "12px", top: "12px" }, { position: "absolute", right: "12px", bottom: "12px" }]);
    specimen.expect(() => parts.perch("middle", null, false)).toThrow("no corner for \"middle\"");
  });

  specimen.it("a placed float never leaves its room: its box is capped at the room left of and below its corner, its own size kept", () => {
    specimen.expect(parts.perch("right", { x: 700, y: 450, w: 400, h: 300 }, false)).toEqual({
      position: "absolute",
      left: "700px",
      top: "450px",
      width: "400px",
      height: "300px",
      "max-width": "calc(100% - 700px)",
      "max-height": "calc(100% - 450px)",
    });
  });

  specimen.it("a drag within 48px of a wall names that side, live and at release; the middle and a folded float name none", () => {
    const room = sized(document.createElement("div"));
    const float = document.createElement("section");
    room.append(float);
    document.body.append(room);
    const down = { target: float, preventDefault: () => {}, clientX: 500, clientY: 110 };
    const walked = (min, pointers) => {
      const live = [];
      const released = [];
      parts.carry(down, ["drag"], {
        element: float,
        float: { x: 400, y: 100, w: 300, h: 200 },
        min,
        onMove: (moved, zone) => live.push(zone),
        onDrop: (moved, zone) => released.push(zone),
      });
      for (const [clientX, clientY] of pointers) fire(window, "pointermove", { clientX, clientY });
      fire(window, "pointerup");
      return { live, released };
    };
    const WALLS = [[40, 250], [960, 250], [500, 40], [500, 460]];
    specimen.expect(walked(false, [...WALLS, [10, 10], [990, 490], [500, 250]])).toEqual({
      live: ["left", "right", "top", "bottom", "left", "right", null],
      released: [null],
    });
    specimen.expect(walked(false, [[500, 250], [500, 470]]).released).toEqual(["bottom"]);
    specimen.expect(walked(false, [[49, 250], [951, 250], [500, 49], [500, 451]]).live).toEqual([null, null, null, null]);
    specimen.expect(walked(true, WALLS)).toEqual({ live: [null, null, null, null], released: [null] });
    room.remove();
  });

  specimen.it("every grip moves its own edges and no other; a pull stops at 260 by 160 and at the room's walls; a squeezed float resizes from its shown box", () => {
    const room = sized(document.createElement("div"));
    const float = document.createElement("section");
    room.append(float);
    document.body.append(room);
    const boxed = (box) =>
      Object.defineProperties(float, {
        offsetLeft: { configurable: true, value: box.x },
        offsetTop: { configurable: true, value: box.y },
        offsetWidth: { configurable: true, value: box.w },
        offsetHeight: { configurable: true, value: box.h },
      });
    const down = { target: float, preventDefault: () => {}, clientX: 500, clientY: 250 };
    const pulled = (edges, dx, dy, stored) => {
      const released = [];
      parts.carry(down, edges, {
        element: float,
        float: stored,
        min: false,
        onMove: () => {},
        onDrop: (moved, zone) => released.push([moved, zone]),
      });
      fire(window, "pointermove", { clientX: 500 + dx, clientY: 250 + dy });
      fire(window, "pointerup");
      return released[0];
    };
    const START = { x: 400, y: 100, w: 300, h: 200 };
    boxed(START);
    specimen.expect(parts.GRIPS.map((edges) => pulled(edges, -50, -30, START)[0])).toEqual([
      { x: 400, y: 70, w: 300, h: 230 },
      { x: 400, y: 100, w: 260, h: 200 },
      { x: 400, y: 100, w: 300, h: 170 },
      { x: 350, y: 100, w: 350, h: 200 },
      { x: 350, y: 70, w: 350, h: 230 },
      { x: 400, y: 70, w: 260, h: 230 },
      { x: 350, y: 100, w: 350, h: 170 },
      { x: 400, y: 100, w: 260, h: 170 },
    ]);
    specimen.expect(pulled(["top", "left"], -900, -900, START)).toEqual([{ x: 0, y: 0, w: 700, h: 300 }, null]);
    specimen.expect(pulled(["bottom", "right"], 900, 900, START)[0]).toEqual({ x: 400, y: 100, w: 600, h: 400 });
    specimen.expect(pulled(["top", "left"], 900, 900, START)[0]).toEqual({ x: 440, y: 140, w: 260, h: 160 });
    boxed({ x: 400, y: 400, w: 300, h: 100 });
    specimen.expect(pulled(["bottom"], 0, -20, { x: 400, y: 400, w: 300, h: 520 })[0]).toEqual({ x: 400, y: 400, w: 300, h: 160 });
    specimen.expect(pulled(["top"], 0, -100, { x: 400, y: 400, w: 300, h: 520 })[0]).toEqual({ x: 400, y: 300, w: 300, h: 200 });
    room.remove();
  });
});
