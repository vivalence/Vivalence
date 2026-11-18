import { specimen } from "@vivalence/typology";
import { fire, parts, screen, window } from "../scenarios/index.js";
import { oracle, shaped } from "../scenarios/shape.js";

const SECTION = { id: "box", title: "box", key: "x", head: true, rows: [{ type: "value", label: "mic", value: "off", dot: "" }] };

specimen.describe("Wid — dom.js:83 wid(w): .scrim + .wid[role=dialog] at the segment, the section inside", () => {
  specimen.it("the design's tree + the grip; geometry: width min(460, W−16), left clamped, max-height ≥ 180", () => {
    const closed = [];
    const rig = screen(() => parts.Wid({ section: SECTION, at: { id: "box", x: 1200, bottom: 44, room: 120 }, viewport: { width: 1280, height: 800 }, onClose: () => closed.push(true), onAct: () => {}, onFilter: () => {} }));
    specimen.expect(shaped(rig.target)).toBe(oracle(`<div class="scrim" data-fn="widclose"></div><div class="wid" data-zone="0" role="dialog" aria-label="box"><div class="subj " data-sec="box"><div class="subjh" title="ctrl-v x"><span class="t">box</span></div><div class="subjb"><div class="srow value"><span class="lab">mic</span><span class="v">off</span></div></div></div><span class="wgrip"></span></div>`));
    const wid = rig.target.querySelector(".wid");
    specimen.expect(wid.getAttribute("style")).toBe("left:812px;bottom:44px;width:460px;max-height:180px");
    specimen.expect([wid.getAttribute("data-zone"), wid.getAttribute("role"), wid.getAttribute("aria-label")]).toEqual(["0", "dialog", "box"]);
    fire(rig.target.querySelector(".scrim"), "click");
    specimen.expect(closed).toEqual([true]);
    rig.close();
  });

  specimen.it("a phone-narrow viewport shrinks the width to W−16", () => {
    const rig = screen(() => parts.Wid({ section: SECTION, at: { id: "box", x: 4, bottom: 60, room: 400 }, viewport: { width: 300, height: 600 }, onClose: () => {}, onAct: () => {}, onFilter: () => {} }));
    specimen.expect(rig.target.querySelector(".wid").getAttribute("style")).toBe("left:8px;bottom:60px;width:284px;max-height:400px");
    rig.close();
  });

  specimen.it("display and control keep 320; an unknown widget throws, naming the seven", () => {
    specimen.expect([parts.widSpanned("entity"), parts.widSpanned("display"), parts.widSpanned("control")]).toEqual([460, 320, 320]);
    specimen.expect(() => parts.widSpanned("nope")).toThrow("not a widget");
  });

  specimen.it("a frame floats the widget: left · top · width · height, pulled back inside the viewport", () => {
    const rig = screen(() => parts.Wid({ section: SECTION, at: { id: "box", x: 4, bottom: 60, room: 400 }, frame: { x: 2000, y: 100, w: 600, h: 300 }, viewport: { width: 1280, height: 800 }, onClose: () => {}, onAct: () => {}, onFilter: () => {}, onPlace: () => {} }));
    specimen.expect(rig.target.querySelector(".wid").getAttribute("style")).toBe("left:676px;top:100px;width:600px;height:300px");
    rig.close();
  });

  specimen.it("the head drags and the grip sizes: each move calls back ONE whole frame; a press on a row does not", () => {
    const frames = [];
    const rig = screen(() => parts.Wid({ section: SECTION, at: { id: "box", x: 4, bottom: 60, room: 400 }, frame: { x: 100, y: 100, w: 600, h: 300 }, viewport: { width: 1280, height: 800 }, onClose: () => {}, onAct: () => {}, onFilter: () => {}, onPlace: (frame) => frames.push(frame) }));
    fire(rig.target.querySelector(".srow"), "pointerdown", { clientX: 10, clientY: 10 });
    fire(window, "pointermove", { clientX: 50, clientY: 50 });
    fire(window, "pointerup");
    specimen.expect(frames).toEqual([]);
    fire(rig.target.querySelector(".subjh"), "pointerdown", { clientX: 10, clientY: 10 });
    fire(window, "pointermove", { clientX: 40, clientY: 25 });
    fire(window, "pointerup");
    fire(rig.target.querySelector(".wgrip"), "pointerdown", { clientX: 10, clientY: 10 });
    fire(window, "pointermove", { clientX: 60, clientY: 110 });
    fire(window, "pointerup");
    fire(window, "pointermove", { clientX: 999, clientY: 999 });
    specimen.expect(frames).toEqual([{ x: 130, y: 115, w: 600, h: 300 }, { x: 100, y: 100, w: 650, h: 400 }]);
    rig.close();
  });

  specimen.it("a phone widget stays glued: a frame is not read, no grip, the head does not drag", () => {
    const frames = [];
    const rig = screen(() => parts.Wid({ section: SECTION, phone: true, at: { id: "box", x: 4, bottom: 60, room: 400 }, frame: { x: 100, y: 100, w: 600, h: 300 }, viewport: { width: 300, height: 600 }, onClose: () => {}, onAct: () => {}, onFilter: () => {}, onPlace: (frame) => frames.push(frame) }));
    specimen.expect(rig.target.querySelector(".wid").getAttribute("style")).toBe("left:8px;bottom:60px;width:284px;max-height:400px");
    specimen.expect(rig.target.querySelector(".wgrip")).toBe(null);
    fire(rig.target.querySelector(".subjh"), "pointerdown", { clientX: 10, clientY: 10 });
    fire(window, "pointermove", { clientX: 40, clientY: 25 });
    fire(window, "pointerup");
    specimen.expect(frames).toEqual([]);
    rig.close();
  });
});
