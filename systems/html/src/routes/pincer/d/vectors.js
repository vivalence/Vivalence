import { Vector } from "@vivalence/typology";

export const outside = new Vector();

outside.branch({
  nature: "/daemons",
  treed: { label: "daemons" },
});

outside.branch({
  nature: "/daemons/:daemon",
  treed: { label: "daemon" },
  iterated: (ctx) => [...ctx.dataspace.daemons.values()],
});

outside.branch({
  nature: "/daemons/:daemon/:mode",
  treed: { label: "mode" },
  iterated: (ctx) => ctx.daemon.modes,
});

outside.open(
  {
    nature: "/daemons/:daemon/:mode/:intent",
    treed: { label: "intent" },
    iterated: (ctx) => ctx.mode.intents,
  },
  (ctx) => {
    ctx.terminal.mount({
      daemon: ctx.daemon,
      mode:   ctx.mode,
      intent: ctx.intent,
    });
    ctx.pincer.dPhase = "inside";
  },
);

outside.open(
  {
    nature: "/daemons/:daemon/:mode/none",
    treed: { label: "(no intent)" },
  },
  (ctx) => {
    ctx.terminal.mount({
      daemon: ctx.daemon,
      mode:   ctx.mode,
      intent: null,
    });
    ctx.pincer.dPhase = "inside";
  },
);

export const inside = new Vector();

inside.open(
  { nature: "/daemon", treed: { label: "unmount daemon" } },
  (ctx) => {
    ctx.terminal.mount({ daemon: null, mode: null, intent: null });
    ctx.pincer.dPhase = "outside";
  },
);

inside.open(
  { nature: "/mode", treed: { label: "unmount mode" } },
  (ctx) => {
    ctx.terminal.mount({ mode: null, intent: null });
    ctx.pincer.dPhase = "outside";
  },
);

inside.open(
  { nature: "/intent", treed: { label: "unmount intent" } },
  (ctx) => {
    ctx.terminal.mount({ intent: null });
  },
);
