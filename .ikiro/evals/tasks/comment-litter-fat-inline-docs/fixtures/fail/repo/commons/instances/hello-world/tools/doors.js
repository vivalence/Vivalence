import { v, Vector } from "@vivalence/typology";
import { report } from "./doctor.js";

export const doors = new Vector()
  .open("/hello/doctor", (ctx) => report(ctx))
  // the machine's clock, for the operator's page footer.
  // Intl gives the zone the process runs in, which is what the operator means by 'here';
  // toISOString is UTC by design, so both are returned and the page picks.
  .open("/hello/time", () => ({
    iso: new Date().toISOString(), // always UTC
    zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }));
