import { Vector } from "@vivalence/vector";

export const manifest = {
  type: "daemon",
  slug: "daemon",
};

export const control = new Vector()
  //   .open("/watch", async (ctx) => {
  //   return await import("./mod.ts");
  // })
  .open("/start", async (ctx) => {
    return await import("./mod.ts");
  });
