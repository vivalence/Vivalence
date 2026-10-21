import { Vector } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

export const pause = new Vector().open(
  { nature: "/pause", valence: "SIGSTOP · hold every running activity on the thread. Example: /pause", chord: "leader/a/p" },
  (ctx) => belt.activity.send("SIGSTOP", ctx.terminal.thread.activities, "/pause"),
);
