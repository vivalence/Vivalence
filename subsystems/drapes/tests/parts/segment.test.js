import { specimen } from "@vivalence/typology";
import { fire, parts, screen } from "../scenarios/index.js";
import { oracle, shaped } from "../scenarios/shape.js";

specimen.describe("Segment — dom.js:163 seg(id, cls, inner)", () => {
  specimen.it("is the design's button: .seg.<cls> · data-arg · aria-haspopup · aria-expanded · title; a click sends its subject", () => {
    const picked = [];
    const rig = screen(() => parts.Segment({ subject: "harness", chord: "h", cls: "har", onPick: (subject) => picked.push(subject), children: "capable · low" }));
    specimen.expect(shaped(rig.target)).toBe(oracle(`<button class="seg har " data-fn="wid" data-arg="harness" aria-haspopup="dialog" aria-expanded="false" title="harness · ctrl-v h">capable · low</button>`));
    const button = rig.target.querySelector("button.seg");
    specimen.expect([button.getAttribute("data-arg"), button.getAttribute("aria-haspopup"), button.getAttribute("aria-expanded"), button.getAttribute("title")]).toEqual(["harness", "dialog", "false", "harness · ctrl-v h"]);
    fire(button, "click");
    specimen.expect(picked).toEqual(["harness"]);
    rig.close();
  });

  specimen.it("open is a class and aria-expanded true", () => {
    const rig = screen(() => parts.Segment({ subject: "activity", chord: "a", cls: "proc cau", open: true, children: "approve match_move" }));
    const button = rig.target.querySelector(".seg");
    specimen.expect(button.className).toBe("seg proc cau open");
    specimen.expect(button.getAttribute("aria-expanded")).toBe("true");
    rig.close();
  });

  specimen.it("a held segment fires onHold with its subject and the pointer event after the delay; a release before it cancels", async () => {
    const held = [];
    const rig = screen(() => parts.Segment({ subject: "display", chord: "d", delay: 420, onHold: (subject, event) => held.push([subject, event.clientX]), children: "docked" }));
    const button = rig.target.querySelector(".seg");
    fire(button, "pointerdown", { clientX: 1 });
    fire(button, "pointerup");
    await new Promise((resolve) => setTimeout(resolve, 450));
    specimen.expect(held).toEqual([]);
    fire(button, "pointerdown", { clientX: 2 });
    await new Promise((resolve) => setTimeout(resolve, 450));
    specimen.expect(held).toEqual([["display", 2]]);
    rig.close();
  });
});
