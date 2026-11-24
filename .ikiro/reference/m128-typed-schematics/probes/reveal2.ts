import { Aperture, contexts, Twitch, v } from "@vivalence/typology";
import type { Die, Static } from "@vivalence/typology";

const reveal = (value: never) => value;

declare const tool: Die<typeof contexts.Tool>;
reveal(tool.reference);
reveal(tool.mountpoint);
reveal(tool.params);
reveal(tool.thread);

declare const thread: Static<ReturnType<typeof v.thread>>;
reveal(thread.turns);
reveal(thread.user);

new Aperture().post({ nature: "/x", input: v.object({ slug: v.string() }) }, (ctx) => {
  reveal(ctx.input);
  reveal(ctx.attach);
  reveal(ctx.user);
});

new Twitch().open("/after/thread/create", (ctx) => {
  reveal(ctx.input);
  reveal(ctx.cortex);
});
