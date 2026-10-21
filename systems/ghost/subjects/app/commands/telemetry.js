import { Vector, v } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

const Viewed = v.object({
  view: v.enum(["logger", "inspector", "off"]).optional().desc('Which tab the telemetry window shows, or off; absent toggles. Example: "inspector"'),
});

const SHOWN = [
  [(view) => view === undefined, (held) => ({ ...held, open: !held.open })],
  [(view) => view === "off", (held) => ({ ...held, open: false })],
  [() => true, (held, view) => ({ ...held, open: true, view })],
];

export const telemetry = new Vector()
  .open(
    { nature: "/telemetry", valence: "the telemetry window: a logger over spans and activities, an inspector over the client's state. Example: /telemetry inspector", input: Viewed, chord: "leader/s/t" },
    (ctx) => {
      const { view } = belt.input.cast(Viewed, ctx.signal);
      const held = SHOWN.find(([test]) => test(view))[1](ctx.client.app.telemetry.state, view);
      ctx.client.app.telemetry.$state.set(held);
      return held.open ? `telemetry ${held.view}` : "telemetry off";
    },
  )
  .open(
    { nature: "/telemetry/clear", valence: "drop every record the logger holds; live activities stay. Example: /telemetry/clear" },
    (ctx) => {
      ctx.client.app.telemetry.$state.set({ ...ctx.client.app.telemetry.state, since: performance.timeOrigin + performance.now(), selection: null });
      return "telemetry cleared";
    },
  );
