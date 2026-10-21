import { Vector } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

export const abort = new Vector().open(
  { nature: "/abort", valence: "SIGKILL · abort every live activity on the thread. Example: /abort", chord: "leader/a/k" },
  (ctx) => belt.activity.send("SIGKILL", ctx.terminal.thread.activities, "/abort"),
);
