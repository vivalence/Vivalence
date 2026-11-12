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
  ["stepper", { type: "stepper", label: "rounds", value: "10", dec: "/rounds 9", inc: "/rounds 11", coarse: { dec: "/rounds 1", inc: "/rounds 20" } }, `<div class="srow stepper"><span class="cl">rounds</span><button aria-label="less" title="/rounds 9">−</button><span class="v">10</span><button aria-label="more" title="/rounds 11">+</button></div>`],
  ["check", { type: "check", label: "voice", on: true, signal: "/voice off", value: "on" }, `<button class="srow check"><span class="mk pri">●</span><span class="lab">voice</span><span class="v">on</span></button>`],
  ["tags", { type: "tags", kind: "sidebar", tags: [{ label: "threads", on: true, signal: "/sidebar/show threads" }, { label: "modes", on: false, signal: "/sidebar/show modes" }] }, `<div class="srow tags"><button class="on" aria-pressed="true" title="/sidebar/show threads">threads</button><button class="" aria-pressed="false" title="/sidebar/show modes">modes</button></div>`],
  ["filter", { type: "filter", kind: "thread", ph: "filter threads", q: "", count: "8", pick: false, dim: false }, `<div class="sbfilter"><button class="fpick  " data-fn="dpick" data-arg="thread" aria-label="filter by daemon" aria-expanded="false" title="by daemon · /filter/daemon"><svg></svg></button><input id="sbf-thread" data-filter="thread" value="" placeholder="filter threads" aria-label="filter threads" spellcheck="false" autocomplete="off"><span>8</span></div>`],
  ["display", DSET, `<div class="srow dset"><div class="dset"><div class="views"><button class="cur"><svg class="dispg"></svg></button><button class=""><svg class="dispg"></svg></button><button class=""><svg class="dispg"></svg></button><button class=""><svg class="dispg"></svg></button></div>
      <div class="aligns"><button class="">←</button><button class="cur">→</button><button class="">↑</button><button class="">↓</button></div>
      <div class="shrow"><button aria-label="less">−</button><span class="track slider"><span class="fill" style="width:42%"></span><span class="sv" data-slider-v="1">42 %</span></span><button aria-label="more">+</button></div></div></div>`],
  ["more", { type: "more", label: "3 more", fn: "expand", arg: "thread" }, `<button class="srow more">3 more</button>`],
  ["note", { type: "note", text: "The directory tree under an absolute path." }, `<div class="srow note">The directory tree under an absolute path.</div>`],
  ["tune", { type: "tune", axes: ["intelligence", "speed", "thrift"], point: [1, 0.5, 0.25], signal: "/tune" }, `<div class="srow tune" data-signal="/tune"><svg class="radar"><polygon class="frame"></polygon><path class="spoke"></path><polygon class="held"></polygon><text class="axis">intelligence<tspan> 1.00</tspan></text><circle class="knob"></circle><text class="axis">speed<tspan>0.50</tspan></text><circle class="knob"></circle><text class="axis">thrift<tspan>0.25</tspan></text><circle class="knob"></circle></svg></div>`],
  ["toggles", { type: "toggles", label: "lens", options: ["turns", "repl"], on: ["turns"], signal: "/dock/lens" }, `<div class="srow choice"><span class="cl">lens</span><span class="tg" role="group" aria-label="lens"><button type="button" class="on" aria-pressed="true" data-signal="/dock/lens turns" title="/dock/lens turns"><i class="tk"></i>turns</button><button type="button" class="" aria-pressed="false" data-signal="/dock/lens repl" title="/dock/lens repl"><i class="tk"></i>repl</button></span></div>`],
];

