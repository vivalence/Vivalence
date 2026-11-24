import { palette, parts, screen, settle } from "@vivalence/sheets/scenarios";
import * as esbuild from "esbuild";
import { atom } from "nanostores";
import { createComponent } from "@opentui/solid";
import { RGBA } from "@opentui/core";
import { Vector, belt, specimen, v } from "@vivalence/typology";
import { options } from "../../../skins/chrome/bundle.js";
import { Microphone } from "../../../subjects/app/prototypes/box/device/microphone/index.js";
import { Speaker } from "../../../subjects/app/prototypes/box/device/speaker/index.js";
import { dictate } from "../../../gestalten/commands/content/dictate.js";
import { call as calling } from "../../../gestalten/commands/content/call.js";
import { mic } from "../../../gestalten/commands/content/mic.js";
import { polish } from "../../../gestalten/commands/content/polish.js";

const CHROME = new URL("../../../skins/chrome/", import.meta.url).pathname;

const ENTRY = [
  `export * as ambient from "./ambient/index.js";`,
  `export * as textarea from "./panels/dock/textarea.jsx";`,
  `export * as journal from "./panels/dock/journal.jsx";`,
  `export * as modeline from "./panels/modeline/modeline.jsx";`,
  `export * as popover from "./panels/modeline/popover.jsx";`,
].join("\n");

const compiled = parts
  .then(() => Deno.makeTempDir({ prefix: "ghost-voice-" }))
  .then(async (directory) => {
    const { entryPoints, ...bundled } = options(`${directory}/voice.mjs`);
    await esbuild.build({ ...bundled, stdin: { contents: ENTRY, resolveDir: CHROME, loader: "js" } });
    await esbuild.stop();
    return import(`file://${directory}/voice.mjs`);
  });

const BODY = palette("northsea", "1");
const CHROMED = palette("northsea", "0");

const CONVERSATIONAL = {
  hear: { provider: "elevenlabs", id: "scribe_v3_live" },
  speak: { provider: "elevenlabs", id: "flash_v2_5" },
  polish: { engaged: false },
};

const world = (held = {}) => {
  const ear = held.ear ?? true;
  const sent = [];
  const faults = [];
  const commands = ear ? new Vector().graft(dictate, calling, polish, mic) : new Vector();
  const thread = {
    id: "th1",
    word: "e4 openings",
    mode: {
      id: "m1",
      type: "board",
      slug: "play",
      reference: { absolute: "/daemon/memo/mode/board/play" },
      implements: () => false,
    },
    traits: ["CONVERSATIONAL"],
    trait: belt.traits.cast({ traits: ["CONVERSATIONAL"], trait: { CONVERSATIONAL } }, v.thread.traits),
    $activities: atom([]),
    $turns: atom(held.turns ?? []),
    $buffers: atom([]),
  };
  const terminal = {
    id: "t1",
    $thread: atom(thread),
    get thread() {
      return this.$thread.get();
    },
    dock: { lens: ["turns"], markdown: "plain", view: "docked", align: "right" },
    repl: {
      $catalog: atom(null),
      get commands() {
        return commands;
      },
      dispatch: async (typed) => void sent.push(typed),
    },
    legend: { $chord: atom(null) },
    controller: { stdout: { $history: atom([]), fault: (error) => void faults.push(error.message) } },
    client: {
      runtime: {
        entities: { terminal: { $entities: atom([]) }, thread: { $entities: atom([thread]) } },
        lighthouse: { $user: atom({ slug: "ana" }) },
      },
    },
  };
  const microphone = new Microphone({ drivers: {} });
  const speaker = new Speaker({ drivers: {} });
  microphone.$claimed.set(held.claimed ?? false);
  microphone.$level.set(held.level ?? 0);
  microphone.$paused.set(held.paused ?? false);
  speaker.$playing.set(held.playing ?? false);
  const bridge = {
    $draft: atom(""),
    $focus: atom("dock.input"),
    $selected: atom(0),
    $popover: atom(null),
    $dictation: atom(held.dictation ?? null),
    $call: atom(held.call ?? null),
    get call() {
      return this.$call.get();
    },
  };
  return { app: { bridge, box: { device: { microphone, speaker } } }, terminal, thread, sent, faults };
};

