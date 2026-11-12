import { specimen } from "@vivalence/typology";
import { fire, parts, screen } from "../scenarios/index.js";

const KEPT = ["role", "title", "disabled", "data-zone", "aria-label", "aria-selected", "aria-pressed", "aria-current", "aria-expanded", "aria-hidden", "viewBox", "d"];

const styled = (node) =>
  (node.getAttribute("style") ?? "")
    .split(";")
    .map((rule) => rule.replace(/\s+/g, ""))
    .filter(Boolean)
    .join(";");

const merged = (nodes) =>
  nodes.reduce((held, node) => {
    const last = held.at(-1);
    if (node.nodeType === 3 && last !== undefined && last.text !== undefined) last.text += node.data;
    else held.push(node.nodeType === 3 ? { text: node.data } : { node });
    return held;
  }, []);

const shape = (entry) => {
  if (entry.text !== undefined) return entry.text.trim() === "" ? [] : [`"${entry.text.trim()}"`];
  const node = entry.node;
  if (node.nodeType !== 1) return [];
  const classes = (node.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
  const attributes = KEPT.filter((name) => node.hasAttribute(name)).map((name) => `${name}=${name === "disabled" ? "" : node.getAttribute(name)}`);
  const head = [node.tagName.toLowerCase(), ...classes.map((name) => `.${name}`), ...attributes.map((pair) => `[${pair}]`), styled(node) && `{${styled(node)}}`].filter(Boolean).join("");
  return [head, ...merged([...node.childNodes]).flatMap(shape).map((line) => `  ${line}`)];
};

const oracle = (html) => {
  const host = document.createElement("div");
  host.innerHTML = html;
  return merged([...host.childNodes]).flatMap(shape);
};
const painted = (target) => merged([...target.childNodes]).flatMap(shape);

const X = `<svg style="width:0.75rem;height:0.75rem" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>`;

const TELE = `<div class="tele" data-zone="3" role="dialog" aria-label="telemetry" style="left:12px;top:44px;width:960px;height:640px">
      <div class="ins-head" title="drag to move"><span class="kit-label">telemetry</span><div class="kit-choice" role="tablist"><button role="tab" aria-pressed="true" aria-selected="true">inspector</button><button role="tab" aria-pressed="false" aria-selected="false">logger 45</button></div><span class="ins-gap"></span><button class="kit-seg is-fault" aria-label="faults, show them">! 2</button><button class="ins-x" aria-label="close" title="close · /telemetry off">${X}</button></div>
      <div class="tbody"></div>
      <span class="tgrip" aria-hidden="true"></span></div>`;

const FILTERS = [
  { id: "all", n: 2, cur: true },
  { id: "activity", n: 0, cur: false },
  { id: "repl", n: 2, cur: false },
  { id: "net", n: 0, cur: false },
  { id: "faults", n: 2, cur: false },
];
const ROWS = [
  { id: "1", depth: 0, name: "terminal/T", quiet: "", tone: "live", bang: true, l: 0, w: 100, dur: 40, live: true, slow: false, cur: false },
  { id: "2", depth: 1, name: "/nonsense", quiet: "", tone: "fault", bang: false, l: 60, w: 70, dur: 600, live: false, slow: true, cur: true },
];
const DETAIL = {
  id: "2",
  path: "/anima/client/terminal/T/nonsense",
  nature: "/nonsense",
  code: "FAILED",
  live: false,
  dur: 600,
  fault: { at: 20, type: "Error", code: "NOT_FOUND", message: "Not found", stack: "Error: Not found\n    at turn.js:7" },
  signals: [],
  entries: [{ track: "fault", rel: 4, data: '{"code":"NOT_FOUND"}' }],
};

const SPAN = `<button class="ins-span" aria-current="true"><span class="n" style="padding-left:1.5ch"><span class="kit-dot is-fault"></span><span class="nm">/nonsense</span><span class="kit-quiet"></span><span class="ins-bang"></span></span><span class="ins-bar"><i class="is-fault" style="left:60.0%;width:40.0%"></i></span><span class="ms is-slow">600ms</span></button>`;

const row = (k, v, more = {}) => ({ k, v, q: "", cls: "", bang: false, go: null, edit: null, ...more });
const NODE = {
  id: "thread",
  kind: "thread",
  title: "memo",
  ref: "01a1",
  crumbs: [{ id: "app", name: "app" }, { id: "terminal", name: "terminal" }],
  acts: [{ name: "attach", kind: "signal", signal: "/mode /daemon/memo/mode/srs/memo" }],
  peek: null,
  sections: [
    {
      label: "traits",
      rows: [
        row("● HARNESSED", "tier capable", { cls: "is-worn" }),
        row("tier", "capable", { cls: "is-sub", edit: { nature: "/set", path: "thread.tier", kind: "select", opts: ["fast", "capable"], value: "capable" } }),
        row("effort", "low", { edit: { nature: "/set", path: "thread.effort", kind: "choice", opts: ["none", "low"], value: "low" } }),
        row("rounds", "12", { q: "/ 100", edit: { nature: "/set", path: "thread.rounds", kind: "step", min: 1, max: 100, step: 1, value: 12 } }),
        row("lens", "turns", { edit: { nature: "/set", path: "terminal.dock.lens", kind: "set", opts: ["turns", "harness"], value: ["turns"] } }),
        row("○ LABELED", "", { cls: "is-cast", edit: { nature: "/set", path: "thread.label", kind: "field", value: "" } }),
        row("theme", "porcelain", { edit: { nature: "/theme", path: "app.theme", kind: "choice", opts: ["northsea", "porcelain"], value: "porcelain" } }),
      ],
    },
    { label: "holds", rows: [row("turns", "8", { go: "turns", bang: true })] },
  ],
};
const TREE = [
  { id: "app", go: "app", depth: 0, sign: "▾", name: "app", strong: true, quiet: "", bang: false, tail: "", tailText: "", cur: false, kids: true },
  { id: "thread", go: "thread", depth: 1, sign: "", name: "[ memo ]", strong: false, quiet: "", bang: true, tail: "count", tailText: "8", cur: true, kids: false },
];
const LENSES = [
  { id: "tree", label: "tree", n: "", cur: true },
  { id: "tool", label: "tools", n: "13", cur: false },
];

const inspector = (calls, more = {}) =>
  parts.Inspector({
    lenses: LENSES,
    query: "",
    nodes: TREE,
    node: NODE,
    trace: { only: "all", all: 2, faults: 1, rows: ROWS, detail: DETAIL },
    json: false,
    stack: false,
    onQuery: (text) => calls.push(["query", text]),
    onLens: (id) => calls.push(["lens", id]),
    onPick: (id) => calls.push(["pick", id]),
    onFold: (id) => calls.push(["fold", id]),
    onAct: (act) => calls.push(["act", act.kind, act.signal]),
    onJson: (open) => calls.push(["json", open]),
    onOnly: (id) => calls.push(["only", id]),
    onSpan: (id) => calls.push(["span", id]),
    onStack: (open) => calls.push(["stack", open]),
    onLine: (signal) => calls.push(["line", signal]),
    ...more,
  });

specimen.describe("Tele · Logger · Inspector — the comp's telemetry window (inspector-rework/comp/Main.dc.html)", () => {
  specimen.it("Tele paints the comp's head: label, inspector | logger N, the fault seg, close; drag and grip stay", () => {
    const calls = [];
    const rig = screen(() =>
      parts.Tele({
        frame: { x: 12, y: 44, w: 960, h: 640 },
        bounds: { width: 1280, height: 800 },
        tab: "inspector",
        count: 45,
        faults: 2,
        onTab: (tab) => calls.push(["tab", tab]),
        onFaults: () => calls.push(["faults"]),
        onClose: () => calls.push(["close"]),
        onPlace: () => {},
      }),
    );
    specimen.expect(painted(rig.target)).toEqual(oracle(TELE));
    fire(rig.target.querySelectorAll(".ins-head .kit-choice button")[1], "click");
    fire(rig.target.querySelector(".kit-seg.is-fault"), "click");
    fire(rig.target.querySelector(".ins-x"), "click");
    specimen.expect(calls).toEqual([["tab", "logger"], ["faults"], ["close"]]);
    rig.close();
  });

  specimen.it("Tele without a fault paints no fault seg", () => {
    const rig = screen(() => parts.Tele({ frame: { x: 0, y: 0, w: 960, h: 640 }, bounds: { width: 1280, height: 800 }, tab: "logger", count: 0, faults: 0, onTab() {}, onFaults() {}, onClose() {}, onPlace() {} }));
    specimen.expect(rig.target.querySelector(".kit-seg")).toBe(null);
    rig.close();
  });

  specimen.it("placed() pulls a frame past the edge back inside the gutter and lifts a small one to its floor", () => {
    specimen.expect(parts.placed({ x: 900, y: 600, w: 640, h: 440 }, { width: 800, height: 500 })).toEqual({ x: 156, y: 56, w: 640, h: 440 });
    specimen.expect(parts.placed({ x: 0, y: 0, w: 100, h: 100 }, { width: 1280, height: 800 })).toEqual({ x: 4, y: 4, w: 320, h: 200 });
  });

  specimen.it("Logger paints filters, the waterfall and the picked span's detail; a span picks, a filter filters, the stack folds", () => {
    const calls = [];
    const rig = screen(() =>
      parts.Logger({
        filters: FILTERS,
        rows: ROWS,
        detail: DETAIL,
        stack: false,
        onFilter: (id) => calls.push(["filter", id]),
        onSelect: (id) => calls.push(["select", id]),
        onStack: (open) => calls.push(["stack", open]),
        onLine: (signal) => calls.push(["line", signal]),
      }),
    );
    specimen.expect(painted({ childNodes: [rig.target.querySelectorAll(".ins-span")[1]] })).toEqual(oracle(SPAN));
    specimen.expect([...rig.target.querySelectorAll(".ins-th .kit-choice button")].map((button) => [button.textContent, button.getAttribute("aria-pressed")])).toEqual(FILTERS.map((filter) => [`${filter.id} ${filter.n}`, String(filter.cur)]));
    specimen.expect([rig.target.querySelector(".ins-path").textContent, rig.target.querySelector(".ins-meta").textContent]).toEqual([DETAIL.path, "FAILED · 600ms"]);
    specimen.expect(rig.target.querySelector(".ins-fault").textContent).toBe("! NOT_FOUND · /nonsenseNot found");
    specimen.expect([...rig.target.querySelectorAll(".ins-rec span")].map((span) => span.textContent)).toEqual(["+4.0", "fault", '{"code":"NOT_FOUND"}']);
    specimen.expect(rig.target.querySelector("pre")).toBe(null);
    fire(rig.target.querySelectorAll(".ins-span")[0], "click");
    fire(rig.target.querySelectorAll(".ins-th .kit-choice button")[4], "click");
    fire(rig.target.querySelector("[aria-expanded]"), "click");
    specimen.expect(calls).toEqual([["select", "1"], ["filter", "faults"], ["stack", true]]);
    rig.close();
  });

  specimen.it("Logger with no spans and no pick says so in both panes", () => {
    const rig = screen(() => parts.Logger({ filters: FILTERS, rows: [], detail: null, stack: false, onFilter() {}, onSelect() {}, onStack() {}, onLine() {} }));
    specimen.expect([...rig.target.querySelectorAll(".ins-empty")].map((held) => held.textContent)).toEqual(["no spans · /telemetry/clear moved the watermark", "pick a span"]);
    rig.close();
  });

  specimen.it("an activity's detail offers its signals, a settled one disabled", () => {
    const calls = [];
    const signals = [{ sig: "SIGSTOP", signal: "/pause", off: false }, { sig: "SIGKILL", signal: "/abort", off: true }];
    const rig = screen(() => parts.Logger({ filters: FILTERS, rows: ROWS, detail: { ...DETAIL, fault: null, signals }, stack: false, onFilter() {}, onSelect() {}, onStack() {}, onLine: (signal) => calls.push(signal) }));
    const buttons = [...rig.target.querySelectorAll(".ins-act")];
    specimen.expect(buttons.map((button) => [button.textContent, button.disabled])).toEqual([["SIGSTOP", false], ["SIGKILL", true]]);
    fire(buttons[0], "click");
    specimen.expect(calls).toEqual(["/pause"]);
    rig.close();
  });

  specimen.it("Inspector paints three panes: tree · entity · trace, each in the comp's classes", () => {
    const rig = screen(() => inspector([]));
    const body = rig.target.querySelector(".ins-body");
    specimen.expect([...body.children].map((child) => child.getAttribute("class"))).toEqual(["ins-col", "ins-div", "ins-col", "ins-div", "ins-col"]);
    specimen.expect([...body.querySelectorAll(".ins-node")].map((held) => [held.getAttribute("aria-current"), held.style.paddingLeft, held.textContent])).toEqual([
      ["false", "calc(.25rem + 0ch)", "▾app"],
      ["true", "calc(.25rem + 1.25ch)", "[ memo ]!8"],
    ]);
    specimen.expect([...body.querySelectorAll(".ins-lens button")].map((button) => [button.textContent, button.getAttribute("aria-pressed")])).toEqual([["tree", "true"], ["tools13", "false"]]);
    specimen.expect([body.querySelector(".ins-oh .kit-label").textContent, body.querySelector(".ins-oh b").textContent, body.querySelector(".ins-oh .kit-quiet").textContent]).toEqual(["thread", "memo", "01a1"]);
    specimen.expect([...body.querySelectorAll(".ins-oh .ins-act")].map((button) => button.textContent)).toEqual(["copy", "json", "attach"]);
    specimen.expect(body.querySelector(".ins-crumbs").textContent).toBe("app›terminal›thread");
    specimen.expect([...body.querySelectorAll(".ins-sec")].map((held) => held.textContent)).toEqual(["traits", "holds"]);
    specimen.expect([...body.querySelectorAll(".ins-kv")].map((held) => held.getAttribute("class"))).toEqual(["ins-kv is-worn", "ins-kv is-sub", "ins-kv is-tall", "ins-kv", "ins-kv is-tall", "ins-kv is-cast", "ins-kv is-tall", "ins-kv"]);
    specimen.expect([...body.querySelectorAll(".ins-cells i.on")].length).toBe(Math.round(((12 - 1) / 99) * 16));
    specimen.expect(body.querySelector(".ins-th").textContent).toBe("traceall 2faults 1");
    specimen.expect(body.querySelectorAll(".ins-span").length).toBe(2);
    rig.close();
  });

  specimen.it("every edit speaks ONE repl signal: /set <path> <value>, or its own nature", () => {
    const calls = [];
    const rig = screen(() => inspector(calls));
    const kv = [...rig.target.querySelectorAll(".ins-kv")];
    const select = kv[1].querySelector("select");
    for (const option of select.querySelectorAll("option")) option.toggleAttribute("selected", option.value === "fast");
    fire(select, "change");
    fire(kv[2].querySelectorAll(".kit-choice button")[0], "click");
    fire(kv[3].querySelector("[aria-label=more]"), "click");
    fire(kv[3].querySelector("[aria-label=less]"), "click", { shiftKey: true });
    fire(kv[4].querySelectorAll(".kit-choice button")[1], "click");
    const input = kv[5].querySelector("input");
    input.value = "flamingo";
    fire(input, "keydown", { key: "Enter" });
    fire(kv[6].querySelectorAll(".kit-choice button")[0], "click");
    specimen.expect(calls.map(([, signal]) => signal)).toEqual([
      "/set thread.tier fast",
      "/set thread.effort none",
      "/set thread.rounds 13",
      "/set thread.rounds 2",
      "/set terminal.dock.lens harness",
      "/set thread.label flamingo",
      "/theme northsea",
    ]);
    rig.close();
  });

  specimen.it("a link, a crumb, a node and a fold pick; acts, json, lens, filter, trace and stack call back", () => {
    const calls = [];
    const rig = screen(() => inspector(calls));
    const body = rig.target.querySelector(".ins-body");
    fire(body.querySelector(".ins-kv .ins-link"), "click");
    fire(body.querySelector(".ins-crumbs .ins-link"), "click");
    fire(body.querySelectorAll(".ins-node .m")[0], "click");
    fire(body.querySelectorAll(".ins-node .f")[0], "click");
    fire(body.querySelectorAll(".ins-node .f")[1], "click");
    const acts = body.querySelectorAll(".ins-oh .ins-act");
    fire(acts[0], "click");
    fire(acts[1], "click");
    fire(acts[2], "click");
    fire(body.querySelectorAll(".ins-lens button")[1], "click");
    const filter = body.querySelector(".ins-filter input");
    filter.value = "tier";
    fire(filter, "input");
    fire(body.querySelectorAll(".ins-th .kit-choice button")[1], "click");
    fire(body.querySelectorAll(".ins-span")[0], "click");
    fire(body.querySelector("[aria-expanded]"), "click");
    specimen.expect(calls).toEqual([
      ["pick", "turns"],
      ["pick", "app"],
      ["pick", "app"],
      ["fold", "app"],
      ["pick", "thread"],
      ["act", "copy", undefined],
      ["json", true],
      ["act", "signal", "/mode /daemon/memo/mode/srs/memo"],
      ["lens", "tool"],
      ["query", "tier"],
      ["only", "faults"],
      ["span", "1"],
      ["stack", true],
    ]);
    rig.close();
  });

  specimen.it("json and a read primer paint as pre; an empty tree and an untouched entity say so", () => {
    const rig = screen(() => inspector([], { json: true, nodes: [], node: { ...NODE, peek: "You are Magister." }, trace: { only: "all", all: 0, faults: 0, rows: [], detail: null } }));
    const pres = [...rig.target.querySelectorAll("pre")];
    specimen.expect([pres[0].getAttribute("class"), pres[0].textContent]).toEqual(["ins-pre is-prose", "You are Magister."]);
    specimen.expect(JSON.parse(pres[1].textContent).holds).toEqual({ turns: "8" });
    specimen.expect([...rig.target.querySelectorAll(".ins-empty")].map((held) => held.textContent)).toEqual(["nothing matches", "no span touches this"]);
    rig.close();
  });

  specimen.it("a step moves inside its bounds at its precision; a cell strip lights its share", () => {
    const share = { nature: "/set", path: "terminal.dock.share", min: 0.1, max: 0.9, step: 0.05, value: 0.38 };
    specimen.expect([parts.moved(share, 0.05), parts.moved(share, -0.5), parts.moved({ ...share, value: 0.88 }, 0.05)]).toEqual([
      "/set terminal.dock.share 0.43",
      "/set terminal.dock.share 0.1",
      "/set terminal.dock.share 0.9",
    ]);
    specimen.expect([parts.lighted(share), parts.lighted({ ...share, value: 0.9 }), parts.INSPECTOR_CELLS]).toEqual([6, 16, 16]);
    specimen.expect([parts.ms(null), parts.ms(0.4), parts.ms(600), parts.ms(1234), parts.ms(12345)]).toEqual(["—", "<1ms", "600ms", "1.23s", "12.3s"]);
  });
});
