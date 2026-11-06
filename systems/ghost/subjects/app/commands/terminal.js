import { Vector, v } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

const Seat = v.object({ index: v.integer({ minimum: 0 }).desc("A terminal's index on the user. Example: 2") });

const seated = (app, terminal) => {
  app.bridge.$terminal.set(terminal.id);
  return `terminal #${terminal.index}`;
};

export const terminal = new Vector()
  .open(
    { nature: "/terminal", rank: "hidden", valence: "seat a terminal by its index. Example: /terminal 2", input: Seat, chord: "leader/e/n" },
    (ctx) => {
      const { index } = belt.input.cast(Seat, ctx.signal);
      const rows = ctx.client.runtime.entities.terminal.$entities.get();
      const found = rows.find((held) => held.index === index);
      if (found === undefined) throw new Error(`no terminal #${index} — the indices: ${rows.map((held) => held.index).join(" · ") || "none"}`);
      return seated(ctx.client.app, found);
    },
  )
  .open(
    { nature: "/terminal/new", rank: "hidden", valence: "open a terminal and seat it. Example: /terminal/new" },
    async (ctx) =>
      seated(
        ctx.client.app,
        await ctx.client.runtime.entities.terminal.create({
          user: ctx.client.runtime.lighthouse.user.id,
        }),
      ),
  )
  .open(
    { nature: "/terminal/close", rank: "hidden", valence: "close the seated terminal; the first remaining is seated. Example: /terminal/close" },
    async (ctx) => {
      const closed = ctx.terminal;
      await ctx.client.runtime.entities.terminal.removeOne({ id: closed.id });
      return `terminal #${closed.index} closed`;
    },
  )
  .open(
    { nature: "/terminal/close/:id", rank: "hidden", valence: "close one terminal by its id. Example: /terminal/close/0192f3" },
    async (ctx) => {
      const terminals = ctx.client.runtime.entities.terminal.$entities.get();
      const closed = terminals.find((held) => held.id === ctx.params.id);
      if (closed === undefined) throw new Error(`no terminal ${ctx.params.id} — the ids: ${terminals.map((held) => held.id).join(" · ")}`);
      await ctx.client.runtime.entities.terminal.removeOne({ id: closed.id });
      return `terminal #${closed.index} closed`;
    },
  );