const provided = (ambient, held, part) => () =>
  createComponent(ambient.app.Provider, {
    value: held.app,
    get children() {
      return createComponent(ambient.terminal.Provider, {
        value: held.terminal,
        get children() {
          return part();
        },
      });
    },
  });

const mounted = async (held, part, size = { width: 72, height: 8 }) => {
  const { ambient } = await compiled;
  const setup = await screen(provided(ambient, held, part), size);
  await settle(setup);
  return setup;
};

const printed = (setup, title) => {
  const text = setup.captureCharFrame().replace(/\s+$/, "");
  console.log(`\n── ${title}\n${text}`);
  return text.split("\n").map((row) => row.trimEnd());
};

const at = (rows, glyph) => {
  const y = rows.findIndex((row) => row.includes(glyph));
  return { x: rows[y].indexOf(glyph), y };
};

const span = (setup, y, text) => setup.captureSpans().lines[y].spans.find((held) => held.text.includes(text));

const ink = (token) => RGBA.fromHex(token).toInts();

const dock = async (held, title) => {
  const { textarea } = await compiled;
  const setup = await mounted(held, () => textarea.Textarea({ palette: BODY, thread: held.thread }));
  return { setup, rows: printed(setup, title) };
};

const clicked = async (setup, rows, glyph, title) => {
  const { x, y } = at(rows, glyph);
  await setup.mockMouse.click(x, y);
  await settle(setup);
  return printed(setup, title);
};

const DICTATION = {
  turns: [{ role: "user", parts: [{ type: "text", text: "Vado al mercato." }] }],
  open: { role: "user", parts: [{ type: "text", text: "poi ", draft: { text: "torno a" } }] },
};

const dictated = async (held) => {
  const { textarea } = await compiled;
  return mounted(held, () => textarea.Textarea({ palette: BODY, thread: held.thread }));
};

