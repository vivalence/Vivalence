import { Vector } from "@vivalence/typology";

const closing = (ctx) => {
  ctx.client.app.bridge.$sidebar.set({ ...ctx.client.app.bridge.sidebar, open: false });
  ctx.client.app.bridge.$popover.set(null);
  return "widgets closed";
};

export const widgets = new Vector().open(
  { nature: "/widgets/close", valence: "every widget closed — the sidebar shut, the modeline's popover dropped; the dock and the frame stay as they are. Example: /widgets/close" },
  closing,
);

export const widget = new Vector()
  .open(
    { nature: "/widget/toggle/close", valence: "every widget closed — the same as /widgets/close; the dock and the frame stay as they are. Example: /widget/toggle/close", chord: "leader/w/c" },
    (ctx) => ctx.terminal.repl.dispatch("/widgets/close"),
  )
  .open(
    { nature: "/widget/toggle/sidebar", valence: "the sidebar shown or hidden — the same flip as /sidebar/toggle. Example: /widget/toggle/sidebar", chord: "leader/w/b" },
    (ctx) => ctx.terminal.repl.dispatch("/sidebar/toggle"),
  )
  .open(
    { nature: "/widget/toggle/entity", valence: "the entity widget's popover above the modeline, open or closed — /popover entity. Example: /widget/toggle/entity", chord: "leader/w/e" },
    (ctx) => ctx.terminal.repl.dispatch("/popover entity"),
  )
  .open(
    { nature: "/widget/toggle/display", valence: "the display widget's popover above the modeline, open or closed — /popover display. Example: /widget/toggle/display", chord: "leader/w/d" },
    (ctx) => ctx.terminal.repl.dispatch("/popover display"),
  )
  .open(
    { nature: "/widget/toggle/system", valence: "the system widget's popover above the modeline, open or closed — /popover system. Example: /widget/toggle/system", chord: "leader/w/s" },
    (ctx) => ctx.terminal.repl.dispatch("/popover system"),
  )
  .open(
    { nature: "/widget/toggle/dock", valence: "the dock closed, or back in the view it last showed — /dock closed · /dock <shown>. Example: /widget/toggle/dock", chord: "leader/w/j" },
    (ctx) => ctx.terminal.repl.dispatch(ctx.terminal.dock.view === "closed" ? `/dock ${ctx.terminal.dock.shown}` : "/dock closed"),
  );
