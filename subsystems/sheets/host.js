import "./preload.js";

export async function opentui() {
  const core = await import("@opentui/core");
  return { createCliRenderer: core.createCliRenderer };
}
export { display } from "./cell.js";
