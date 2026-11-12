import { Vector } from "@vivalence/typology";
import * as belt from "../../belt/index.js";

export const activity = new Vector()
  .open(
    { nature: "/activity", rank: "hidden", valence: "the thread's activities — id · type · status · steps. Example: /activity", chord: "leader/a/a" },
    (ctx) => ctx.terminal.thread.activities.map((held) => ({ id: held.id, type: held.type, status: held.status, steps: held.steps.length })),
  )
  .open(
    { nature: "/abort", rank: "hidden", valence: "SIGKILL · abort every live activity on the thread. Example: /abort", chord: "leader/a/k" },
    (ctx) => belt.activity.send("SIGKILL", ctx.terminal.thread.activities, "/abort"),
  )
  .open(
    { nature: "/pause", rank: "hidden", valence: "SIGSTOP · hold every running activity on the thread. Example: /pause", chord: "leader/a/p" },
    (ctx) => belt.activity.send("SIGSTOP", ctx.terminal.thread.activities, "/pause"),
  )
  .open(
    { nature: "/resume", rank: "hidden", valence: "SIGCONT · resume every paused activity on the thread. Example: /resume", chord: "leader/a/c" },
    (ctx) => belt.activity.send("SIGCONT", ctx.terminal.thread.activities, "/resume"),
  )
  .open(
    { nature: "/stop", rank: "hidden", valence: "SIGTERM · stop every live activity on the thread. Example: /stop", chord: "leader/a/s" },
    (ctx) => belt.activity.send("SIGTERM", ctx.terminal.thread.activities, "/stop"),
  );
