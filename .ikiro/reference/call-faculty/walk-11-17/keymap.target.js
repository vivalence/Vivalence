import { Vector } from "@vivalence/typology";
import * as belt from "/Users/finn/vivalence/code/vivalence/systems/ghost/gestalten/belt/index.js";

const leader = new Vector();
leader.branch({ nature: "e", valence: "entity · where am I" });
leader.branch({ nature: "a", valence: "activity · is it working" });
leader.branch({ nature: "h", valence: "harness · what is it given" });
leader.branch({ nature: "d", valence: "display · how do I see it" });
leader.branch({ nature: "s", valence: "system · what does it run on" });
leader.branch({ nature: "w", valence: "widgets · what is shown" });

export const dictating = new Vector().open({ nature: "esc", valence: "/dictate/stop" }, "/dictate/stop");

export const closing = new Vector()
  .open({ nature: "leader", valence: "/repl/close" }, "/repl/close")
  .open({ nature: "esc", valence: "/repl/close" }, "/repl/close");

const listed = (ctx) => belt.catalog.listed(ctx.terminal.repl.catalog, ctx.client.app.bridge.draft);

export const selecting = new Vector()
  .open({ nature: "up", valence: "the repl's selection moves up an entry, the first holds" }, (ctx) => {
    ctx.client.app.bridge.$selected.set(Math.max(0, ctx.client.app.bridge.selected - 1));
  })
  .open({ nature: "down", valence: "the repl's selection moves down an entry, the last holds" }, (ctx) => {
    const last = listed(ctx).length - 1;
    ctx.client.app.bridge.$selected.set(Math.max(0, Math.min(ctx.client.app.bridge.selected + 1, last)));
  })
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
