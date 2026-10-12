import { Vector } from "@vivalence/typology";

export const upgrade = new Vector()
  .open({ nature: "/client/chrome", valence: "the chrome over this shell's instance — the tty surface. Example: viva client/chrome" }, (ctx) => ctx.upgrade.chrome())
  .open({ nature: "/client/repl", valence: "the repl over this shell's instance — stdin lines in, json lines out. Example: echo ciao | viva client/repl" }, (ctx) => ctx.upgrade.repl());
