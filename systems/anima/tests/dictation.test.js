import * as esbuild from "esbuild";
import { atom } from "nanostores";
import { Vector, soma, specimen } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";
import { compile, fire, screen, settle } from "@vivalence/drapes/scenarios";
import { oracle, shape } from "../../../subsystems/drapes/tests/parts/oracle.js";

const DOCK = new URL("../src/skins/chrome/panels/dock/", import.meta.url).pathname;
const PARTS = new URL("../../../subsystems/drapes/parts.js", import.meta.url).pathname;
const GESTALTEN = new URL("../../ghost/gestalten/", import.meta.url).pathname;
const NODE_MODULES = new URL("../../../node_modules/", import.meta.url).pathname;

const ENTRY = `
import { createComponent } from "solid-js";
import * as ambient from "../../ambient/index.js";
import { Textarea } from "./textarea.jsx";
export { render } from "solid-js/web";
export const Mounted = (props) =>
  createComponent(ambient.app.Provider, {
    value: props.app,
    get children() {
      return createComponent(ambient.terminal.Provider, {
        value: props.terminal,
        get children() {
          return createComponent(Textarea, {});
        },
      });
    },
  });
`;

const GHOST = `
export { ambient } from "${GESTALTEN}ambient.js";
export * as belt from "${GESTALTEN}belt/index.js";
`;

const seams = {
  name: "dock-seams",
  setup(build) {
    build.onResolve({ filter: /^@vivalence\/drapes\/solid$/ }, () => ({ path: PARTS }));
    build.onResolve({ filter: /^@vivalence\/ghost$/ }, () => ({
      path: "ghost",
      namespace: "ghost",
    }));
    build.onLoad({ filter: /.*/, namespace: "ghost" }, () => ({
      contents: GHOST,
      loader: "js",
      resolveDir: GESTALTEN,
    }));
  },
};

