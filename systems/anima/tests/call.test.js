import * as esbuild from "esbuild";
import { atom } from "nanostores";
import { specimen, Vector } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";
import { compile, fire, screen, settle, words } from "@vivalence/drapes/scenarios";
import { oracle, shape } from "../../../subsystems/drapes/tests/parts/oracle.js";

const PANELS = new URL("../src/skins/chrome/panels/dock/", import.meta.url).pathname;
const PARTS = new URL("../../../subsystems/drapes/parts.js", import.meta.url).pathname;
const GESTALTEN = new URL("../../ghost/gestalten/", import.meta.url).pathname;
const NODE_MODULES = new URL("../../../node_modules/", import.meta.url).pathname;

const ENTRY = `
import { createComponent } from "solid-js";
import * as ambient from "../../ambient/index.js";
import { Textarea } from "./textarea.jsx";
import { Journal } from "./journal.jsx";
import { Modeline, Widget } from "../modeline/modeline.jsx";
export { render } from "solid-js/web";
const seated = (part) => (props) =>
  createComponent(ambient.app.Provider, {
    value: props.app,
    get children() {
      return createComponent(ambient.terminal.Provider, {
        value: props.terminal,
        get children() {
          return createComponent(part, {});
        },
      });
    },
  });
export const textarea = seated(Textarea);
export const journal = seated(Journal);
export const modeline = seated(Modeline);
export const widget = seated(Widget);
`;

const GHOST = `
export { ambient } from "${GESTALTEN}ambient.js";
export * as belt from "${GESTALTEN}belt/index.js";
`;

const seams = {
  name: "call-seams",
  setup(build) {
    build.onResolve({ filter: /^@vivalence\/drapes\/solid$/ }, () => ({ path: PARTS }));
    build.onResolve({ filter: /^@vivalence\/ghost$/ }, () => ({ path: "ghost", namespace: "ghost" }));
    build.onLoad({ filter: /.*/, namespace: "ghost" }, () => ({
      contents: GHOST,
      loader: "js",
      resolveDir: GESTALTEN,
    }));
  },
};

const bundle = async () => {
  const result = await esbuild.build({
    stdin: { contents: ENTRY, resolveDir: PANELS, loader: "js" },
    bundle: true,
    format: "esm",
    platform: "browser",
    write: false,
    external: ["@vivalence/typology", "@vivalence/dapper", "nanostores"],
    nodePaths: [NODE_MODULES],
    plugins: [seams, compile],
    logLevel: "silent",
  });
  await esbuild.stop();
  const directory = await Deno.makeTempDir({ prefix: "anima-call-" });
  await Deno.writeTextFile(`${directory}/call.js`, result.outputFiles[0].text);
  return await import(`file://${directory}/call.js`);
};

const chrome = await bundle();

const EARED = new Vector().graft(
  ghost.commands.content.dictate,
  ghost.commands.content.polish,
  ghost.commands.content.call,
  ghost.commands.content.mic,
);

const EARLESS = new Vector();

const CONVERSATIONAL = {
  language: ["it"],
  hear: { provider: "deepgram", id: "flux-general-multi" },
  speak: { provider: "elevenlabs", tier: "fast" },
  call: {},
  polish: { id: "google/gemini-3.5-flash-lite", engaged: true },
};

const moded = (repl) => ({
  type: "chat",
  slug: "chat",
  daemon: null,
  repl,
  reference: { absolute: "/runtime/stub/mode/chat/chat" },
  implements: () => false,
});

const LANDED = "2026-11-17T10:00:00.000Z";

