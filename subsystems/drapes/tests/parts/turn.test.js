import { specimen } from "@vivalence/typology";
import { fire, parts, screen } from "../scenarios/index.js";
import { WORLDS } from "../../design/worlds.js";
import { oracle, shape } from "./oracle.js";

const YOU = `<div class="entry you headed " data-fn="jsel" data-arg="2"><div class="ehead"><span class="reg">&lt;&lt;</span><span class="who">beef</span><span class="meta">12:04</span><span class="ops"><button data-fn="copy" data-arg="2">copy</button><button data-fn="retry" data-arg="2">retry</button></span></div><div class="body"><div class="text">play e4 and tell me why</div></div></div>`;

const AGENT = `<div class="entry agent headed " data-fn="jsel" data-arg="1"><div class="ehead"><span class="reg">&gt;&gt;</span><span class="meta">r3/10</span><span class="ops"><button data-fn="copy" data-arg="1">copy</button><button data-fn="fold" data-arg="1">fold</button></span></div><div class="body"><div class="text">Reading the position.<span class="cursor"></span></div><div class="tools"><div class="tool" data-fn="tool" data-arg="1:0" title=""><span class="g pos">✓</span><span class="name">match_board</span><span class="arg">{}</span><span class="dur">0.4s</span></div><div class="tool" data-fn="tool" data-arg="1:1" title=""><span class="g pri">◐</span><span class="name">match_move</span><span class="arg">{ "uci": "e2e4" }</span><span class="dur">…</span></div></div></div></div>`;

const FOLDED = `<div class="entry agent headed " data-fn="jsel" data-arg="1"><div class="ehead"><span class="reg">&gt;&gt;</span><span class="meta">r3/10</span><span class="ops"><button data-fn="copy" data-arg="1">copy</button><button data-fn="fold" data-arg="1">unfold</button></span></div><div class="body"><div class="text">folded</div></div></div>`;

const TRACE = `<div class="entry trace  sel" data-fn="jsel" data-arg="1"><div class="reg">·</div><div class="body"><div class="text"><span class="ts">12:04:19</span>strip · 14 verbs<span class="path">/anima/client/terminal/t1/strip</span></div><div class="verbs"><button data-fn="copy" data-arg="1"><b>c</b>copy</button></div></div></div>`;

const COMMAND = `<div class="entry cmd  " data-fn="jsel" data-arg="0"><div class="reg">&lt;&lt;</div><div class="body"><div class="text">/thread e4 openings</div><div class="ans">thread e4 openings</div></div></div>`;

const FAULT = `<div class="entry fault  " data-fn="jsel" data-arg="2"><div class="reg">!</div><div class="body"><div class="text">provider timeout · r3 · fs_write</div></div></div>`;

const BLOCKED = `<div class="entry agent headed " data-fn="jsel" data-arg="0"><div class="ehead"><span class="reg">&gt;&gt;</span><span class="meta"></span><span class="ops"><button data-fn="copy" data-arg="0">copy</button><button data-fn="fold" data-arg="0">fold</button><button data-signal="/buffer board">frame</button></span></div><div class="body"><div class="text">the board</div><div class="blocks"><div class="block prog"><span class="lbl">harvest</span><span class="track"><span class="fill " style="width:40%"></span></span><span class="pct">40 %</span></div></div></div></div>`;

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

  specimen.it("agent: ops copy fold; tools by status with the design's glyph tones; streaming wears .cursor", () => {
    const { rig, shape: painted_ } = painted(WORLDS.running.journal[1]);
    specimen.expect(painted_).toBe(oracle(AGENT));
    rig.close();
  });

  specimen.it("fold collapses the body to 'folded' and flips the op to unfold", () => {
    const rig = screen(() => parts.Turn(WORLDS.running.journal[1]));
    fire([...rig.target.querySelectorAll(".ops button")].at(-1), "click");
    specimen.expect(shape(rig.target)).toBe(oracle(FOLDED));
    rig.close();
  });

  specimen.it("trace: unheaded · ts · text · path under the trace lens; selected shows the verbs row", () => {
    const { rig, shape: painted_ } = painted({ ...WORLDS.idle.journal[1], lens: "trace", selected: true });
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
});