specimen.describe("the tty dock · voice — the << popover, the dictation above dock.input, the call instead of it", () => {
  specimen.it("with an ear: << · mic · ⏎; << opens a·d·l·p on plane-lift; d runs /dictate", async () => {
    const held = world();
    const { setup, rows } = await dock(held, "idle, an ear");
    specimen.expect(rows[0]).toMatch(/^ <<\s+mic ⏎$/);
    const open = await clicked(setup, rows, "<<", "<< pressed");
    specimen.expect(open.slice(0, 4)).toEqual([
      "  a    attach",
      "  d    dictate",
      "  l    call",
      "  p    paste",
    ]);
    specimen.expect(span(setup, 0, "attach").bg.toInts()).toEqual(ink(BODY.planeLift));
    specimen.expect(setup.captureSpans().lines[0].spans.at(-1).bg.toInts()).not.toEqual(ink(BODY.planeLift));
    await setup.mockInput.pressKey("d");
    await settle(setup);
    specimen.expect(held.sent).toEqual(["/dictate"]);
    specimen.expect(printed(setup, "d pressed")[0]).toMatch(/^ <</);
    setup.renderer.destroy();
  });

  specimen.it("no ear: no mic, the popover holds a·p alone; esc closes it, nothing sent", async () => {
    const held = world({ ear: false });
    const { setup, rows } = await dock(held, "idle, no ear");
    specimen.expect(rows[0]).toMatch(/^ <<\s+⏎$/);
    specimen.expect(rows[0]).not.toContain("mic");
    const open = await clicked(setup, rows, "<<", "<< pressed, no ear");
    specimen.expect(open.slice(0, 2)).toEqual(["  a    attach", "  p    paste"]);
    specimen.expect(open[2]).toMatch(/^ <<\s+⏎$/);
    await setup.mockInput.pressEscape();
    await new Promise((wake) => setTimeout(wake, 60));
    await settle(setup);
    specimen.expect(printed(setup, "esc pressed")[0]).toMatch(/^ <<\s+⏎$/);
    specimen.expect(held.sent).toEqual([]);
    setup.renderer.destroy();
  });

  specimen.it("dictating: the words above dock.input on plane-sunk, ■ stops, ✕ trashes; d reads stop dictation", async () => {
    const held = world({ dictation: DICTATION, claimed: true });
    const { setup, rows } = await dock(held, "dictating");
    specimen.expect(rows[0]).toMatch(/^ Vado al mercato\. poi torno a▍\s+■ ✕$/);
    specimen.expect(span(setup, 0, "Vado").bg.toInts()).toEqual(ink(BODY.planeSunk));
    specimen.expect(span(setup, 0, "Vado").fg.toInts()).toEqual(ink(BODY.textStrong));
    specimen.expect(span(setup, 0, "torno a").fg.toInts()).toEqual(ink(BODY.textMuted));
    specimen.expect(rows[1]).toMatch(/^ <<\s+mic ⏎$/);
    specimen.expect(span(setup, 1, "<<").fg.toInts()).toEqual(ink(BODY.signalNegativeInk));
    specimen.expect(span(setup, 1, "mic").fg.toInts()).toEqual(ink(BODY.signalNegativeInk));
    await clicked(setup, rows, "■", "■ pressed");
    await clicked(setup, rows, "✕", "✕ pressed");
    const open = await clicked(setup, rows, "<<", "<< pressed, dictating");
    specimen.expect(open[2]).toBe("  d    stop dictation   live");
    specimen.expect(held.sent).toEqual(["/dictate/stop", "/dictate/trash"]);
    setup.renderer.destroy();
  });

  specimen.it("dictating, Enter on dock.input sends /dictate/send — the command lands the words and sends", async () => {
    const held = world({ dictation: DICTATION, claimed: true });
    held.app.bridge.$draft.set("ciao");
    const setup = await dictated(held);
    setup.mockInput.pressEnter();
    await settle(setup);
    specimen.expect(held.sent).toEqual(["/dictate/send"]);
    specimen.expect(held.app.bridge.$draft.get()).toBe("ciao");
    setup.renderer.destroy();
  });

  specimen.it("dictating, nothing heard yet: the words read listening", async () => {
    const held = world({ dictation: { turns: [], open: null }, claimed: true });
    const { setup, rows } = await dock(held, "dictating, silent");
    specimen.expect(rows[0]).toMatch(/^ listening▍\s+■ ✕$/);
    setup.renderer.destroy();
  });

  specimen.it("a call instead of dock.input: << · mic + level · state · speaker + level · m:ss · ■ end", async () => {
    const call = { state: "listening", since: Date.now(), heard: {} };
    const held = world({ call, claimed: true, level: 0.5 });
    const { setup, rows } = await dock(held, "a call, listening");
    specimen.expect(rows[0]).toMatch(/^ << ● ███░░░ listening\s+◁ ░░░░░░ 0:00 ■ end$/);
    specimen.expect(rows.some((row) => row.includes("⏎"))).toBe(false);
    await clicked(setup, rows, "■ end", "■ end pressed");
    const open = await clicked(setup, rows, "<<", "<< pressed, calling");
    specimen.expect(open[2]).toBe("  l    end the call     live");
    specimen.expect(held.sent).toEqual(["/call/end"]);
    setup.renderer.destroy();
  });

  specimen.it("a call, speaking and muted: ○ for the paused mic, the speaker full", async () => {
    const call = { state: "speaking", since: Date.now() - 75000, heard: {} };
    const held = world({ call, paused: true, playing: true });
    const { setup, rows } = await dock(held, "a call, speaking, muted");
    specimen.expect(rows[0]).toMatch(/^ << ○ ░░░░░░ speaking\s+◁ ██████ 1:15 ■ end$/);
    setup.renderer.destroy();
  });
});

const CAPTION = {
  id: "u2",
  role: "user",
  mode: null,
  meta: null,
  parts: [{ type: "text", text: "raccontami una", draft: { text: "storia" } }],
};

