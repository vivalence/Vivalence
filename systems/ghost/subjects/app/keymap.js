import { Vector } from "@vivalence/typology";

const leader = new Vector();
leader.branch({ nature: "e", valence: "entity · where am I" });
leader.branch({ nature: "a", valence: "activity · is it working" });
leader.branch({ nature: "h", valence: "harness · what is it given" });
leader.branch({ nature: "d", valence: "display · how do I see it" });
leader.branch({ nature: "s", valence: "system · what does it run on" });
leader.branch({ nature: "w", valence: "widgets · what is shown" });

export const closing = new Vector().open(
  { nature: "leader", valence: "/repl/close" },
  "/repl/close",
);

export const selecting = new Vector()
  .open({ nature: "up", valence: "/repl/previous" }, "/repl/previous")
  .open({ nature: "down", valence: "/repl/next" }, "/repl/next")
  .open({ nature: "tab", valence: "/repl/complete" }, "/repl/complete");

export const keymap = new Vector() //
  .use(async (ctx, next) => {
    // ctx.terminal.controller.stdout.log({
    //   client: Object.keys(ctx.client),
    // });
    // console.log("keymap:", JSON.stringify(ctx.terminal, null, 2));
    await next();
  });
keymap.branch({ nature: "leader", valence: "the leader — ctrl-v on a tty" }, leader);
