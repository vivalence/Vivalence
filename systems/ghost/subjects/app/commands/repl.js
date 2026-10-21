import { Vector } from "@vivalence/typology";
import * as shard from "../../../gestalten/shard/index.js";
import * as belt from "../../../gestalten/belt/index.js";

const shown = (ctx) => belt.completions.completions(ctx.terminal.repl.catalog === null ? [] : ctx.terminal.repl.catalog, ctx.client.app.bridge.draft);

const selected = (ctx, index) => {
  ctx.client.app.bridge.$selected.set(index);
  return `repl ${index}`;
};

export const repl = new Vector()
  .open(
    { nature: "/repl", valence: "the repl opens on the catalog — every repl command, narrowed as you type. Example: /repl", chord: "leader/leader" },
    (ctx) => {
      ctx.terminal.repl.$catalog.set(shard.keymap.catalog(ctx.terminal.repl.commands));
      ctx.client.app.bridge.$draft.set(ctx.client.app.bridge.draft.startsWith("/") ? ctx.client.app.bridge.draft : "/");
      ctx.client.app.bridge.$selected.set(0);
      ctx.client.app.bridge.$focus.set("composer");
      return "repl open";
    },
  )
  .open(
    { nature: "/repl/close", valence: "the repl closes — the catalog drops and the line typed into it is dropped too. Example: /repl/close", chord: "esc" },
    (ctx) => {
      ctx.terminal.repl.$catalog.set(null);
      ctx.client.app.bridge.$draft.set("");
      ctx.client.app.bridge.$selected.set(0);
      return "repl closed";
    },
  )
  .open(
    { nature: "/repl/next", valence: "the repl's selection moves down a row, the last row holds. Example: /repl/next" },
    (ctx) => selected(ctx, Math.max(0, Math.min(ctx.client.app.bridge.selected + 1, shown(ctx).length - 1))),
  )
  .open(
    { nature: "/repl/previous", valence: "the repl's selection moves up a row, the first row holds. Example: /repl/previous" },
    (ctx) => selected(ctx, Math.max(0, ctx.client.app.bridge.selected - 1)),
  )
  .open(
    { nature: "/repl/complete", valence: "the selected row fills the draft — its command, a space when it takes an argument. Example: /repl/complete" },
    (ctx) => {
      const completion = shown(ctx)[ctx.client.app.bridge.selected];
      if (completion === undefined) return "nothing to complete";
      ctx.client.app.bridge.$draft.set(belt.completions.filled(completion.row));
      ctx.client.app.bridge.$selected.set(0);
      return belt.completions.filled(completion.row);
    },
  );