const seated = (repl, turns = []) => {
  const sent = [];
  const mode = moded(repl);
  const thread = {
    id: "thread-1",
    word: "first words",
    mode,
    traits: ["CONVERSATIONAL"],
    trait: { CONVERSATIONAL },
    $turns: atom(turns),
    $buffers: atom([]),
  };
  const lighthouse = {
    isAuthorized: true,
    status: { code: "VERIFIED" },
    user: { slug: "beef" },
    $user: atom({ slug: "beef" }),
    $status: atom({ code: "VERIFIED" }),
  };
  const entities = {
    terminal: { $entities: atom([]) },
    thread: { $entities: atom([thread]) },
    mode: { $entities: atom([mode]) },
    daemon: { $entities: atom([]) },
    activity: { $entities: atom([]) },
    file: { $entities: atom([]) },
  };
  const runtime = {
    reference: { absolute: "/runtime/stub" },
    status: { code: "HEALTHY" },
    $status: atom({ code: "HEALTHY" }),
    lighthouse,
    entities,
  };
  const app = {
    theme: "northsea",
    box: new ghost.app.Box({}),
    bridge: new ghost.app.Bridge(),
    client: { runtime, mask: { manifest: { slug: "anima" } } },
    telemetry: {
      $state: atom({ open: false }),
      get state() {
        return this.$state.get();
      },
    },
  };
  const terminal = {
    id: "terminal-1",
    index: 0,
    client: { app, modes: {} },
    $thread: atom(thread),
    get thread() {
      return this.$thread.get();
    },
    get mode() {
      return this.thread === null ? null : this.thread.mode;
    },
    $buffer: atom(null),
    get buffer() {
      return this.$buffer.get();
    },
    dock: { view: "docked", align: "right", share: 0.38, lens: ["turns"], markdown: "plain" },
    legend: { $chord: atom(null), chord: null, presses: { backlog: [] }, dispatch: () => {} },
    controller: { stdout: { $history: atom([]), fault: (error) => sent.push(error) } },
  };
  entities.terminal.$entities.set([terminal]);
  terminal.repl = new ghost.terminal.Repl(terminal);
  terminal.repl.dispatch = (signal) => {
    sent.push(signal);
    return Promise.resolve();
  };
  return { app, terminal, thread, sent };
};

const painted = (world, ...regions) =>
  screen(() => regions.map((region) => chrome[region]({ app: world.app, terminal: world.terminal })), {
    render: chrome.render,
  });

const live = (state, seconds) => ({ state, since: Date.now() - seconds * 1000, heard: {} });

const svg = (rem, drawn) => `<svg style="width:${rem}rem;height:${rem}rem">${drawn}</svg>`;
const CHEV2 = svg(0.875, "<path></path>");
const MIC = svg(1, "<rect></rect><path></path>");
const SPEAKER = svg(1, "<path></path><path></path>");
const STOP = svg(0.75, "<rect></rect>");

const rings = (count, lit, label, pct) =>
  `<span class="meter" title="${label} ${pct} %">` +
  Array.from({ length: count }, (_, index) => `<i class="${index < lit ? "on" : ""}"></i>`).join("") +
  "</span>";

const CALLLINE = ({ paused = false, word, speaking = false, heard, played, dur }) =>
  `<div class="field call"><span class="pcw"><button class="pc" aria-label="control" aria-expanded="false" ` +
  `title="control · ctrl-v c">${CHEV2}</button></span>` +
  `<button class="mic${paused ? " paused" : ""}" aria-label="${paused ? "unmute" : "mute"}" ` +
  `title="${paused ? "unmute · /mic on" : "mute · /mic mute"}">${MIC}</button>` +
  heard +
  `<span class="word">${word}</span><span class="sp"></span>` +
  `<span class="speaker${speaking ? " live" : ""}">${SPEAKER}</span>` +
  played +
  `<span class="dur">${dur}</span>` +
  `<button class="end" aria-label="end the call" title="end · /call/end">${STOP}end</button></div>`;

const segment = (rig) => rig.target.querySelector(".seg[data-arg='activity']");

const grouped = (rig, label) => {
  const rows = [...rig.target.querySelectorAll(".wid .subjb > *")];
  const at = rows.findIndex((row) => row.matches(".srow.sub") && row.firstChild.textContent === label);
  const after = rows.slice(at + 1);
  const end = after.findIndex((row) => row.matches(".srow.sub"));
  return [rows[at], ...(end === -1 ? after : after.slice(0, end))].map((row) => row.outerHTML).join("");
};

