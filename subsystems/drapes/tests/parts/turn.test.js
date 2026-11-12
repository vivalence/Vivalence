import { specimen } from "@vivalence/typology";
import { fire, parts, screen } from "../scenarios/index.js";
import { WORLDS } from "../../design/worlds.js";
import { oracle, shape } from "./oracle.js";

const YOU = `<div class="entry you headed " data-fn="jsel" data-arg="2"><div class="ehead"><span class="reg">&lt;&lt;</span><span class="who">beef</span><span class="meta">12:04</span><span class="ops"><button data-fn="copy" data-arg="2">copy</button><button data-fn="retry" data-arg="2">retry</button></span></div><div class="body"><div class="text">play e4 and tell me why</div></div></div>`;

const AGENT = `<div class="entry agent headed " data-fn="jsel" data-arg="1"><div class="ehead"><span class="reg">&gt;&gt;</span><span class="meta">r3/10</span><button class="tc on" title="show or hide the harness" aria-expanded="true"><svg class="cv open"><path></path></svg>2 tools</button><span class="ops"><button data-fn="copy" data-arg="1">copy</button></span></div><div class="body"><div class="text">Reading the position.<span class="cursor"></span></div><div class="tools"><div class="toolc pos"><button class="tool" aria-expanded="false"><svg class="cv"><path></path></svg><span class="g pos">✓</span><span class="name">match_board</span><span class="arg">{}</span><span class="dur">0.4s</span></button></div><div class="toolc pri"><button class="tool" aria-expanded="false"><svg class="cv"><path></path></svg><span class="g pri">◐</span><span class="name">match_move</span><span class="arg">{ "uci": "e2e4" }</span><span class="dur">…</span></button></div></div></div></div>`;


const TRACE = `<div class="entry trace  sel" data-fn="jsel" data-arg="1"><div class="reg">·</div><div class="body"><div class="text"><span class="ts">12:04:19</span>strip · 14 verbs<span class="path">/anima/client/terminal/t1/strip</span></div><div class="verbs"><button data-fn="copy" data-arg="1"><b>c</b>copy</button></div></div></div>`;

const COMMAND = `<div class="entry cmd  " data-fn="jsel" data-arg="0"><div class="reg">&lt;&lt;</div><div class="body"><div class="text">/thread e4 openings</div><div class="ans">thread e4 openings</div></div></div>`;

const FAULT = `<div class="entry fault  " data-fn="jsel" data-arg="2"><div class="reg">!</div><div class="body"><div class="text">provider timeout · r3 · fs_write</div></div></div>`;

const BLOCKED = `<div class="entry agent headed " data-fn="jsel" data-arg="0"><div class="ehead"><span class="reg">&gt;&gt;</span><span class="meta"></span><span class="ops"><button data-fn="copy" data-arg="0">copy</button><button data-signal="/buffer board">frame</button></span></div><div class="body"><div class="text">the board</div><div class="blocks"><div class="block prog"><span class="lbl">harvest</span><span class="track"><span class="fill " style="width:40%"></span></span><span class="pct">40 %</span></div></div></div></div>`;

const painted = (props) => {
  const rig = screen(() => parts.Turn(props));
  return { rig, shape: shape(rig.target) };
};

