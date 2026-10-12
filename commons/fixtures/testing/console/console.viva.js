import { Vector } from "@vivalence/typology";

export const manifest = {
  type: "home",
  slug: "console",
  name: "Console",
  description: "A mode the client hosts. Its verbs join the repl beside the client's own — proof that REPLING composes.",
  version: "0.0.1",
  traits: ["REPLING"],
};

export const repling = new Vector()
  .open(
    { nature: "/hello", valence: "the hosted mode answers from inside the repl's context. Example: /hello" },
    (ctx) => {console.log("mode/home/console", {ctx});return `hello from ${ctx.client.mask.manifest.slug}` ;},
  )
  .open(
    { nature: "/whoami", valence: "the user, the active terminal and its mode. Example: /whoami" },
    (ctx) => ({
      user: ctx.runtime === null ? null : ctx.runtime.lighthouse.user.slug,
      terminal: ctx.terminal === null ? null : ctx.terminal.id,
    }),
  );
