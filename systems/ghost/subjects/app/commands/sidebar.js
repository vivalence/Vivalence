import { Vector, v } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

const Shown = v.object({
  state: v.enum(["open", "closed"]).desc('The sidebar open or closed. Example: "open"'),
});

const Wide = v.object({
  width: v.integer({ minimum: 24, maximum: 96 }).desc("The sidebar's width in columns, the grip included. Example: 39"),
});

const shown = (ctx, open) => {
  ctx.client.app.bridge.$sidebar.set({ ...ctx.client.app.bridge.sidebar, open });
  return open ? "sidebar open" : "sidebar closed";
};

export const sidebar = new Vector()
  .open(
    { nature: "/sidebar", valence: "the sidebar open or closed. Example: /sidebar open", input: Shown },
    (ctx) => shown(ctx, belt.input.cast(Shown, ctx.signal).state === "open"),
  )
  .open(
    { nature: "/sidebar/toggle", valence: "the sidebar flipped — open if closed, closed if open. Example: /sidebar/toggle", chord: "leader/d/b" },
    (ctx) => shown(ctx, !ctx.client.app.bridge.sidebar.open),
  )
  .open(
    { nature: "/sidebar/width", valence: "the sidebar's width in columns — the grip on its border drags it. Example: /sidebar/width 39", input: Wide },
    (ctx) => {
      const width = belt.input.cast(Wide, ctx.signal).width;
      ctx.client.app.bridge.$sidebar.set({ ...ctx.client.app.bridge.sidebar, width });
      return `sidebar ${width} wide`;
    },
  );
