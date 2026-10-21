import { Vector } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

export const resume = new Vector().open(
  { nature: "/resume", valence: "SIGCONT · resume every paused activity on the thread. Example: /resume", chord: "leader/a/c" },
  (ctx) => belt.activity.send("SIGCONT", ctx.terminal.thread.activities, "/resume"),
);
