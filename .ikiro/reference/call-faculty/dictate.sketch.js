// limit: 3900 chars · the TARGET: systems/ghost/gestalten/commands/content/dictate.js, as Q10–Q16 · Q23 · S7 · S8 lock it (quests/m123-call-faculty.org)
// run whole 11-17 by walk-11-17/dictate.probe.js (a copy, walk-11-17/dictate.target.js): three exits, the words appended (Q23), a polish on a sealed turn
// new beside it: belt.dictation.spoken · tail (systems/ghost/gestalten/belt/dictation.js, the dock reads them too, S10) · bridge.$dictation · soma.transcript's /part/full case · unwritten: who stamps a dictation turn's id for the polish
import { Vector, soma } from "@vivalence/typology";
import * as belt from "../../belt/index.js";

const HUSHED = { turns: [], open: null };

const land = (ctx, text) =>
  ctx.client.app.bridge.$draft.set([ctx.client.app.bridge.draft, text].filter(Boolean).join(" "));

const EXITS = {
  stop: land,
  send: (ctx, text) => {
    land(ctx, text);
    const draft = ctx.client.app.bridge.draft;
    if (draft.trim() === "") return;
    ctx.client.app.bridge.$draft.set("");
    return ctx.terminal.repl.dispatch(draft);
  },
  trash: () => {},
};

export const dictate = new Vector()
  .open(
    { nature: "/dictate", rank: "hidden", valence: "a dictation starts; its words join dock.input. Example: /dictate" },
    async (ctx) => {
      await ctx.client.app.box.device.microphone.claim();
      const feed = ctx.client.app.box.device.microphone.feed.signal;
      let dictation = HUSHED;
      ctx.client.app.bridge.$dictation.set(dictation);
      try {
        const heard = ctx.terminal.mode.harness.verbatim.stream(ctx.client.app.box.device.microphone.frames(), {
          input: { thread: ctx.terminal.thread.id },
        });
        for await (const packet of heard) {
          dictation = soma.transcript(dictation, packet);
          ctx.client.app.bridge.$dictation.set(dictation);
        }
      } finally {
        ctx.client.app.box.device.microphone.release("stop");
        ctx.client.app.bridge.$dictation.set(null);
        await EXITS[feed.reason](ctx, belt.dictation.spoken(dictation));
      }
    },
  )
  .open(
    { nature: "/dictate/stop", rank: "hidden", valence: "the dictation ends, its words stay in dock.input. Example: /dictate/stop" },
    (ctx) => ctx.client.app.box.device.microphone.release("stop"),
  )
  .open(
    { nature: "/dictate/send", rank: "hidden", valence: "the dictation ends and is sent as a turn. Example: /dictate/send" },
    (ctx) => ctx.client.app.box.device.microphone.release("send"),
  )
  .open(
    { nature: "/dictate/trash", rank: "hidden", valence: "the dictation ends, its words are dropped. Example: /dictate/trash" },
    (ctx) => ctx.client.app.box.device.microphone.release("trash"),
  );