specimen.describe("Turn — the design's .entry (dom.js:252), one journal row by register", () => {
  specimen.it("you: headed — reg · who · meta · ops copy retry, then .text", () => {
    const { rig, shape: painted_ } = painted(WORLDS.idle.journal[2]);
    specimen.expect(painted_).toBe(oracle(YOU));
    rig.close();
  });

  specimen.it("agent: ops copy; the byline counts its tools; tools by status with the design's glyph tones; streaming wears .cursor", () => {
    const { rig, shape: painted_ } = painted(WORLDS.running.journal[1]);
    specimen.expect(painted_).toBe(oracle(AGENT));
    rig.close();
  });

  specimen.it("the byline's triangle hides the calls and shows them again; the pick stays with the entry", () => {
    const picked = [];
    const rig = screen(() => parts.Turn({ ...WORLDS.running.journal[1], onPick: () => picked.push(true) }));
    const toggle = rig.target.querySelector(".ehead .tc");
    specimen.expect(toggle.textContent).toBe("2 tools");
    fire(toggle, "click");
    specimen.expect(rig.target.querySelector(".tools")).toBe(null);
    specimen.expect([toggle.getAttribute("aria-expanded"), toggle.classList.contains("on")]).toEqual(["false", false]);
    fire(toggle, "click");
    specimen.expect(rig.target.querySelectorAll(".tools .toolc").length).toBe(2);
    specimen.expect(picked).toEqual([]);
    rig.close();
  });

  specimen.it("trace: unheaded · ts · text · path under the trace lens; selected shows the verbs row", () => {
    const { rig, shape: painted_ } = painted({ ...WORLDS.idle.journal[1], lens: ["repl"], selected: true });
    specimen.expect(painted_).toBe(oracle(TRACE));
    rig.close();
  });

  specimen.it("cmd carries its answer in .ans; fault reads !", () => {
    const command = painted(WORLDS.idle.journal[0]);
    specimen.expect(command.shape).toBe(oracle(COMMAND));
    command.rig.close();
    const fault = painted(WORLDS.faulted.journal[2]);
    specimen.expect(fault.shape).toBe(oracle(FAULT));
    fault.rig.close();
  });

  specimen.it("a fault's detail folds behind a details triangle, closed; open shows it, copy takes both", () => {
    const fault = { ...WORLDS.faulted.journal[2], detail: "400 {\"type\":\"error\"}", selected: true };
    const rig = screen(() => parts.Turn(fault));
    const body = () => shape(rig.target.querySelector(".body"));
    specimen.expect(body()).toBe(oracle(
      `<div class="text">provider timeout · r3 · fs_write<button class="tc" title="show or hide the details" aria-expanded="false"><svg class="cv"><path></path></svg>details</button></div>` +
        `<div class="verbs"><button><b>c</b>copy</button></div>`,
    ));
    fire(rig.target.querySelector(".text .tc"), "click");
    specimen.expect(body()).toBe(oracle(
      `<div class="text">provider timeout · r3 · fs_write<button class="tc on" title="show or hide the details" aria-expanded="true"><svg class="cv open"><path></path></svg>details</button></div>` +
        `<div class="detail">400 {"type":"error"}</div><div class="verbs"><button><b>c</b>copy</button></div>`,
    ));
    rig.close();
  });

  specimen.it("children land in .blocks; a buffer adds the frame op, which is the /buffer line", () => {
    const sent = [];
    const rig = screen(() =>
      parts.Turn({
        kind: "agent",
        text: "the board",
        buffer: "board",
        onLine: (line) => sent.push(line),
        get children() {
          return parts.Prog({ label: "harvest", pct: 40, done: false });
        },
      }),
    );
    specimen.expect(shape(rig.target)).toBe(oracle(BLOCKED));
    fire([...rig.target.querySelectorAll(".ops button")].at(-1), "click");
    specimen.expect(sent).toEqual(['/buffer "board"']);
    rig.close();
  });

  specimen.it("markdown pretty paints a headed reply through .md; plain and a trace keep the raw text", () => {
    const pretty = screen(() => parts.Turn({ kind: "agent", text: "## Opening\n\n**e4** controls d5", markdown: "pretty" }));
    specimen.expect(pretty.target.querySelector(".text .md h2").textContent).toBe("Opening");
    specimen.expect(pretty.target.querySelector(".text .md strong").textContent).toBe("e4");
    pretty.close();
    const plain = screen(() => parts.Turn({ kind: "agent", text: "**e4**" }));
    specimen.expect(plain.target.querySelector(".text .md")).toBe(null);
    specimen.expect(plain.target.querySelector(".text").textContent).toBe("**e4**");
    plain.close();
    const trace = screen(() => parts.Turn({ kind: "trace", text: "**e4**", markdown: "pretty" }));
    specimen.expect(trace.target.querySelector(".text .md")).toBe(null);
    trace.close();
  });

  specimen.it("a register outside the design's six is loud", () => {
    specimen.expect(() => screen(() => parts.Turn({ kind: "command", text: "" }))).toThrow("not a journal register");
  });

  specimen.it("segments paint in the order they arrived: thinking · text · calls · text; the cursor rides the last", () => {
    const segments = [
      { type: "think", items: [{ depth: 1, status: "ok", label: "look it up", text: "look it up", dur: 0, tools: [] }] },
      { type: "text", items: ["let me check"] },
      { type: "tools", items: [{ name: "lookup", arg: "{}", input: {}, status: "ok", dur: "", yield: { message: "found" } }] },
      { type: "text", items: ["found it"] },
    ];
    const rig = screen(() => parts.Turn({ kind: "agent", text: "let me check\n\nfound it", segments, streaming: true }));
    const body = rig.target.querySelector(".body");
    specimen.expect([...body.children].map((child) => child.className.split(" ")[0])).toEqual(["tools", "text", "tools", "text"]);
    specimen.expect(rig.target.querySelector(".ehead .tc").textContent).toBe("1 tool · 1 thinking");
    specimen.expect(body.querySelector(".toolc.thought .name").textContent).toBe("thinking");
    fire(body.querySelector(".toolc.thought .tool"), "click");
    specimen.expect(body.querySelector(".toolc.thought .thx").textContent).toBe("look it up");
    specimen.expect([...body.querySelectorAll(".text")].map((text) => [text.textContent, text.querySelector(".cursor") !== null])).toEqual([["let me check", false], ["found it", true]]);
    rig.close();
  });
});