specimen.describe("Srow — dom.js:63 srow(r, pre): one row per type, the design's markup", () => {
  for (const [type, held, html] of CASES) {
    specimen.it(`${type}`, () => {
      const rig = row(held);
      specimen.expect(shaped(rig.target)).toBe(oracle(html));
      rig.close();
    });
  }

  specimen.it("a value that carries fn is a disclosure: a button, its chevron ▸ shut, ▾ open, acting with its fn", () => {
    const acted = [];
    const held = { type: "value", label: "model", value: "anthropic · claude-sonnet", dot: "", fn: "expand", arg: "model" };
    const shut = row({ ...held, open: false }, { onAct: (entry) => acted.push(entry.fn) });
    specimen.expect(shaped(shut.target)).toBe(oracle(`<button class="srow value"><span class="lab">model</span><span class="v">anthropic · claude-sonnet</span><span class="chev">▸</span></button>`));
    fire(shut.target.querySelector("button"), "click");
    specimen.expect(acted).toEqual(["expand"]);
    shut.close();
    const open = row({ ...held, open: true });
    specimen.expect(open.target.querySelector(".chev").textContent).toBe("▾");
    open.close();
  });

  specimen.it("a sub with chips is a strip: its label folds, its tally pairs, its view chips; an item with a set is a tree row: indented, its acts inline, its fold its own", () => {
    const acted = [];
    const onAct = (entry) => acted.push("signal" in entry ? entry.signal : entry.fn);
    const strip = row(
      {
        type: "sub",
        label: "tools",
        count: "",
        tally: [{ mark: "●", mk: "eager", count: 8 }, { mark: "○", mk: "lazy", count: 3 }],
        chips: [{ label: "loaded", signal: "/harness/view tools loaded", cur: true }, { label: "all", signal: "/harness/view tools all", cur: false }],
        fn: "expand",
        arg: "tools",
        open: true,
      },
      { onAct },
    );
    specimen.expect(shaped(strip.target)).toBe(
      oracle(
        `<div class="srow sub strip"><button class="hit" aria-expanded="true">tools</button><span class="tally"><span class="pair"><span class="g eager">●</span><span>8</span></span><span class="pair"><span class="g lazy">○</span><span>3</span></span></span><span class="view" role="group" aria-label="view"><button class="cur" aria-pressed="true" data-signal="/harness/view tools loaded" title="/harness/view tools loaded">loaded</button><button class="" aria-pressed="false" data-signal="/harness/view tools all" title="/harness/view tools all">all</button></span><button class="chev" aria-label="fold">▾</button></div>`,
      ),
    );
    fire(strip.target.querySelector(".hit"), "click");
    fire(strip.target.querySelectorAll(".view button")[1], "click");
    strip.close();
    const node = row(
      {
        type: "item",
        label: "fs",
        sub: "",
        mark: "●",
        mk: "eager keyed",
        lc: "strong",
        dot: "",
        depth: 1,
        rail: 0,
        tally: [],
        set: [
          { mark: "●", tone: "pos", on: true, off: false, title: "load fs", fn: "none" },
          { mark: "○", tone: "cau", on: false, off: true, title: "preload fs", fn: "none" },
          { mark: "×", tone: "neg", on: false, off: false, title: "unload fs", signal: "/tool/unload /runtime/runtime/mode/harness/runtime/fs" },
        ],
        fold: { mark: "▾", fn: "expand", arg: "tools/fs" },
        cur: true,
        fn: "pick",
        arg: "tools/fs",
      },
      { onAct },
    );
    specimen.expect(shaped(node.target)).toBe(
      oracle(
        `<div class="srow node cur railed" style="--depth:1;--rail:0"><button class="hit"><span class="mk eager keyed">●</span><span class="lab strong">fs</span><span class="sub"></span><span class="tally"></span></button><span class="set" role="group" aria-label="set"><button class="on pos" aria-pressed="true" aria-label="load fs" title="load fs">●</button><button class="cau" disabled="" aria-pressed="false" aria-label="preload fs" title="preload fs">○</button><button class="neg" aria-pressed="false" aria-label="unload fs" data-signal="/tool/unload /runtime/runtime/mode/harness/runtime/fs" title="unload fs">×</button></span><button class="fold" aria-label="fold">▾</button></div>`,
      ),
    );
    fire(node.target.querySelector(".hit"), "click");
    fire(node.target.querySelectorAll(".set button")[2], "click");
    fire(node.target.querySelector(".fold"), "click");
    node.close();
    specimen.expect(acted).toEqual(["expand", "/harness/view tools all", "pick", "/tool/unload /runtime/runtime/mode/harness/runtime/fs", "expand"]);
  });

  specimen.it("a meter with rings draws the cells; with fn it is a toggle, its chevron ▸ shut, acting with its fn", () => {
    const acted = [];
    const meter = row(
      { type: "meter", label: "context", pct: 50, text: "50 %", tone: "", rings: 30, fn: "expand", arg: "context", open: false },
      { onAct: (entry) => acted.push(entry.fn) },
    );
    const button = meter.target.querySelector("button.srow.meter");
    specimen.expect([button.getAttribute("aria-expanded"), button.querySelectorAll(".meter i").length, button.querySelectorAll(".meter i.on").length, button.querySelector(".chev").textContent]).toEqual(["false", 30, 15, "▸"]);
    fire(button, "click");
    meter.close();
    specimen.expect(acted).toEqual(["expand"]);
  });

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

  specimen.it("a stepper's click steps by one, its shift-click by its coarse pair", () => {
    const acted = [];
    const stepper = row(CASES[7][1], { onAct: (entry) => acted.push(entry.signal) });
    const [less, more] = stepper.target.querySelectorAll("button");
    fire(less, "click");
    fire(more, "click");
    fire(less, "click", { shiftKey: true });
    fire(more, "click", { shiftKey: true });
    stepper.close();
    specimen.expect(acted).toEqual(["/rounds 9", "/rounds 11", "/rounds 1", "/rounds 20"]);
  });

  specimen.it("a held stepper repeats its step, fine or coarse; the click that ends a hold adds none", async () => {
    const acted = [];
    const stepper = row(CASES[7][1], { onAct: (entry) => acted.push(entry.signal) });
    const [less, more] = stepper.target.querySelectorAll("button");
    const held = async (button, init, end) => {
      fire(button, "pointerdown", init);
      await new Promise((resolve) => setTimeout(resolve, 500));
      fire(button, end);
    };
    await held(less, {}, "pointerup");
    fire(less, "click");
    specimen.expect(acted).toEqual(["/rounds 9", "/rounds 9"]);
    await held(more, { shiftKey: true }, "pointerleave");
    specimen.expect(acted.slice(2)).toEqual(["/rounds 20", "/rounds 20"]);
    fire(more, "click");
    fire(more, "pointerdown");
    fire(more, "pointerup");
    fire(more, "click");
    await new Promise((resolve) => setTimeout(resolve, 700));
    specimen.expect(acted.slice(4)).toEqual(["/rounds 11", "/rounds 11"]);
    stepper.close();
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