const INTERRUPTED = {
  id: "a1",
  role: "assistant",
  mode: null,
  meta: { state: "interrupted" },
  createdAt: "2026-11-17T10:00:00Z",
  parts: [{ type: "text", text: "C'era una volta" }],
};

specimen.describe("the tty journal · a call — the caption is a draft, an interrupted reply says how much was heard", () => {
  specimen.it("the caption: settled solid, its draft tail muted; spoken over: interrupted · heard m:ss", async () => {
    const { journal } = await compiled;
    const call = { state: "listening", since: Date.now(), heard: { a1: 4.2 } };
    const held = world({ turns: [INTERRUPTED, CAPTION], call });
    const part = () => journal.Journal({ palette: BODY, thread: held.thread, lens: ["turns"], markdown: "plain" });
    const setup = await mounted(held, part, { width: 72, height: 10 });
    const rows = printed(setup, "journal, a call");
    specimen.expect(rows.filter((row) => row !== "")).toEqual([
      " >> —",
      "  C'era una volta",
      "  · interrupted · heard 0:04",
      " << ana",
      "  raccontami una storia▍",
    ]);
    const caption = rows.indexOf("  raccontami una storia▍");
    specimen.expect(span(setup, caption, "raccontami").fg.toInts()).toEqual(ink(BODY.textStrong));
    specimen.expect(span(setup, caption, "storia").fg.toInts()).toEqual(ink(BODY.textMuted));
    held.app.bridge.$call.set(null);
    await settle(setup);
    specimen.expect(printed(setup, "journal, the call ended")).toContain("  · interrupted");
    setup.renderer.destroy();
  });
});

const bar = async (held, title) => {
  const { modeline } = await compiled;
  const setup = await mounted(held, () => modeline.Modeline({ palette: CHROMED }), { width: 72, height: 2 });
  return { setup, rows: printed(setup, title) };
};

specimen.describe("the tty bar · two rows — the process segment carries the voice state; picked, it ends it", () => {
  specimen.it("idle: ○ idle under the segments", async () => {
    const { setup, rows } = await bar(world(), "bar, idle");
    specimen.expect(rows[0]).toMatch(/^ <<  \[e4 openings ‹board\/play›\]/);
    specimen.expect(rows[1]).toBe(" ○ idle");
    setup.renderer.destroy();
  });

  specimen.it("dictate · listening · thinking · speaking, each with its meter; a pick sends its end", async () => {
    const since = Date.now() - 12000;
    const listening = { state: "listening", since, heard: {} };
    const thinking = { state: "thinking", since, heard: {} };
    const speaking = { state: "speaking", since, heard: {} };
    const STATES = [
      [{ dictation: DICTATION, level: 0.5 }, /^ ● ███░░░ dictate$/, "/dictate/stop", "signalNegative"],
      [{ call: listening, level: 0.5 }, /^ ● ███░░░ listening 0:12$/, "/call/end", "signalNegative"],
      [{ call: thinking }, /^ ● ░░░░░░ thinking 0:12$/, "/call/end", "signalNegative"],
      [{ call: speaking, playing: true }, /^ ● ██████ speaking 0:12$/, "/call/end", "signalPrimary"],
    ];
    for (const [state, painted, end, dot] of STATES) {
      const held = world(state);
      const { setup, rows } = await bar(held, `bar, ${painted.source}`);
      specimen.expect(rows[1]).toMatch(painted);
      specimen.expect(span(setup, 1, "●").fg.toInts()).toEqual(ink(CHROMED[dot]));
      await setup.mockMouse.click(4, 1);
      await settle(setup);
      specimen.expect(held.sent).toEqual([end]);
      setup.renderer.destroy();
    }
  });
});

const RULE = "─".repeat(47);

const panel = async (held, name, title) => {
  const { popover } = await compiled;
  const setup = await mounted(held, () => popover[name]({ palette: CHROMED }), { width: 47, height: 10 });
  return { setup, rows: printed(setup, title) };
};

