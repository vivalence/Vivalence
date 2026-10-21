import { specimen } from "@vivalence/typology";
import { fire, parts, screen } from "../scenarios/index.js";
import { oracle, shape } from "./oracle.js";

const painted = (part) => {
  const rig = screen(part);
  const held = shape(rig.target);
  rig.close();
  return held;
};

const YIELDED = `<div class="tool" data-fn="tool" data-arg="1:0" title="click for the yield"><span class="g neg">✕</span><span class="lp">loop</span><span class="name">fs_write</span><span class="arg">{"path":"a"}</span><span class="dur">0.2s</span></div><div class="yield"><span style="padding-left:0px"><span class="k">message</span> <span class="s">"denied"</span></span></div>`;

const THINK_SHUT = `<div class="think  "><button class="thh" data-fn="think" data-arg="1" aria-expanded="false"><span class="g">✓</span><span class="l">thinking</span><span class="m">1 steps · 0 calls</span><span class="cv">▸</span></button></div>`;

const THINK_LIVE = `<div class="think live open"><button class="thh" data-fn="think" data-arg="1" aria-expanded="true"><span class="g">◐</span><span class="l">thinking</span><span class="m">2 steps · 1 calls · weigh d4</span><span class="cv">▾</span></button><div class="thb"><div class="thn d1 ok"><div class="tht"><span class="g">✓</span><span class="l">weigh e4</span><span class="dur">1.5s</span></div><div class="thx">e4 opens the bishop</div></div><div class="thn d1 run"><div class="tht"><span class="g">◐</span><span class="l">weigh d4</span><span class="dur"></span></div><div class="thx">d4 holds the centre<span class="cursor"></span></div><div class="tools"><div class="tool" data-fn="tool" data-arg="1:n1:0" title=""><span class="g pri">◐</span><span class="name">match_board</span><span class="arg">{}</span><span class="dur">…</span></div></div></div></div></div>`;

const TABLE = `<div class="block"><table><thead><tr><th>slug</th><th>mime</th></tr></thead><tbody><tr><td>board</td><td>json</td></tr></tbody></table></div>`;

const SELECT = `<div class="block"><div class="opts"><button data-signal="/tune fast">fast</button><button data-signal="/tune capable">capable</button></div></div>`;

const PROG = `<div class="block prog"><span class="lbl">harvest</span><span class="track"><span class="fill cau" style="width:90%"></span></span><span class="pct">90 %</span></div>`;

const DONE = `<div class="block prog"><span class="lbl">harvest</span><span class="track"><span class="fill done" style="width:100%"></span></span><span class="pct">done</span></div>`;

const BENCH = `<div class="block bench" data-zone="3"><div class="bh"><span>tools · 1 / 2 armed</span><span>chess</span></div><button class="item " data-signal="/tools/toggle match_move" data-echo="0"><span class="mark">●</span><span class="nm">match_move</span><span class="meta">board/play</span></button><button class="item off" data-signal="/tools/toggle fs_write" data-echo="0"><span class="mark">○</span><span class="nm">fs_write</span><span class="meta">paladin</span></button><div class="bf">a click arms or disarms · /tools/toggle ‹name›</div></div>`;

const ARTCARD = `<div class="artcard inframe"><div class="ah"><span class="sign">◆</span><span class="al">artifact</span><span>chess/chess</span><label class="asel" title="artifact 1 · cell · json&#10;artifact 2 · cell · solid"><select data-signalsel="1" aria-label="artifact"><option value="/cell/set play board" selected>artifact 1</option><option value="/cell/set glance board">artifact 2</option></select><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg></label><button class="iconbtn full" data-signal="/buffer/full board" data-echo="0" aria-label="fullscreen" title="fullscreen · /buffer/full board"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h4v4M13 3 8.5 7.5M7 13H3V9M3 13l4.5-4.5"/></svg></button></div><div class="ab"><div class="sub">board</div></div></div>`;

const ATTS = `<div class="atts"><button class="att" data-signal="/detach notes.txt" data-echo="0" title="drop · /detach notes.txt">notes.txt<span class="x">✕</span></button></div>`;

const DICTLINE = `<div class="dictline"><span class="neg">◉</span><span class="lvl"><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i><i class=""></i><i class=""></i><i class=""></i><i class=""></i></span><span class="muted">listening…</span><button class="iconbtn" data-signal="/dictate" title="stop · /dictate"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="8" height="8" rx="1"/></svg></button></div>`;

const MD = `<div class="md"><p><strong>bene</strong>, grazie — the <em>Sicilian</em> answers <code>e4</code> with c5.</p><ul><li>open games</li><li>closed games</li></ul></div>`;

const JSON_ROWS = `<div class="yield" style="padding:8px 12px 10px"><span style="padding-left:0px"><span class="k">turn</span> <span class="s">"white"</span></span><span style="padding-left:0px"><span class="k">legal</span> <span class="m">[1]</span></span><span style="padding-left:14px"><span class="k">0</span> <span class="s">"e2e4"</span></span><span style="padding-left:0px"><span class="k">clock</span> <span class="n">300</span></span><span style="padding-left:0px"><span class="k">mate</span> <span class="m">null</span></span><span style="padding-left:0px"><span class="k">over</span> <span class="b">false</span></span></div>`;

