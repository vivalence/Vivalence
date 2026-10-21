import { specimen, trace } from "@vivalence/typology";
import { fire, paint, settle, surface, world } from "./world.js";

const KEPT = ["role", "title", "disabled", "data-zone", "aria-label", "aria-selected", "aria-expanded", "aria-hidden", "aria-checked", "aria-pressed", "viewBox", "d"];

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
  const host = globalThis.document.createElement("div");
  host.innerHTML = html;
  return merged([...host.childNodes]).flatMap(shape);
};
const painted = (target) => merged([...target.childNodes]).flatMap(shape);

const X = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>`;

const head = (tab, count) =>
  `<div class="tth" data-fn="teledrag" title="drag to move"><span class="ttl">telemetry</span><span class="ttabs"><button class="${tab === "logger" ? "cur" : ""}" data-fn="teletab" data-arg="logger">logger</button><button class="${tab === "inspector" ? "cur" : ""}" data-fn="teletab" data-arg="inspector">inspector</button></span><span class="sp"></span><span class="mut">${count}</span><button class="iconbtn" data-line="/telemetry off" data-echo="0" aria-label="close telemetry" title="close · /telemetry off">${X}</button></div>`;

const clocked = () => {
  const real = globalThis.performance.now;
  const clock = { t: 1 };
  globalThis.performance.now = () => clock.t;
  return { clock, restore: () => (globalThis.performance.now = real) };
};

const seated = async (tele) => {
  const { clock, restore } = clocked();
  const held = world();
  held.client.surface.$tele.set({ ...held.client.surface.tele, ...tele });
  held.seat();
  clock.t = 2;
  held.authorize();
  held.activate();
  clock.t = 10;
  const lookup = held.controller.stdout.branch("lookup");
  lookup.start();
  clock.t = 22;
  lookup.fault(new Error("no such word"));
  clock.t = 50;
  const rig = paint(() => surface.Tele({ client: held.client }));
  await settle();
  return { ...held, lookup, clock, restore, rig };
};

specimen.describe("anima tele — the telemetry window over the client's own records, activities and entities", () => {
  specimen.it("closed: $tele.open false paints nothing; /telemetry opens it, /telemetry off shuts it", async () => {
    const held = await seated({});
    try {
      specimen.expect(held.rig.target.innerHTML).toBe("");
      held.client.surface.$tele.set({ ...held.client.surface.$tele.get(), open: true });
      await settle();
      specimen.expect(held.rig.target.querySelector(".tele[data-zone='3'][role='dialog']")).not.toBe(null);
      fire(held.rig.target.querySelector(".tth .iconbtn"), "click");
      specimen.expect(held.sent).toEqual(["/telemetry off"]);
    } finally {
      held.rig.close();
      held.restore();
    }
  });

  specimen.it("logger with a fault row selected: the design's tree and detail over real span records", async () => {
    const held = await seated({ open: true, view: "logger" });
    try {
      const quoted = (id) => id.replaceAll('"', "&quot;");
      const anima = quoted(trace.key(held.controller.stdout.absolute));
      const lookup = quoted(trace.key(held.lookup.absolute));
      held.client.surface.$tele.set({ ...held.client.surface.$tele.get(), folds: { [trace.key(held.controller.stdout.absolute)]: true }, sel: trace.key(held.lookup.absolute) });
      await settle();
      const lighthouse = trace.pathname(held.lighthouse.stdout.absolute);
      const LOGGER = `<div class="tele" data-zone="3" role="dialog" aria-label="telemetry" style="left:4px;top:48px;width:600px;height:420px">
      ${head("logger", 4)}
      <div class="tbody"><div class="tfil"><button class="cur " data-fn="telefilter" data-arg="all">all<span>1</span></button><button class=" " data-fn="telefilter" data-arg="activity">activity<span>0</span></button><button class=" " data-fn="telefilter" data-arg="repl">repl<span>1</span></button><button class=" " data-fn="telefilter" data-arg="net">net<span>0</span></button><button class=" neg" data-fn="telefilter" data-arg="faults">faults<span>1</span></button><span class="sp"></span><button class="ghost" data-line="/telemetry/clear" data-echo="0">clear</button></div><div class="tsplit has"><div class="tl" role="tree"><div class="trow   d0" data-fn="telesel" data-arg="${anima}" role="treeitem" aria-selected="false" title="anima"><span class="tw" style="padding-left:0px"><button class="tfold" data-fn="telefold" data-arg="${anima}:1" aria-label="fold">▾</button><span class="tc mut " title="idle"></span><span class="tn">anima</span><span class="tbad">!</span></span><span class="tbar"><i class="mut" style="left:0.0%;width:1.5%"></i></span><span class="tms ">—</span></div><div class="trow   d1" data-fn="telesel" data-arg="${quoted(trace.key(held.lighthouse.stdout.absolute))}" role="treeitem" aria-selected="false" title="${lighthouse}"><span class="tw" style="padding-left:14px"><span class="tfold"></span><span class="tc mut " title="authenticated"></span><span class="tn">lighthouse</span></span><span class="tbar"><i class="mut" style="left:0.0%;width:100.0%"></i></span><span class="tms ">—</span></div><div class="trow sel neg d1" data-fn="telesel" data-arg="${lookup}" role="treeitem" aria-selected="true" title="anima/lookup"><span class="tw" style="padding-left:14px"><span class="tfold"></span><span class="tc neg " title="failed"></span><span class="tn">lookup</span></span><span class="tbar"><i class="neg" style="left:20.0%;width:24.0%"></i></span><span class="tms ">—</span></div></div><div class="td"><div class="tdh"><span class="tc neg "></span><b>lookup</b><span class="chip neg">failed</span><span class="sp"></span><span class="mut">—</span><button class="iconbtn" data-fn="telesel" data-arg="" aria-label="close the detail">${X}</button></div>
      <div class="tkv"><span>path</span><code>anima/lookup</code><span>span</span><code>${lookup} · trace anima</code><span class="neg">fault</span><code class="neg">no such word</code></div>


      </div></div></div>
      <span class="tgrip" data-fn="teleresize" aria-hidden="true"></span></div>`;
      specimen.expect(painted(held.rig.target)).toEqual(oracle(LOGGER));
      fire(held.rig.target.querySelectorAll(".trow")[2], "click");
      specimen.expect(held.client.surface.$tele.get().sel).toBe(null);
      fire(held.rig.target.querySelector(".tfil .ghost"), "click");
      specimen.expect(held.sent).toEqual(["/telemetry/clear"]);
    } finally {
      held.rig.close();
      held.restore();
    }
  });

  specimen.it("inspector with one table folded: client · runtime · lighthouse · terminal · thread · buffers · activities · telemetry", async () => {
    const held = await seated({ open: true, view: "inspector", tables: { activities: false } });
    try {
      const ro = (k, value) => `<div class="ir"><span class="ik">${k}</span><span class="iv ro">${value}</span></div>`;
      const CHEV = `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>`;
      const line = (l, extra) => `data-line="${l}"${extra ? ` data-echo="0"` : ""}`;
      const icon = () => CHEV;
      const attr = (value) => String(value);
      const esc = (value) => String(value);
      const E = (k, path, v, opts) => `<div class="ir"><span class="ik">${esc(k)}</span><span class="iv"><label class="asel"><select data-linesel="1" aria-label="${attr(k)}">${opts.map((o) => `<option value="${attr(`/set ${path} ${o}`)}" ${String(o) === v ? "selected" : ""}>${esc(String(o).toLowerCase())}</option>`).join("")}</select>${icon("chev", 12)}</label></span></div>`;
      const B = (k, path, v) => `<div class="ir"><span class="ik">${esc(k)}</span><span class="iv"><button class="tog ${v ? "on" : ""}" ${line(`/set ${path} ${!v}`, 1)} role="switch" aria-checked="${v}"><i></i></button></span></div>`;
      const N = (k, path, v, step, min, max) => `<div class="ir"><span class="ik">${esc(k)}</span><span class="iv num"><button ${line(`/set ${path} ${Math.max(min, v - step)}`, 1)} aria-label="less">−</button><input data-setpath="${attr(path)}" value="${attr(v)}" inputmode="numeric" aria-label="${attr(k)}"><button ${line(`/set ${path} ${Math.min(max, v + step)}`, 1)} aria-label="more">+</button></span></div>`;
      const X = (k, path, v) => `<div class="ir"><span class="ik">${esc(k)}</span><span class="iv"><input data-setpath="${attr(path)}" value="${attr(v)}" spellcheck="false" aria-label="${attr(k)}"></span></div>`;
      const SET = (k, path, opts, on) => `<div class="ir"><span class="ik">${esc(k)}</span><span class="iv chips">${opts.map((o) => `<button class="${on.includes(o) ? "on" : ""}" ${line(`/set ${path} ${o}`, 1)} aria-pressed="${on.includes(o)}">${esc(o.toLowerCase())}</button>`).join("")}</span></div>`;
      const GROUPS = ["terminals", "threads", "modes", "buffers", "activity", "harness", "display", "box", "system", "control"];
      const table = (id, meta, rows) =>
        `<div class="itab"><button class="ith" data-fn="teletable" data-arg="${id}" aria-expanded="${rows !== null}"><span class="tf">${rows !== null ? "▾" : "▸"}</span><b>${id}</b><span class="mut">${meta}</span></button>${rows !== null ? `<div class="itb">${rows}</div>` : ""}</div>`;
      const INSPECTOR = `<div class="tele" data-zone="3" role="dialog" aria-label="telemetry" style="left:4px;top:48px;width:600px;height:420px">
      ${head("inspector", 4)}
      <div class="tbody"><div class="ti">${[
        table("client", "anima", ro("slug", "anima") + ro("type", "client") + ro("theme", held.client.theme) + ro("narrow", "false") + B("sidebar", "surface.sidebar", true) + SET("hidden", "surface.hidden", GROUPS, [])),
        table("runtime", "healthy", ro("reference", "/runtime/stub") + ro("status", "healthy")),
        table("lighthouse", "authenticated", ro("standing", "authenticated") + ro("user", "beef") + ro("traits", "AUTOLOGIN") + `<div class="ir act"><button class="neg" data-line="/lighthouse/logout" data-echo="0">sign out</button></div>`),
        table("terminal", "docked", ro("terminal", "1 of 2") + E("view", "terminal.dock.view", "docked", ["docked", "full", "closed", "messenger"]) + E("align", "terminal.dock.align", "right", ["left", "right"]) + N("share", "terminal.dock.share", 0.38, 0.05, 0.2, 0.8) + E("lens", "terminal.dock.lens", "repl", ["chat", "repl", "trace"]) + `<div class="ir act"><button class="" data-line="/terminal/new" data-echo="0">new terminal</button><button class="neg" data-line="/terminal/close" data-echo="0">close terminal</button></div>`),
        table("thread", "chat/chat", X("label", "thread.label", "first words") + ro("mode", "chat/chat") + ro("turns", "2") + E("tune", "thread.tune", "fast", ["frugal", "fast", "balanced", "capable", "unleashed", "eager"]) + E("effort", "thread.effort", "low", ["none", "low", "medium", "high"]) + N("rounds", "thread.rounds", 6, 1, 1, 50)),
        table("buffers", "0", ro("buffers", "0") + ro("seated", "—")),
        table("activities", "0", null),
        table("telemetry", "4 records", ro("records", "4") + ro("spans", "3") + `<div class="ir act"><button class="neg" data-line="/telemetry/clear" data-echo="0">clear</button></div>`),
      ].join("")}</div></div>
      <span class="tgrip" data-fn="teleresize" aria-hidden="true"></span></div>`;
      specimen.expect(painted(held.rig.target)).toEqual(oracle(INSPECTOR));
      fire(held.rig.target.querySelectorAll(".ith")[6], "click");
      specimen.expect(held.client.surface.$tele.get().tables).toEqual({ activities: true });
      fire(held.rig.target.querySelector(".ir.act button.neg"), "click");
      fire(held.rig.target.querySelector(".tog"), "click");
      fire(held.rig.target.querySelector(".iv.num button[aria-label='less']"), "click");
      fire(held.rig.target.querySelector(".iv.chips button"), "click");
      const view = held.rig.target.querySelector("select[aria-label='view']");
      fire(view, "change");
      const label = held.rig.target.querySelector("input[aria-label='label']");
      label.value = "six species";
      fire(label, "change");
      specimen.expect(held.sent).toEqual(["/lighthouse/logout", "/set surface.sidebar false", "/set terminal.dock.share 0.33", "/set surface.hidden terminals", "/set terminal.dock.view docked", "/set thread.label six species"]);
    } finally {
      held.rig.close();
      held.restore();
    }
  });

  specimen.it("an activity is a root: its steps fold as children, its status is the code, every signal is offered while it is not settled", () => {
    const view = surface.teleView({
      tele: { ...world().client.surface.tele, sel: "act-1" },
      records: [],
      activities: [
        {
          id: "act-1",
          type: "HALLUCINATION",
          status: "RUNNING",
          thread: "thread-1",
          error: null,
          steps: [
            { at: 100, path: ["hallucination"], track: "start" },
            { at: 120, path: ["hallucination", "lookup"], track: "start" },
            { at: 140, path: ["hallucination", "lookup"], track: "stop" },
          ],
        },
      ],
      now: 0,
    });
    specimen.expect(view.rows.map((row) => [row.depth, row.nature, row.code])).toEqual([
      [0, "hallucination", "RUNNING"],
      [1, "hallucination", "RUNNING"],
    ]);
    specimen.expect(view.filters.find((filter) => filter.id === "activity").n).toBe(1);
    specimen.expect(view.detail.signals.map((signal) => [signal.sig, signal.line, signal.off])).toEqual([
      ["SIGTERM", "/stop", false],
      ["SIGSTOP", "/pause", false],
      ["SIGCONT", "/resume", false],
      ["SIGKILL", "/abort", false],
    ]);
  });
});
