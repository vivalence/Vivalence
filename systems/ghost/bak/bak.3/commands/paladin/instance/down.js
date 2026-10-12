import { v, Vector } from "@vivalence/typology";
import { effect } from "./stop.js";

export const down = new Vector().open(
  { nature: "/instance/down", valence: "stop the attached instance/up — SIGTERM the pid in its lock, wait for the lock to clear. Example: viva instance/down", schema: v.object({}) },
  effect,
);
