import { Vector } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

export const stop = new Vector().open(
  { nature: "/stop", valence: "SIGTERM · stop every live activity on the thread. Example: /stop", chord: "leader/a/s" },
  (ctx) => belt.activity.send("SIGTERM", ctx.terminal.thread.activities, "/stop"),
);
