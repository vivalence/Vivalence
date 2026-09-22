import { v, Vector } from "@vivalence/typology";
import { report } from "./doctor.js";
import { COUNT, query } from "./wikipedia.js";

export const doors = new Vector()
  .open("/hello/doctor", (ctx) => report(ctx))
  .open("/hello/census", (ctx) => {
    const faculties = ctx.daemon?.cortex?.find?.({}) ?? [];
    return { count: faculties?.length ?? 0, via: (faculties || []).map((f) => f?.via ?? "unknown") };
  })
  .open("/hello/search", async (ctx) => {
    const terms = (ctx.input?.query ?? "").trim();
    if (!terms) return { results: [], count: 0 };
    const results = await query(terms, ctx.input?.count ?? COUNT);
    return { results, count: results.length };
  });
