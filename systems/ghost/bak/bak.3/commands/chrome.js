import { Vector } from "@vivalence/typology";

export const chrome = new Vector().open(
  { nature: "/chrome", valence: "hand this terminal to the chrome — the repl stops, the tty surface opens over the same instance and seat. Example: chrome" },
  (ctx) => {
    ctx.upgrade.chrome();
  },
);