specimen.describe("the tty panels — the entity segment's thread panel, the system segment's box panel", () => {
  specimen.it("thread, an ear: hear · speak · call · polish + engaged, mode voice; on picks /polish/engaged on", async () => {
    const held = world();
    const { setup, rows } = await panel(held, "Thread", "thread panel, an ear");
    specimen.expect(rows).toEqual([
      RULE,
      " thread  e4 openings",
      " conversational",
      "       hear             elevenlabs...be_v3_live",
      "       speak            elevenlabs · flash_v2_5",
      "       call             default",
      "       polish           default",
      "       engaged           on   off",
      " mode · board/play",
      "       voice            dictate · call",
    ]);
    specimen.expect(span(setup, 7, "off").bg.toInts()).toEqual(ink(CHROMED.inverse));
    await setup.mockMouse.click(26, 7);
    await settle(setup);
    specimen.expect(held.sent).toEqual(["/polish/engaged on"]);
    setup.renderer.destroy();
  });

  specimen.it("thread, no ear: speak alone and one quiet sentence; hear · call · polish · voice absent", async () => {
    const { setup, rows } = await panel(world({ ear: false }), "Thread", "thread panel, no ear");
    specimen.expect(rows).toEqual([
      RULE,
      " thread  e4 openings",
      " conversational",
      "       speak            elevenlabs · flash_v2_5",
      " no ear · hear, call, polish stay absent",
    ]);
    setup.renderer.destroy();
  });

  specimen.it("box, an ear, mid-call: microphone meter + state, its on · mute choice, speaker, the recorder", async () => {
    const held = world({ claimed: true, level: 0.5, playing: true });
    const { setup, rows } = await panel(held, "Box", "box panel, an ear");
    specimen.expect(rows).toEqual([
      RULE,
      " box  this machine",
      "       microphone       ███░░░ live",
      "                         on   mute",
      "       speaker          ██████ playing",
      "       recorder         ffmpeg · spawned",
    ]);
    await setup.mockMouse.click(31, 3);
    await settle(setup);
    specimen.expect(held.sent).toEqual(["/mic mute"]);
    setup.renderer.destroy();
  });

  specimen.it("the entity popover opens the thread panel above the entity lists; system, the box above system", async () => {
    const held = world();
    const runtime = held.terminal.client.runtime;
    Object.assign(runtime, {
      reference: { absolute: "/runtime/house" },
      $status: atom({ code: "HEALTHY" }),
      lighthouse: { ...runtime.lighthouse, $isAuthorized: atom(true), $status: atom({ code: "IDLE" }) },
    });
    Object.assign(runtime.entities, { mode: { $entities: atom([]) }, daemon: { $entities: atom([]) } });
    Object.assign(held.terminal, { $buffer: atom(null) });
    Object.assign(held.terminal.client, { mask: { reference: { absolute: "/runtime/house/client/ghost" } }, modes: {} });
    Object.assign(held.app, { telemetry: { $state: atom({ open: false }) } });
    Object.assign(held.app.bridge, { $sections: atom({ filter: {}, expand: {}, pick: null, hostsOff: { thread: [], mode: [] } }) });
    const { popover } = await compiled;
    const SEGMENTS = [
      ["entity", " thread  e4 openings", " terminals"],
      ["system", " box  this machine", " system"],
    ];
    for (const [segment, heading, below] of SEGMENTS) {
      const part = () => popover.WIDGETS[segment]({ palette: CHROMED, held: segment });
      const setup = await mounted(held, part, { width: 47, height: 24 });
      const rows = printed(setup, `the ${segment} popover`);
      specimen.expect(rows[1]).toBe(heading);
      specimen.expect(rows.findIndex((row) => row.startsWith(below))).toBeGreaterThan(rows.indexOf(heading));
      setup.renderer.destroy();
    }
  });

  specimen.it("box, no ear: no mute choice — /mic does not exist; the devices still read", async () => {
    const { setup, rows } = await panel(world({ ear: false }), "Box", "box panel, no ear");
    specimen.expect(rows).toEqual([
      RULE,
      " box  this machine",
      "       microphone       ░░░░░░ idle",
      "       speaker          ░░░░░░ idle",
      "       recorder         ffmpeg",
    ]);
    setup.renderer.destroy();
  });
});
