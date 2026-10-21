import { specimen } from "@vivalence/typology";
import { fire, parts, screen } from "../scenarios/index.js";
import { oracle, shaped } from "../scenarios/shape.js";
import { DSET } from "./dset.js";

const row = (held, extra = {}) => screen(() => parts.Srow({ row: held, pre: "sb", onAct: () => {}, onFilter: () => {}, ...extra }));


const CASES = [
  ["sub", { type: "sub", label: "terminals", count: "3" }, `<div class="srow sub"><span>terminals</span><span class="c">3</span></div>`],
  ["item", { type: "item", label: "1  e4 openings", sub: "board/play", signal: "/terminal 1", cur: true, dot: "pri live", mark: "[◇]", title: "/terminal 1" }, `<button class="srow item cur" data-signal="/terminal 1" title="/terminal 1"><span class="mk">[◇]</span><span class="lab">1  e4 openings</span><span class="sub">board/play</span><span class="dot pri live"></span></button>`],
  ["keys", { type: "keys", keys: [{ label: "pause", signal: "/pause", on: false, off: true, tone: "", title: "/pause" }, { label: "stop", signal: "/stop", hold: "/abort", on: false, off: false, tone: "neg", title: "SIGTERM · hold: SIGKILL" }] }, `<div class="srow keys"><button class="sk  off " disabled title="/pause">pause</button><button class="sk   neg" data-signal="/stop" data-hold="/abort" title="SIGTERM · hold: SIGKILL">stop</button></div>`],
  ["choice", { type: "choice", label: "tune", chips: [{ label: "fast", signal: "/tune fast", cur: true }, { label: "capable", signal: "/tune capable", cur: false }] }, `<div class="srow choice"><span class="cl">tune</span><span class="cc"><button class="cur" data-signal="/tune fast" title="/tune fast">fast</button><button class="" data-signal="/tune capable" title="/tune capable">capable</button></span></div>`],
  ["chips", { type: "chips", chips: [{ label: "fs_read", on: true, signal: "/tools/toggle fs_read" }] }, `<div class="srow chips"><button class="on" title="/tools/toggle fs_read">fs_read</button></div>`],
  ["value", { type: "value", label: "/runtime/vivalence", value: "healthy", dot: "pos" }, `<div class="srow value"><span class="dot pos"></span><span class="lab">/runtime/vivalence</span><span class="v">healthy</span></div>`],
  ["meter", { type: "meter", label: "rounds", pct: 30, text: "3 / 10", tone: "cau" }, `<div class="srow meter"><span class="cl">rounds</span><span class="track"><span class="fill cau" style="width:30%"></span></span><span class="v">3 / 10</span></div>`],
  ["stepper", { type: "stepper", label: "rounds", value: "10", dec: "/rounds 9", inc: "/rounds 11" }, `<div class="srow stepper"><span class="cl">rounds</span><button aria-label="less" title="/rounds 9">−</button><span class="v">10</span><button aria-label="more" title="/rounds 11">+</button></div>`],
  ["check", { type: "check", label: "voice", on: true, signal: "/voice off", value: "on" }, `<button class="srow check"><span class="mk pri">●</span><span class="lab">voice</span><span class="v">on</span></button>`],
  ["tags", { type: "tags", kind: "sidebar", tags: [{ label: "threads", on: true, signal: "/sidebar/show threads" }, { label: "modes", on: false, signal: "/sidebar/show modes" }] }, `<div class="srow tags"><button class="on" aria-pressed="true" title="/sidebar/show threads">threads</button><button class="" aria-pressed="false" title="/sidebar/show modes">modes</button></div>`],
  ["filter", { type: "filter", kind: "thread", ph: "filter threads", q: "", count: "8", pick: false, dim: false }, `<div class="sbfilter"><button class="fpick  " data-fn="dpick" data-arg="thread" aria-label="filter by daemon" aria-expanded="false" title="by daemon · /filter/daemon"><svg></svg></button><input id="sbf-thread" data-filter="thread" value="" placeholder="filter threads" aria-label="filter threads" spellcheck="false" autocomplete="off"><span>8</span></div>`],
  ["display", DSET, `<div class="srow dset"><div class="dset"><div class="views"><button class="cur"><svg class="dispg"></svg></button><button class=""><svg class="dispg"></svg></button><button class=""><svg class="dispg"></svg></button><button class=""><svg class="dispg"></svg></button></div>
      <div class="aligns"><button class="">←</button><button class="cur">→</button><button class="">↑</button><button class="">↓</button></div>
      <div class="shrow"><button aria-label="less">−</button><span class="track slider"><span class="fill" style="width:42%"></span><span class="sv" data-slider-v="1">42 %</span></span><button aria-label="more">+</button></div></div></div>`],
  ["more", { type: "more", label: "3 more", fn: "expand", arg: "thread" }, `<button class="srow more">3 more</button>`],
];