const bundle = async () => {
  const result = await esbuild.build({
    stdin: { contents: ENTRY, resolveDir: DOCK, loader: "js" },
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
  const directory = await Deno.makeTempDir({ prefix: "anima-dock-" });
  await Deno.writeTextFile(`${directory}/dock.js`, result.outputFiles[0].text);
  return await import(`file://${directory}/dock.js`);
};

const dock = await bundle();

const absent = (rig, selector) => rig.target.querySelector(selector) === null;

const popover = (rig) => shape(rig.target.querySelector(".pcw")).split("\n").slice(1).join("\n");

const HEARD = [
  { event: "/turn/open", turn: { role: "user", id: "turn-1" } },
  { event: "/part/open", index: 0, part: { type: "text", text: "" } },
  { event: "/part/delta", index: 0, part: { text: "Vado al mercato." } },
  { event: "/part/close", index: 0 },
  { event: "/turn/close", turn: { meta: {} } },
  { event: "/turn/open", turn: { role: "user", id: "turn-2" } },
  { event: "/part/open", index: 0, part: { type: "text", text: "" } },
  { event: "/part/delta", index: 0, part: { text: "poi " } },
  { event: "/part/draft", index: 0, part: { text: "torno a" } },
];

const heard = (count) => HEARD.slice(0, count).reduce(soma.transcript, { turns: [], open: null });

const moded = (repl) => ({ repl, implements: (trait) => trait === "HARNESS", daemon: { $status: atom({ code: "HEALTHY" }) } });

const EARLESS = moded(new Vector());

const EARED = moded(new Vector().graft(ghost.commands.content.dictate));

const seated = (mode) => {
  const sent = [];
  const app = {
    bridge: {
      $draft: atom(""),
      $focus: atom("dock.input"),
      $selected: atom(0),
      $dictation: atom(null),
      $dictationFault: atom(null),
      $call: atom(null),
    },
    client: { runtime: { entities: { activity: { $entities: atom([]) } } } },
  };
  const terminal = {
    client: { app, modes: {} },
    $thread: atom({ id: "thread-1", mode }),
    get thread() {
      return this.$thread.get();
    },
    get mode() {
      return this.thread === null ? null : this.thread.mode;
    },
    legend: { dispatch: () => {} },
    controller: { stdout: { fault: (error) => sent.push(error) } },
  };
  terminal.repl = new ghost.terminal.Repl(terminal);
  terminal.repl.dispatch = (signal) => {
    sent.push(signal);
    return Promise.resolve();
  };
  const rig = screen(() => dock.Mounted({ app, terminal }), { render: dock.render });
  return { app, terminal, sent, rig };
};

const svg = (rem, drawn) => `<svg style="width:${rem}rem;height:${rem}rem">${drawn}</svg>`;
const CHEV2 = svg(0.875, "<path></path>");
const MIC = svg(1, "<rect></rect><path></path>");
const UP = svg(1, "<path></path>");
const STOP = svg(0.875, "<rect></rect>");
const TRASH = svg(0.875, "<path></path>");

const PC = (expanded) =>
  `<button class="pc" aria-label="control" aria-expanded="${expanded}" ` +
  `title="control · ctrl-v c">${CHEV2}</button>`;

const TEXTAREA = `<textarea id="textarea" rows="1" placeholder="say it, or / for a command" aria-label="dock textarea"></textarea>`;

const SEND = `<button class="send" aria-label="send" title="send · enter">${UP}</button>`;

const DEAF_MIC = `<button class="mic off" aria-disabled="true" aria-label="dictate" title="dictate · this mode's harness has no verbatim">${MIC}</button>`;

const EARLESS_FIELD = `<div class="field focus"><span class="pcw">${PC(false)}</span>${TEXTAREA}<span class="fk">${DEAF_MIC}${SEND}</span></div>`;

const EARED_FIELD = `<div class="field focus"><span class="pcw">${PC(false)}</span>${TEXTAREA}<span class="fk"><button class="mic" aria-label="dictate" title="dictate · /dictate">${MIC}</button>${SEND}</span></div>`;

const KROW = (key, name, value = "") =>
  `<button class="krow${value === "" ? "" : " sel"}"><span class="key">${key}</span><span class="nm">${name}</span><span class="val">${value}</span></button>`;

const MENUED = (...rows) =>
  `<div class="scrim"></div><div class="ctlmenu" data-zone="0" role="menu" aria-label="control">${rows.join("")}</div>`;

const EARLESS_MENU = MENUED(KROW("a", "attach"), KROW("p", "paste"));

const MENU = MENUED(KROW("a", "attach"), KROW("d", "dictate"), KROW("p", "paste"));

const LIVE_MENU = MENUED(KROW("a", "attach"), KROW("d", "stop dictation", "live"), KROW("p", "paste"));

const DICTLINE = (spoken, tail) =>
  `<div class="dictline"><span class="words"><span class="spoken">${spoken}</span><span class="tail">${tail}</span><span class="live">▍</span></span><button class="iconbtn trash" aria-label="trash the words" title="trash · /dictate/trash">${TRASH}</button></div>`;

const DICTATING_FIELD = `<div class="field dict focus"><span class="pcw">${PC(false)}</span>${TEXTAREA}<span class="fk"><button class="mic live" aria-label="stop dictation" title="stop dictation · /dictate/stop">${MIC}</button>${SEND}</span></div>`;

specimen.describe("anima dock.input — dictation (U1 · U2 · Q12 · Q15A) and the << popover (U3 · U4), each a repl signal", () => {
  specimen.it("no ear: the mic in dock.input is greyed and says why on hover, a click sends nothing; << holds attach · paste alone", async () => {
    const { rig, sent } = seated(EARLESS);
    await settle();
    specimen.expect(shape(rig.target)).toBe(oracle(EARLESS_FIELD));
    fire(rig.target.querySelector(".mic"), "click");
    fire(rig.target.querySelector(".pc"), "click");
    await settle();
    specimen.expect(popover(rig)).toBe(oracle(EARLESS_MENU));
    specimen.expect(rig.target.querySelector(".pc").getAttribute("aria-expanded")).toBe("true");
    specimen.expect(sent).toEqual([]);
    rig.close();
  });

  specimen.it("an ear: the mic sits before send and is /dictate; << opens the popover above dock.input", async () => {
    const { rig, sent } = seated(EARED);
    await settle();
    specimen.expect(shape(rig.target)).toBe(oracle(EARED_FIELD));
    fire(rig.target.querySelector(".mic"), "click");
    fire(rig.target.querySelector(".pc"), "click");
    await settle();
    specimen.expect(popover(rig)).toBe(oracle(MENU));
    specimen.expect(rig.target.querySelector(".pc").getAttribute("aria-expanded")).toBe("true");
    fire(rig.target.querySelectorAll(".ctlmenu .krow")[1], "click");
    await settle();
    specimen.expect(absent(rig, ".ctlmenu")).toBe(true);
    specimen.expect(sent).toEqual(["/dictate", "/dictate"]);
    rig.close();
  });

  specimen.it("the popover's keys: a row's letter runs it, Esc closes it and stops there, any other key passes", async () => {
    const { rig, sent, app } = seated(EARED);
    fire(rig.target.querySelector(".pc"), "click");
    await settle();
    const passed = fire(rig.target.querySelector(".ctlmenu"), "keydown", { key: "x" });
    const held = fire(rig.target.querySelector(".ctlmenu"), "keydown", { key: "d", ctrlKey: true });
    specimen.expect([passed.defaultPrevented, held.defaultPrevented, sent])
      .toEqual([false, false, []]);
    const escaped = fire(rig.target.querySelector(".ctlmenu"), "keydown", { key: "Escape" });
    await settle();
    specimen.expect([escaped.defaultPrevented, absent(rig, ".ctlmenu"), sent])
      .toEqual([true, true, []]);
    app.bridge.$focus.set(null);
    fire(rig.target.querySelector(".pc"), "click");
    await settle();
    const lettered = fire(rig.target.querySelector(".ctlmenu"), "keydown", { key: "d" });
    await settle();
    specimen.expect([lettered.defaultPrevented, absent(rig, ".ctlmenu"), sent])
      .toEqual([true, true, ["/dictate"]]);
    specimen.expect(app.bridge.$focus.get()).toBe("dock.input");
    fire(rig.target.querySelector(".pc"), "click");
    await settle();
    fire(rig.target.querySelector(".scrim"), "click");
    await settle();
    specimen.expect(absent(rig, ".ctlmenu")).toBe(true);
    rig.close();
  });

  specimen.it("a held dictation: the line above dock.input says listening, then the spoken words solid and the tail muted", async () => {
    const { rig, app } = seated(EARED);
    app.bridge.$dictation.set(heard(0));
    await settle();
    specimen.expect(shape(rig.target))
      .toBe(oracle(`${DICTLINE("", "listening")}${DICTATING_FIELD}`));
    app.bridge.$dictation.set(heard(HEARD.length));
    await settle();
    specimen.expect(shape(rig.target))
      .toBe(oracle(`${DICTLINE("Vado al mercato. poi", " torno a")}${DICTATING_FIELD}`));
    app.bridge.$dictation.set(heard(4));
    await settle();
    specimen.expect(shape(rig.target.querySelector(".words")))
      .toBe(oracle(`<span class="spoken">Vado al mercato.</span><span class="tail"></span>` +
        `<span class="live">▍</span>`));
    app.bridge.$dictation.set(null);
    await settle();
    const dict = rig.target.querySelector(".field").classList.contains("dict");
    specimen.expect([absent(rig, ".dictline"), dict]).toEqual([true, false]);
    rig.close();
  });

  specimen.it("a faulted dictation: the line stays and says why, the mic is /dictate again; its trash is /dictate/trash; a live dictation hides it", async () => {
    const { rig, app, sent } = seated(EARED);
    app.bridge.$dictationFault.set({ message: "socket 1006" });
    await settle();
    const line = rig.target.querySelector(".dictline.fault");
    specimen.expect([line.querySelector(".spoken").textContent, line.querySelector(".tail").textContent, line.querySelector(".words").title])
      .toEqual(["dictation failed", " socket 1006", "socket 1006"]);
    specimen.expect(rig.target.querySelector(".mic").getAttribute("aria-label")).toBe("dictate");
    specimen.expect(rig.target.querySelector(".field").classList.contains("dict")).toBe(false);
    fire(line.querySelector(".trash"), "click");
    await settle();
    specimen.expect(sent).toEqual(["/dictate/trash"]);
    app.bridge.$dictation.set(heard(0));
    await settle();
    specimen.expect(absent(rig, ".dictline.fault")).toBe(true);
    rig.close();
  });

  specimen.it("a mode whose /dictate lands after the mount (HARNESS awaits its metadata): the mic is off, then live once its host turns HEALTHY", async () => {
    const late = { ...moded(new Vector()), daemon: { $status: atom({ code: "MOUNTING" }) } };
    const { rig } = seated(late);
    await settle();
    const mic = () => rig.target.querySelector(".fk .mic").className;
    specimen.expect(mic()).toBe("mic off");
    late.repl.graft(ghost.commands.content.dictate);
    late.daemon.$status.set({ code: "HEALTHY" });
    await settle();
    specimen.expect(mic()).toBe("mic");
    rig.close();
  });

  specimen.it("the exits of a held dictation are lines: trash · the mic stop · Enter and send send; one stop, the mic; the d row reads stop dictation · live", async () => {
    const { rig, app, terminal, sent } = seated(EARED);
    app.bridge.$draft.set("allora");
    app.client.runtime.entities.activity.$entities.set([{ thread: terminal.thread, status: "RUNNING" }]);
    await settle();
    specimen.expect([rig.target.querySelectorAll(".stop").length, rig.target.querySelectorAll(".send").length]).toEqual([1, 0]);
    app.bridge.$dictation.set(heard(HEARD.length));
    await settle();
    specimen.expect([rig.target.querySelectorAll(".stop").length, rig.target.querySelectorAll(".send").length]).toEqual([0, 1]);
    fire(rig.target.querySelector(".dictline .trash"), "click");
    fire(rig.target.querySelector(".mic"), "click");
    fire(rig.target.querySelector("textarea"), "keydown", { key: "Enter", shiftKey: false });
    fire(rig.target.querySelector(".send"), "click");
    await settle();
    specimen.expect(sent).toEqual([
      "/dictate/trash",
      "/dictate/stop",
      "/dictate/send",
      "/dictate/send",
    ]);
    specimen.expect(app.bridge.$draft.get()).toBe("allora");
    fire(rig.target.querySelector(".pc"), "click");
    await settle();
    specimen.expect(popover(rig)).toBe(oracle(LIVE_MENU));
    fire(rig.target.querySelector(".ctlmenu"), "keydown", { key: "d" });
    await settle();
    specimen.expect(sent.at(-1)).toBe("/dictate/stop");
    rig.close();
  });

  specimen.it("the ear is the thread's mode: an earless thread greys the mic, an eared one lights it, a harnessless one says so", async () => {
    const { rig, terminal } = seated(EARLESS);
    const mic = () => [rig.target.querySelector(".mic").className, rig.target.querySelector(".mic").title];
    await settle();
    specimen.expect(mic()).toEqual(["mic off", "dictate · this mode's harness has no verbatim"]);
    terminal.$thread.set({ id: "thread-2", mode: EARED });
    await settle();
    specimen.expect(mic()).toEqual(["mic", "dictate · /dictate"]);
    terminal.$thread.set({ id: "thread-3", mode: { repl: new Vector(), implements: () => false, daemon: { $status: atom({ code: "HEALTHY" }) } } });
    await settle();
    specimen.expect(mic()).toEqual(["mic off", "dictate · this thread's mode has no harness"]);
    rig.close();
  });
});