const opened = (world, id) => world.app.bridge.$widget.set({ id, x: 0, bottom: 40, room: 600 });

specimen.describe("anima · the call (m123 milestone 7): the call line, the journal's captions, the bar's voice, the thread and box panels", () => {
  specimen.it("the call line takes dock.input's place: << · mic + level · state word · speaker + level · duration · ■ end", async () => {
    const world = seated(EARED);
    const rig = painted(world, "textarea");
    await settle();
    specimen.expect(rig.target.querySelector(".field.call")).toBe(null);
    world.app.box.device.microphone.$level.set(0.5);
    world.app.bridge.$call.set(live("listening", 12));
    await settle();
    specimen.expect(rig.target.querySelector("textarea")).toBe(null);
    specimen.expect(shape(rig.target)).toBe(oracle(CALLLINE({
      word: "listening",
      heard: rings(4, 2, "microphone", 50),
      played: rings(4, 0, "speaker", 0),
      dur: "0:12",
    })));
    world.app.bridge.$call.set({ ...world.app.bridge.call, state: "thinking" });
    await settle();
    specimen.expect(words(rig.target.querySelector(".word"))).toBe("thinking");
    world.app.box.device.speaker.$playing.set(true);
    world.app.bridge.$call.set({ ...world.app.bridge.call, state: "speaking" });
    await settle();
    specimen.expect(shape(rig.target)).toBe(oracle(CALLLINE({
      word: "speaking",
      speaking: true,
      heard: rings(4, 2, "microphone", 50),
      played: rings(4, 4, "speaker", 100),
      dur: "0:12",
    })));
    world.app.box.device.speaker.$playing.set(false);
    world.app.box.device.microphone.$paused.set(true);
    world.app.bridge.$call.set({ ...world.app.bridge.call, state: "listening" });
    await settle();
    specimen.expect(shape(rig.target)).toBe(oracle(CALLLINE({
      paused: true,
      word: "muted",
      heard: rings(4, 2, "microphone", 50),
      played: rings(4, 0, "speaker", 0),
      dur: "0:12",
    })));
    rig.close();
  });

  specimen.it("the call line's controls are lines: the mic mutes and unmutes, ■ ends, << offers end the call · live", async () => {
    const world = seated(EARED);
    world.app.bridge.$call.set(live("listening", 3));
    const rig = painted(world, "textarea");
    await settle();
    fire(rig.target.querySelector(".field.call .mic"), "click");
    world.app.box.device.microphone.$paused.set(true);
    await settle();
    fire(rig.target.querySelector(".field.call .mic"), "click");
    fire(rig.target.querySelector(".field.call .end"), "click");
    fire(rig.target.querySelector(".field.call .pc"), "click");
    await settle();
    specimen.expect([...rig.target.querySelectorAll(".ctlmenu .krow")].map((row) => words(row)))
      .toEqual(["a attach", "d dictate", "l end the call live", "p paste"]);
    fire(rig.target.querySelector(".ctlmenu"), "keydown", { key: "l" });
    await settle();
    specimen.expect(world.sent).toEqual(["/mic mute", "/mic on", "/call/end", "/call/end"]);
    world.app.bridge.$call.set(null);
    await settle();
    specimen.expect([rig.target.querySelector(".field.call"), rig.target.querySelector("textarea") !== null])
      .toEqual([null, true]);
    rig.close();
  });

  specimen.it("the journal: a caption's settled words solid, its draft tail muted; a reply spoken over is muted past heard with its trace", async () => {
    const turns = [
      {
        id: "u1",
        role: "user",
        createdAt: LANDED,
        parts: [{ type: "text", text: "raccontami", draft: { text: "una storia" } }],
      },
      {
        id: "a1",
        role: "assistant",
        createdAt: LANDED,
        parts: [{ type: "text", text: "C'era una volta un re che viveva in un castello." }],
        meta: { state: "interrupted" },
      },
    ];
    const world = seated(EARED, turns);
    world.app.bridge.$call.set({ ...live("listening", 30), heard: { a1: 2 } });
    const rig = painted(world, "journal");
    await settle();
    const [you, agent] = rig.target.querySelectorAll(".entry");
    specimen.expect(shape(you.querySelector(".text")))
      .toBe(oracle(`raccontami<span class="tail"> una storia</span>`));
    specimen.expect(shape(agent.querySelector(".body")))
      .toBe(oracle(
        `<div class="text">C'era una volta un re <span class="tail">che viveva in un castello.</span></div>` +
          `<div class="heard">interrupted · heard 0:02</div>`,
      ));
    world.app.bridge.$call.set(null);
    await settle();
    specimen.expect(shape(rig.target.querySelectorAll(".entry")[1].querySelector(".body")))
      .toBe(oracle(`<div class="text">C'era una volta un re che viveva in un castello.</div><div class="heard">interrupted</div>`));
    rig.close();
  });

  specimen.it("the journal: a turn the provider faulted paints its fault as a ! row; an empty faulted turn paints only the fault", async () => {
    const fault = { kind: "request", message: "400 messages.58.content.0: Invalid `signature` in `thinking` block" };
    const turns = [
      { id: "u1", role: "user", createdAt: LANDED, parts: [{ type: "text", text: "hola" }] },
      { id: "a1", role: "assistant", createdAt: LANDED, parts: [], meta: { state: "error", rounds: 1, fault } },
      { id: "u2", role: "user", createdAt: LANDED, parts: [{ type: "text", text: "otra vez" }] },
      { id: "a2", role: "assistant", createdAt: LANDED, parts: [{ type: "text", text: "medio" }], meta: { state: "error", rounds: 2, fault } },
    ];
    const world = seated(EARED, turns);
    const rig = painted(world, "journal");
    await settle();
    const kinds = [...rig.target.querySelectorAll(".entry")].map((entry) => [
      entry.className.split(" ")[1],
      entry.querySelector(".text").firstChild.textContent,
    ]);
    specimen.expect(kinds).toEqual([
      ["you", "hola"],
      ["fault", "reply failed · request"],
      ["you", "otra vez"],
      ["agent", "medio"],
      ["fault", "reply failed · request"],
    ]);
    specimen.expect(rig.target.querySelector(".entry.fault .detail")).toBe(null);
    fire(rig.target.querySelector(".entry.fault .text .tc"), "click");
    await settle();
    specimen.expect(rig.target.querySelector(".entry.fault .detail").textContent).toBe(fault.message);
    rig.close();
  });

  specimen.it("the process segment carries the voice: idle · dictate · listening · thinking · speaking · muted, each with its meter", async () => {
    const world = seated(EARED);
    const rig = painted(world, "modeline");
    await settle();
    const stated = () => [segment(rig).className, shape(segment(rig))];
    specimen.expect(stated()).toEqual([
      "seg proc idle",
      oracle(`<span class="dot" style="opacity:.35"></span><span class="lab">idle</span>`),
    ]);
    world.app.box.device.microphone.$level.set(0.75);
    world.app.bridge.$dictation.set({ turns: [], open: null });
    await settle();
    specimen.expect(stated()).toEqual([
      "seg proc voice dictate",
      oracle(`<span class="mic">${svg(0.8125, "<rect></rect><path></path>")}</span>${rings(4, 3, "dictate", 75)}<span class="lab">dictate</span>`),
    ]);
    world.app.bridge.$dictation.set(null);
    world.app.bridge.$call.set(live("listening", 65));
    await settle();
    specimen.expect(stated()).toEqual([
      "seg proc voice listening",
      oracle(`<span class="mic">${svg(0.8125, "<rect></rect><path></path>")}</span>${rings(4, 3, "listening", 75)}<span class="lab">listening · 1:05</span>`),
    ]);
    world.app.bridge.$call.set({ ...world.app.bridge.call, state: "thinking" });
    await settle();
    specimen.expect(stated()).toEqual([
      "seg proc voice thinking",
      oracle(`<span class="dot live pri"></span><span class="lab">thinking · 1:05</span>`),
    ]);
    world.app.box.device.speaker.$playing.set(true);
    world.app.bridge.$call.set({ ...world.app.bridge.call, state: "speaking" });
    await settle();
    specimen.expect(stated()).toEqual([
      "seg proc voice speaking",
      oracle(`<span class="speaker">${svg(0.8125, "<path></path><path></path>")}</span>${rings(4, 4, "speaking", 100)}<span class="lab">speaking · 1:05</span>`),
    ]);
    world.app.box.device.microphone.$paused.set(true);
    world.app.bridge.$call.set({ ...world.app.bridge.call, state: "listening" });
    await settle();
    specimen.expect(stated()).toEqual([
      "seg proc voice muted",
      oracle(`<span class="dot"></span>${rings(4, 3, "muted", 75)}<span class="lab">muted · 1:05</span>`),
    ]);
    rig.close();
  });

  specimen.it("a click on the process segment ends whatever runs, as a line: /call/end, then /dictate/stop; idle, it opens its widget", async () => {
    const world = seated(EARED);
    const rig = painted(world, "modeline");
    rig.target.classList.add("client");
    world.app.bridge.$dictation.set({ turns: [], open: null });
    world.app.bridge.$call.set(live("speaking", 4));
    await settle();
    fire(segment(rig), "click");
    world.app.bridge.$call.set(null);
    await settle();
    fire(segment(rig), "click");
    world.app.bridge.$dictation.set(null);
    await settle();
    fire(segment(rig), "click");
    await settle();
    specimen.expect([world.sent, world.app.bridge.widget.id]).toEqual([["/call/end", "/dictate/stop"], "activity"]);
    rig.close();
  });

  specimen.it("the box segment's mic follows the microphone: off · live · muted; the speaker shows while it plays", async () => {
    const world = seated(EARED);
    const rig = painted(world, "modeline");
    const boxed = () => shape(rig.target.querySelector(".seg[data-arg='box']"));
    const CUBE = svg(1.125, "<path></path><path></path>");
    const MIKED = svg(0.8125, "<rect></rect><path></path>");
    await settle();
    specimen.expect(boxed()).toBe(oracle(`<span class="light">${CUBE}</span>`));
    world.app.box.device.microphone.$claimed.set(true);
    world.app.box.device.speaker.$playing.set(true);
    await settle();
    specimen.expect(boxed()).toBe(oracle(
      `<span class="neg">${CUBE}</span><span class="neg">${MIKED}</span>` +
        `<span class="pri">${svg(0.8125, "<path></path><path></path>")}</span>`,
    ));
    world.app.box.device.microphone.$paused.set(true);
    world.app.box.device.speaker.$playing.set(false);
    await settle();
    specimen.expect(boxed()).toBe(oracle(`<span class="cau">${CUBE}</span><span class="cau">${MIKED}</span>`));
    rig.close();
  });

  specimen.it("the harness panel with an ear: conversational folds, closed by default; open, hear · speak · call · polish + engaged, the mode's voice; engaged is a line", async () => {
    const world = seated(EARED);
    const rig = painted(world, "modeline", "widget");
    opened(world, "harness");
    await settle();
    const held = document.createElement("div");
    held.innerHTML = grouped(rig, "conversational");
    specimen.expect(shape(held)).toBe(oracle(
      `<div class="srow sub strip"><button class="hit" aria-expanded="false">conversational</button><span class="tally"></span><span class="view" role="group" aria-label="view"></span><button class="chev" aria-label="fold">▸</button></div>`,
    ));
    fire(rig.target.querySelector(".wid .srow.strip button.chev"), "click");
    await settle();
    held.innerHTML = grouped(rig, "conversational");
    specimen.expect(shape(held)).toBe(oracle(
      `<div class="srow sub strip"><button class="hit" aria-expanded="true">conversational</button><span class="tally"></span><span class="view" role="group" aria-label="view"></span><button class="chev" aria-label="fold">▾</button></div>` +
        `<div class="srow value"><span class="lab">hear</span><span class="v">deepgram · flux-general-multi</span></div>` +
        `<div class="srow value"><span class="lab">speak</span><span class="v">elevenlabs · fast</span></div>` +
        `<div class="srow value"><span class="lab">call</span><span class="v">default</span></div>` +
        `<div class="srow value"><span class="lab">polish</span><span class="v">google/gemini-3.5-flash-lite</span></div>` +
        `<div class="srow choice"><span class="cl">engaged</span><span class="cc">` +
        `<button class="cur" title="/polish/engaged on">on</button><button title="/polish/engaged off">off</button></span></div>` +
        `<div class="srow value"><span class="lab">mode voice</span><span class="v">dictate · call</span></div>`,
    ));
    fire(rig.target.querySelector(".wid button[title='/polish/engaged off']"), "click");
    await settle();
    specimen.expect(world.sent).toEqual(["/polish/engaged off"]);
    rig.close();
  });

  specimen.it("the harness panel with no ear: hear · call · polish and the mode's voice absent, one quiet line says so; the mic greys; nothing throws", async () => {
    const world = seated(EARLESS);
    world.app.bridge.$sections.set({ ...world.app.bridge.sections, expand: { conversational: true } });
    const rig = painted(world, "modeline", "widget", "textarea");
    opened(world, "harness");
    await settle();
    const held = document.createElement("div");
    held.innerHTML = grouped(rig, "conversational");
    specimen.expect(shape(held)).toBe(oracle(
      `<div class="srow sub strip"><button class="hit" aria-expanded="true">conversational</button><span class="tally"></span><span class="view" role="group" aria-label="view"></span><button class="chev" aria-label="fold">▾</button></div>` +
        `<div class="srow value"><span class="lab">speak</span><span class="v">elevenlabs · fast</span></div>` +
        `<div class="srow note">no hallucinator hears · hear, call, polish stay absent</div>`,
    ));
    specimen.expect([rig.target.querySelector(".mic").className, world.sent]).toEqual(["mic off", []]);
    rig.close();
  });

  specimen.it("the box panel: microphone meter + mute, speaker meter, permission; the keys are lines", async () => {
    const world = seated(EARED);
    const rig = painted(world, "modeline", "widget");
    world.app.box.device.microphone.$claimed.set(true);
    world.app.box.device.microphone.$level.set(0.4);
    world.app.box.device.microphone.$permission.set("granted");
    world.app.box.device.speaker.$claimed.set(true);
    opened(world, "box");
    await settle();
    const rows = () => [...rig.target.querySelectorAll(".wid .subjb > *")].slice(0, 4).map((row) => row.outerHTML).join("");
    const held = document.createElement("div");
    held.innerHTML = rows();
    specimen.expect(shape(held)).toBe(oracle(
      `<div class="srow meter"><span class="cl">microphone</span><span class="track">` +
        `<span class="fill neg" style="width:40%"></span></span><span class="v">live</span></div>` +
        `<div class="srow keys"><button class="sk off" title="/mic on">mic on</button>` +
        `<button class="sk" title="/mic mute">mute</button></div>` +
        `<div class="srow meter"><span class="cl">speaker</span><span class="track">` +
        `<span class="fill" style="width:0%"></span></span><span class="v">idle</span></div>` +
        `<div class="srow value"><span class="dot pos"></span><span class="lab">permission</span><span class="v">granted</span></div>`,
    ));
    fire(rig.target.querySelector(".wid button[title='/mic mute']"), "click");
    world.app.box.device.microphone.$paused.set(true);
    world.app.box.device.speaker.$playing.set(true);
    await settle();
    held.innerHTML = rows();
    specimen.expect(words(held)).toBe("microphone muted mic on mute speaker playing permission granted");
    fire(rig.target.querySelector(".wid button[title='/mic on']"), "click");
    await settle();
    specimen.expect(world.sent).toEqual(["/mic mute", "/mic on"]);
    rig.close();
  });
});