specimen.describe("Srow — dom.js:63 srow(r, pre): one row per type, the design's markup", () => {
  for (const [type, held, html] of CASES) {
    specimen.it(`${type}`, () => {
      const rig = row(held);
      specimen.expect(shaped(rig.target)).toBe(oracle(html));
      rig.close();
    });
  }

  specimen.it("every type the design draws, nothing else; an unknown type is loud", () => {
    specimen.expect(Object.keys(parts.SROWS)).toEqual(CASES.map(([type]) => type));
    specimen.expect(() => parts.shaped("bogus")).toThrow("not a sidebar row");
  });

  specimen.it("a click acts with the row, the key, the chip; a held key acts with its hold line; the filter types", async () => {
    const acted = [];
    const typed = [];
    const onAct = (entry) => acted.push("signal" in entry ? entry.signal : entry.fn);
    const item = row(CASES[1][1], { onAct });
    fire(item.target.querySelector("button"), "click");
    item.close();
    const keys = row(CASES[2][1], { onAct });
    fire(keys.target.querySelectorAll("button")[1], "click");
    fire(keys.target.querySelectorAll("button")[1], "pointerdown");
    await new Promise((resolve) => setTimeout(resolve, 520));
    keys.close();
    const filter = row(CASES[10][1], { onAct, onFilter: (kind, value) => typed.push([kind, value]) });
    fire(filter.target.querySelector(".fpick"), "click");
    const input = filter.target.querySelector("input");
    input.value = "e4";
    fire(input, "input");
    filter.close();
    specimen.expect(acted).toEqual(["/terminal 1", "/stop", "/abort", "dpick"]);
    specimen.expect(typed).toEqual([["thread", "e4"]]);
  });

  specimen.it("Section — dom.js:79: .subj (.headless) › .subjh title ctrl-v key › .subjb", () => {
    const section = (head) => ({ id: "harness", title: "harness", key: "h", head, rows: [CASES[0][1]] });
    const headed = screen(() => parts.Section({ section: section(true), pre: "sb", onAct: () => {}, onFilter: () => {} }));
    specimen.expect(shaped(headed.target)).toBe(oracle(`<div class="subj " data-sec="harness"><div class="subjh" title="ctrl-v h"><span class="t">harness</span></div><div class="subjb"><div class="srow sub"><span>terminals</span><span class="c">3</span></div></div></div>`));
    specimen.expect(headed.target.querySelector(".subjh").getAttribute("title")).toBe("ctrl-v h");
    headed.close();
    const headless = screen(() => parts.Section({ section: section(false), pre: "sb", onAct: () => {}, onFilter: () => {} }));
    specimen.expect(shaped(headless.target)).toBe(oracle(`<div class="subj headless" data-sec="harness"><div class="subjb"><div class="srow sub"><span>terminals</span><span class="c">3</span></div></div></div>`));
    headless.close();
  });
});

