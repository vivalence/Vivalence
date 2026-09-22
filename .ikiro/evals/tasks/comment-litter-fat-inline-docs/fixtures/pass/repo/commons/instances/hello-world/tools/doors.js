import { v, Vector } from "@vivalence/typology";
import { report } from "./doctor.js";

export const doors = new Vector()
  .open("/hello/doctor", (ctx) => report(ctx))
  .open("/hello/time", () => ({
    iso: new Date().toISOString(),
    zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }));
