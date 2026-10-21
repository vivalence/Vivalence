import { specimen } from "@vivalence/typology";
import { fire, parts, screen } from "../scenarios/index.js";

const KEPT = ["role", "title", "disabled", "data-zone", "aria-label", "aria-selected", "aria-expanded", "aria-hidden", "viewBox", "d"];

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

const X = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>`;

const TELE = `<div class="tele" data-zone="3" role="dialog" aria-label="telemetry" style="left:12px;top:44px;width:640px;height:440px">
      <div class="tth" data-fn="teledrag" title="drag to move"><span class="ttl">telemetry</span><span class="ttabs"><button class="cur" data-fn="teletab" data-arg="logger">logger</button><button class="" data-fn="teletab" data-arg="inspector">inspector</button></span><span class="sp"></span><span class="mut">3</span><button class="iconbtn" data-signal="/telemetry off" data-echo="0" aria-label="close telemetry" title="close · /telemetry off">${X}</button></div>
      <div class="tbody"></div>
      <span class="tgrip" data-fn="teleresize" aria-hidden="true"></span></div>`;

const LOGGER = `<div class="tfil"><button class="cur " data-fn="telefilter" data-arg="all">all<span>1</span></button><button class=" " data-fn="telefilter" data-arg="activity">activity<span>0</span></button><button class=" " data-fn="telefilter" data-arg="repl">repl<span>1</span></button><button class=" " data-fn="telefilter" data-arg="net">net<span>0</span></button><button class=" neg" data-fn="telefilter" data-arg="faults">faults<span>1</span></button><span class="sp"></span><button class="ghost" data-signal="/telemetry/clear" data-echo="0">clear</button></div><div class="tsplit has"><div class="tl" role="tree"><div class="trow   d0" data-fn="telesel" data-arg="1" role="treeitem" aria-selected="false" title="/anima/terminal/terminal-1"><span class="tw" style="padding-left:0px"><button class="tfold" data-fn="telefold" data-arg="1:1" aria-label="fold">▾</button><span class="tc pri live" title="running"></span><span class="tn">terminal-1</span><span class="tbad">!</span></span><span class="tbar"><i class="pri" style="left:0.0%;width:100.0%"></i></span><span class="tms ">40ms</span></div><div class="trow sel neg d1" data-fn="telesel" data-arg="2" role="treeitem" aria-selected="true" title="/anima/terminal/terminal-1/lookup"><span class="tw" style="padding-left:14px"><span class="tfold"></span><span class="tc neg " title="failed"></span><span class="tn">lookup</span></span><span class="tbar"><i class="neg" style="left:25.0%;width:30.0%"></i></span><span class="tms ">12ms</span></div></div><div class="td"><div class="tdh"><span class="tc neg "></span><b>lookup</b><span class="chip neg">failed</span><span class="sp"></span><span class="mut">12ms</span><button class="iconbtn" data-fn="telesel" data-arg="" aria-label="close the detail">${X}</button></div>
      <div class="tkv"><span>path</span><code>/anima/terminal/terminal-1/lookup</code><span>span</span><code>2 · trace anima › terminal › terminal-1</code><span class="neg">fault</span><code class="neg">E_LOOKUP · no such word</code></div>

      <div class="tsec">records</div><div class="tents"><div class="tent"><span class="v">log</span><span class="t">+4ms</span><code title="{&quot;hit&quot;:0}">{&quot;hit&quot;:0}</code></div></div>
      </div></div>`;

const INSPECTOR = `<div class="ti"><div class="itab"><button class="ith" data-fn="teletable" data-arg="client" aria-expanded="true"><span class="tf">▾</span><b>client</b><span class="mut">anima</span></button><div class="itb"><div class="ir"><span class="ik">slug</span><span class="iv ro">anima</span></div><div class="ir"><span class="ik">theme</span><span class="iv ro">northsea</span></div></div></div><div class="itab"><button class="ith" data-fn="teletable" data-arg="activities" aria-expanded="false"><span class="tf">▸</span><b>activities</b><span class="mut">0</span></button></div><div class="itab"><button class="ith" data-fn="teletable" data-arg="telemetry" aria-expanded="true"><span class="tf">▾</span><b>telemetry</b><span class="mut">3 records</span></button><div class="itb"><div class="ir"><span class="ik">records</span><span class="iv ro">3</span></div><div class="ir act"><button class="" disabled>SIGSTOP</button><button class="neg" data-signal="/stop" data-echo="0">SIGTERM</button></div></div></div></div>`;

const FILTERS = [
  { id: "all", n: 1, cur: true },
  { id: "activity", n: 0, cur: false },
  { id: "repl", n: 1, cur: false },
  { id: "net", n: 0, cur: false },
  { id: "faults", n: 1, cur: false },
];
const ROWS = [
  { id: "1", depth: 0, nature: "terminal-1", path: "/anima/terminal/terminal-1", code: "RUNNING", dur: 40, live: true, fault: false, sub: true, kids: 1, open: true, l: 0, w: 100, sel: false },
  { id: "2", depth: 1, nature: "lookup", path: "/anima/terminal/terminal-1/lookup", code: "FAILED", dur: 12, live: false, fault: true, sub: false, kids: 0, open: false, l: 25, w: 30, sel: true },
];
const DETAIL = {
  id: "2",
  trace: "anima › terminal › terminal-1",
  nature: "lookup",
  path: "/anima/terminal/terminal-1/lookup",
  code: "FAILED",
  live: false,
  dur: 12,
  fault: { at: 20, code: "E_LOOKUP", message: "no such word" },
  signals: [],
  entries: [{ track: "log", rel: 4, data: '{"hit":0}' }],
  kids: [],
};
const TABLES = [
  { id: "client", title: "client", meta: "anima", open: true, rows: [{ k: "slug", kind: "ro", v: "anima" }, { k: "theme", kind: "ro", v: "northsea" }] },
  { id: "activities", title: "activities", meta: "0", open: false, rows: [{ k: "hallucination", kind: "ro", v: "running · 3 steps" }] },
  {
    id: "telemetry",
    title: "telemetry",
    meta: "3 records",
    open: true,
    rows: [
      { k: "records", kind: "ro", v: "3" },
      { k: "SIGSTOP", kind: "act", signal: "/pause", off: true, tone: "" },
      { k: "SIGTERM", kind: "act", signal: "/stop", off: false, tone: "neg" },
    ],
  },
];

specimen.describe("Tele · Logger · Inspector — the design's telemetry window, class tree for class tree", () => {
  specimen.it("Tele paints the dialog: drag head, tabs, count, close, body, grip — clamped into the bounds", () => {
    const calls = [];
    const rig = screen(() =>
      parts.Tele({ frame: { x: 12, y: 44, w: 640, h: 440 }, bounds: { width: 1280, height: 800 }, tab: "logger", count: 3, onTab: (tab) => calls.push(["tab", tab]), onClose: () => calls.push(["close"]), onPlace: () => {} }),
    );
    specimen.expect(painted(rig.target)).toEqual(oracle(TELE));
    fire(rig.target.querySelectorAll(".ttabs button")[1], "click");
    fire(rig.target.querySelector(".tth .iconbtn"), "click");
    specimen.expect(calls).toEqual([["tab", "inspector"], ["close"]]);
    rig.close();
  });

  specimen.it("placed() pulls a frame past the edge back inside the gutter and lifts a small one to its floor", () => {
    specimen.expect(parts.placed({ x: 900, y: 600, w: 640, h: 440 }, { width: 800, height: 500 })).toEqual({ x: 156, y: 56, w: 640, h: 440 });
    specimen.expect(parts.placed({ x: 0, y: 0, w: 100, h: 100 }, { width: 1280, height: 800 })).toEqual({ x: 4, y: 4, w: 320, h: 200 });
  });

  specimen.it("Logger with a fault row selected paints the design's filter bar, tree and detail", () => {
    const calls = [];
    const rig = screen(() =>
      parts.Logger({
        filters: FILTERS,
        rows: ROWS,
        detail: DETAIL,
        onFilter: (id) => calls.push(["filter", id]),
        onSelect: (id) => calls.push(["select", id]),
        onFold: (id, open) => calls.push(["fold", id, open]),
        onLine: (line) => calls.push(["line", line]),
      }),
    );
    specimen.expect(painted(rig.target)).toEqual(oracle(LOGGER));
    fire(rig.target.querySelector(".tfold"), "click");
    fire(rig.target.querySelectorAll(".trow")[1], "click");
    fire(rig.target.querySelector(".tfil .ghost"), "click");
    fire(rig.target.querySelector(".tdh .iconbtn"), "click");
    specimen.expect(calls).toEqual([["fold", "1", false], ["select", "2"], ["line", "/telemetry/clear"], ["select", null]]);
    rig.close();
  });

  specimen.it("Logger with no rows says no spans", () => {
    const rig = screen(() => parts.Logger({ filters: FILTERS, rows: [], detail: null, onFilter() {}, onSelect() {}, onFold() {}, onLine() {} }));
    specimen.expect(rig.target.querySelector(".tsplit").getAttribute("class")).toBe("tsplit");
    specimen.expect(rig.target.querySelector(".tl .tempty").textContent).toBe("no spans");
    rig.close();
  });

  specimen.it("Inspector with one table folded paints ro rows and one grouped act row", () => {
    const calls = [];
    const rig = screen(() => parts.Inspector({ tables: TABLES, onTable: (id, open) => calls.push(["table", id, open]), onLine: (line) => calls.push(["line", line]) }));
    specimen.expect(painted(rig.target)).toEqual(oracle(INSPECTOR));
    fire(rig.target.querySelectorAll(".ith")[1], "click");
    fire(rig.target.querySelector(".ir.act button.neg"), "click");
    specimen.expect(calls).toEqual([["table", "activities", true], ["line", "/stop"]]);
    rig.close();
  });

  specimen.it("an unknown status code is muted; an unknown row kind is loud", () => {
    specimen.expect([parts.tone("AUTHENTICATED"), parts.tone("FAILED")]).toEqual(["mut", "neg"]);
    specimen.expect([parts.stepped(0.38 - 0.05, 0.05), parts.stepped(6 + 1, 1), parts.setting({ path: "terminal.dock.view" }, "closed")]).toEqual([0.33, 7, "/set terminal.dock.view closed"]);
    specimen.expect(parts.grouped([{ kind: "act" }, { kind: "act" }, { kind: "ro" }, { kind: "act" }]).map((group) => [group.kind, group.rows.length])).toEqual([["act", 2], ["ro", 1], ["act", 1]]);
  });
});