specimen.describe("journal parts — Tool · Think · Block · Bench · Prog · Artcard · Atts · Dictline · Markdown · Yield, each the design's markup", () => {
  specimen.it("Tool (dom.js:255): shut, then a click opens its .yield", () => {
    const rig = screen(() => parts.Tool({ tool: { name: "fs_write", arg: '{"path":"a"}', status: "err", dur: "0.2s", loop: true, yield: { message: "denied" } } }));
    fire(rig.target.querySelector(".tool"), "click");
    specimen.expect(shape(rig.target)).toBe(oracle(YIELDED));
    rig.close();
    specimen.expect(() => screen(() => parts.Tool({ tool: { name: "x", arg: "", status: "pending", dur: "" } }))).toThrow("not a tool status");
  });

  specimen.it("Think (dom.js:264): settled stays shut; a live node opens it, names the running step, carries the cursor", () => {
    specimen.expect(painted(() => parts.Think({ nodes: [{ depth: 1, status: "ok", label: "weigh e4", text: "e4", dur: 0, tools: [] }] }))).toBe(oracle(THINK_SHUT));
    const nodes = [
      { depth: 1, status: "ok", label: "weigh e4", text: "e4 opens the bishop", dur: 1500, tools: [] },
      { depth: 1, status: "run", label: "weigh d4", text: "d4 holds the centre", dur: 0, tools: [{ name: "match_board", arg: "{}", status: "run", dur: "" }] },
    ];
    specimen.expect(painted(() => parts.Think({ nodes }))).toBe(oracle(THINK_LIVE));
  });

  specimen.it("Block (dom.js:232): table · select · progress; an option is its line; an unknown type is loud", () => {
    specimen.expect(painted(() => parts.Block({ block: { type: "table", head: ["slug", "mime"], rows: [["board", "json"]] } }))).toBe(oracle(TABLE));
    const sent = [];
    const rig = screen(() => parts.Block({ block: { type: "select", options: [{ label: "fast", signal: "/tune fast" }, { label: "capable", signal: "/tune capable" }] }, onLine: (line) => sent.push(line) }));
    specimen.expect(shape(rig.target)).toBe(oracle(SELECT));
    fire(rig.target.querySelectorAll("button")[1], "click");
    specimen.expect(sent).toEqual(["/tune capable"]);
    rig.close();
    specimen.expect(painted(() => parts.Block({ block: { type: "progress", label: "harvest", pct: 90, done: false } }))).toBe(oracle(PROG));
    specimen.expect(painted(() => parts.Prog({ label: "harvest", pct: 100, done: true }))).toBe(oracle(DONE));
    specimen.expect(() => screen(() => parts.Block({ block: { type: "keymap" } }))).toThrow("not a block");
  });

  specimen.it("Bench (dom.js:240): head · items armed ● / off ○ · foot; an item is its line", () => {
    const sent = [];
    const items = [
      { name: "match_move", meta: "board/play", off: false, signal: "/tools/toggle match_move" },
      { name: "fs_write", meta: "paladin", off: true, signal: "/tools/toggle fs_write" },
    ];
    const rig = screen(() => parts.Bench({ head: "tools · 1 / 2 armed", meta: "chess", items, foot: "a click arms or disarms · /tools/toggle ‹name›", onLine: (line) => sent.push(line) }));
    specimen.expect(shape(rig.target)).toBe(oracle(BENCH));
    fire(rig.target.querySelectorAll(".item")[1], "click");
    specimen.expect(sent).toEqual(["/tools/toggle fs_write"]);
    rig.close();
  });

  specimen.it("Artcard (dom.js:212): head sign · label · mode · asel · fullscreen, the body as children", () => {
    const fulls = [];
    const picks = [
      { label: "artifact 1", signal: "/cell/set play board", title: "artifact 1 · cell · json", current: true },
      { label: "artifact 2", signal: "/cell/set glance board", title: "artifact 2 · cell · solid", current: false },
    ];
    const rig = screen(() =>
      parts.Artcard({
        mode: "chess/chess",
        label: "board",
        inframe: true,
        picks,
        onPick: () => {},
        onFull: () => fulls.push("full"),
        get children() {
          const body = document.createElement("div");
          body.className = "ab";
          body.innerHTML = '<div class="sub">board</div>';
          return body;
        },
      }),
    );
    specimen.expect(shape(rig.target)).toBe(oracle(ARTCARD));
    fire(rig.target.querySelector(".full"), "click");
    specimen.expect(fulls).toEqual(["full"]);
    rig.close();
  });

  specimen.it("Atts (dom.js:284) · Dictline (dom.js:285): chips that drop, eight level bars over the tail", () => {
    specimen.expect(painted(() => parts.Atts({ attachments: [{ name: "notes.txt" }], onDrop: () => {} }))).toBe(oracle(ATTS));
    specimen.expect(painted(() => parts.Atts({ attachments: [], onDrop: () => {} }))).toBe("");
    specimen.expect(painted(() => parts.Dictline({ level: 0.4, tail: "", onStop: () => {} }))).toBe(oracle(DICTLINE));
  });

  specimen.it("Markdown (dom.js:187) is .md over plain tags; Yield + JsonTree (dom.js:201) are the flat k · s · n · b · m rows", () => {
    specimen.expect(painted(() => parts.Markdown({ text: "**bene**, grazie — the *Sicilian* answers `e4` with c5.\n\n- open games\n- closed games" }))).toBe(oracle(MD));
    specimen.expect(painted(() => parts.Yield({ value: { turn: "white", legal: ["e2e4"], clock: 300, mate: null, over: false }, style: { padding: "8px 12px 10px" } }))).toBe(oracle(JSON_ROWS));
  });
});
