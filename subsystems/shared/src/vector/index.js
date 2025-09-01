export * as mw from "./mw.js";

export function status(vector) {
  vector.open("/status", async (input, ctx) => {
    return { status: "success", code: 200 };
  });
}
