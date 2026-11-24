import { Aperture, contexts, Twitch } from "@vivalence/typology";
import type { Die, entity } from "@vivalence/typology";

const reveal = (value: never) => value;

declare const thread: entity.Thread;
reveal(thread.trait.QUEUEING.depth);
reveal(thread.trait.HARNESSED);
reveal(thread.phase);
reveal(thread.traits);
reveal(thread.turns);

declare const tool: Die<typeof contexts.Tool>;
reveal(tool.thread);
reveal(tool.mountpoint);

new Aperture().open("/x", (ctx) => {
  reveal(ctx.user);
});

new Twitch().open("/after/thread/create", (ctx) => {
  reveal(ctx.input.entity.trait.QUEUEING.depth);
  reveal(ctx.input.em);
});

new Twitch().open("/before/mode/boot", (ctx) => {
  reveal(ctx.input);
});
