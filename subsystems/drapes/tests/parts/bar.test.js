import { specimen } from "@vivalence/typology";
import { fire, parts, screen } from "../scenarios/index.js";
import { oracle, shaped } from "../scenarios/shape.js";
import { WORLDS } from "../../design/worlds.js";

const bar = (world, extra = {}) =>
  parts.Bar({ entity: world.entity, activity: world.activity, harness: world.harness, display: world.display, box: world.box, system: world.system, fault: world.fault, ...extra });

const IDLE = `<nav class="modebar" data-zone="0" data-r="bar" aria-label="mode bar"><button class="mark " data-fn="mark" aria-label="vivalence" title="once: keys · twice: repl · hold: sidebar"><span class="viket" style="width:20px;height:20px" aria-hidden="true"></span></button>
    <button class="seg ent " data-fn="wid" data-arg="entity" aria-haspopup="dialog" aria-expanded="false" title="entity · ctrl-v e"><span class="lab">[e4 openings</span><span class="q">‹board/play›]</span></button>
    <span class="seg sp"></span>
    <button class="seg har " data-fn="wid" data-arg="harness" aria-haspopup="dialog" aria-expanded="false" title="harness · ctrl-v h"><span class="q"><svg></svg></span><span>capable</span><span class="q">·</span><span class="v">low</span><span class="meter " title="context 34 %"><i class="on"></i><i class="on"></i><i class=""></i><i class=""></i><i class=""></i><i class=""></i></span><span class="q"><svg></svg></span></button>
    <button class="seg proc idle " data-fn="wid" data-arg="activity" aria-haspopup="dialog" aria-expanded="false" title="activity · ctrl-v a"><span class="dot" style="opacity:.35"></span><span class="lab">idle</span></button>
    <button class="seg disp " data-fn="wid" data-arg="display" data-hold="pop" aria-haspopup="dialog" aria-expanded="false" title="display · ctrl-v d"><svg class="dispg"></svg><span class="q">chat</span></button>
    <button class="seg box " data-fn="wid" data-arg="box" aria-haspopup="dialog" aria-expanded="false" title="box · ctrl-v x"><span class="light"><svg></svg></span></button>
    <button class="seg sys " data-fn="wid" data-arg="system" aria-haspopup="dialog" aria-expanded="false" title="system · ctrl-v s"><span class="light"><svg></svg></span><span class="dot pos"></span></button></nav>`;

specimen.describe("Bar — dom.js:153 bar(w): the mark · entity · sp · harness · activity · display · box · system", () => {
  specimen.it("the idle world is the design's tree", () => {
    const rig = screen(() => bar(WORLDS.idle));
    specimen.expect(shaped(rig.target)).toBe(oracle(IDLE));
    specimen.expect([...rig.target.querySelectorAll(".seg[data-arg]")].map((segment) => segment.getAttribute("data-arg"))).toEqual(["entity", "harness", "activity", "display", "box", "system"]);
    rig.close();
  });

  specimen.it("running: proc pri with a live dot; the mic live and the voice on paint .neg mic and .pri speaker", () => {
    const rig = screen(() => bar(WORLDS.running, { live: true }));
    specimen.expect(rig.target.querySelector(".seg[data-arg='activity']").className).toBe("seg proc pri");
    specimen.expect(shaped(rig.target.querySelector(".seg[data-arg='activity']"))).toBe(`span.dot.live.pri span.lab("match_move · r3/10 · 42s")`);
    specimen.expect(shaped(rig.target.querySelector(".seg[data-arg='box']"))).toBe(`span.neg(svg) span.neg(svg) span.pri(svg)`);
    specimen.expect(rig.target.querySelector(".viket").className).toBe("viket live");
    rig.close();
  });

  specimen.it("consent: proc cau with a breathing dot; faulted: proc neg, the .fault on the mark, the system dot neg", () => {
    const consent = screen(() => bar(WORLDS.consent));
    specimen.expect(consent.target.querySelector(".seg[data-arg='activity']").className).toBe("seg proc cau");
    specimen.expect(consent.target.querySelector(".seg[data-arg='activity'] .dot").className).toBe("dot cau breathe");
    consent.close();
    const faulted = screen(() => bar(WORLDS.faulted));
    specimen.expect(faulted.target.querySelector(".seg[data-arg='activity']").className).toBe("seg proc neg");
    specimen.expect(faulted.target.querySelector(".mark .fault")).not.toBe(null);
    specimen.expect(faulted.target.querySelector(".seg[data-arg='system'] .dot").className).toBe("dot neg");
    faulted.close();
  });

  specimen.it("a segment click sends its subject; the open one wears .open; keys open the mark", () => {
    const picked = [];
    const rig = screen(() => bar(WORLDS.idle, { open: "harness", keys: true, onPick: (subject) => picked.push(subject), onMark: () => picked.push("mark") }));
    fire(rig.target.querySelector(".seg[data-arg='entity']"), "click");
    fire(rig.target.querySelector(".mark"), "click");
    specimen.expect(picked).toEqual(["entity", "mark"]);
    specimen.expect(rig.target.querySelector(".seg[data-arg='harness']").className).toBe("seg har open");
    specimen.expect(rig.target.querySelector(".mark").className).toBe("mark open");
    rig.close();
  });

  specimen.it("the phone bar drops display and box, the brace, the effort; the meter has four rings", () => {
    const rig = screen(() => bar(WORLDS.idle, { phone: true }));
    specimen.expect([...rig.target.querySelectorAll(".seg[data-arg]")].map((segment) => segment.getAttribute("data-arg"))).toEqual(["entity", "harness", "system"]);
    specimen.expect(rig.target.querySelectorAll(".meter i").length).toBe(4);
    specimen.expect(rig.target.querySelector(".viket").getAttribute("style")).toBe("width:24px;height:24px");
    rig.close();
  });
});
