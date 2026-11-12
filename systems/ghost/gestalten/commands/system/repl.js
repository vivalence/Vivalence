import { Vector } from "@vivalence/typology";
import * as shard from "../../shard/index.js";
import * as belt from "../../belt/index.js";

const listed = (ctx) => belt.catalog.listed(ctx.terminal.repl.catalog === null ? [] : ctx.terminal.repl.catalog, ctx.client.app.bridge.draft);

export const repl = new Vector()
  .open(
    { nature: "/repl", rank: "hidden", valence: "the repl opens on the catalog — every repl command, narrowed as you type. Example: /repl", chord: "leader/leader" },
    (ctx) => {
      ctx.terminal.repl.$catalog.set(shard.keymap.catalog(ctx.terminal.repl.commands));
      ctx.client.app.bridge.$draft.set(ctx.client.app.bridge.draft.startsWith("/") ? ctx.client.app.bridge.draft : "/");
      ctx.client.app.bridge.$selected.set(0);
      ctx.client.app.bridge.$focus.set("repl.input");
    },
  )
  .open(
    { nature: "/repl/close", rank: "hidden", valence: "the repl closes — the catalog drops and the line typed into it is dropped too. Example: /repl/close", chord: "esc" },
    (ctx) => {
      if (ctx.terminal.repl.catalog !== null) belt.focus.back(ctx.client.app.bridge);
      ctx.terminal.repl.$catalog.set(null);
      ctx.client.app.bridge.$draft.set("");
      ctx.client.app.bridge.$selected.set(0);
    },
  )
  .open(
    { nature: "/repl/complete", rank: "hidden", valence: "the selected row fills the draft — its command, a space when it takes an argument; in a chooser, the command and the selected word. Example: /repl/complete" },
    (ctx) => {
      const completion = listed(ctx)[ctx.client.app.bridge.selected];
      if (completion === undefined) return "nothing to complete";
      ctx.client.app.bridge.$draft.set(completion);
      ctx.client.app.bridge.$selected.set(0);
      return completion;
    },
  );
