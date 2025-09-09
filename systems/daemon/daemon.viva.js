import { Vector } from "@vivalence/vector";

export const manifest = {
  type: "daemon",
  slug: "daemon",
};

export const control = new Vector().open("/start", async (ctx) => {
  return await import("./mod.ts");
});
