import paladin from "@vivalence/paladin";
import { Vector, v } from "@vivalence/typology";
import * as belt from "../../belt/index.js";

const Viewed = v.object({
  view: v.enum(["logger", "inspector", "off"]).optional().desc('Which tab the telemetry window shows, or off; absent toggles. Example: "inspector"'),
});

const POINTS = ["app", "client", "runtime", "lighthouse", "locals", "terminal", "thread", "harness", "turns", "buffers", "activities", "repl", "bridge", "telemetry"];

const Pointed = v.object({
  point: v
    .string({ pattern: `^(${POINTS.join("|")}|/.+)$` })
    .optional()
    .desc('The entity the inspector picks: a point or a reference; absent keeps the held one. Example: "harness"'),
});

const SHOWN = [
  [(view) => view === undefined, (held) => ({ ...held, open: !held.open })],
  [(view) => view === "off", (held) => ({ ...held, open: false })],
  [() => true, (held, view) => ({ ...held, open: true, view })],
];

export const telemetry = new Vector()
  .open(
    { nature: "/telemetry", rank: "hidden", valence: "the telemetry window: a logger over spans and activities, an inspector over the client's state. Example: /telemetry inspector", input: Viewed, chord: "leader/s/t" },
    (ctx) => {
      const { view } = belt.input.cast(Viewed, ctx.signal);
      const held = SHOWN.find(([test]) => test(view))[1](ctx.client.app.telemetry.state, view);
      ctx.client.app.telemetry.$state.set(held);
      return held.open ? `telemetry ${held.view}` : "telemetry off";
    },
  )
  .open(
    {
      nature: "/inspector",
      valence: "the telemetry window on its inspector, picking one entity: thread, harness, a mode's reference …; no point keeps the held one. Example: /inspector harness",
      input: Pointed,
    },
    (ctx) => {
      const { point } = belt.input.cast(Pointed, ctx.signal);
      const pointed = point === undefined ? {} : { point };
      ctx.client.app.telemetry.$state.set({ ...ctx.client.app.telemetry.state, open: true, view: "inspector", ...pointed });
    },
  )
  .open(
    { nature: "/telemetry/clear", rank: "hidden", valence: "drop every record the logger holds; live activities stay. Example: /telemetry/clear" },
    (ctx) => {
      ctx.client.app.telemetry.$state.set({ ...ctx.client.app.telemetry.state, since: performance.timeOrigin + performance.now(), selection: null, trace: null });
      return "telemetry cleared";
    },
  )
  .open(
    {
      nature: "/telemetry/copy",
      rank: "hidden",
      valence: "the records this client kept for its file loggers go to the clipboard, one a line. Example: /telemetry/copy",
    },
    async () => {
      const kept = Object.values(paladin.telemetry.kept).flat();
      await globalThis.navigator.clipboard.writeText(kept.map((record) => JSON.stringify(record)).join("\n"));
      return `${kept.length} records copied`;
    },
  );
