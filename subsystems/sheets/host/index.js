import "./preload.js";

export { dlopen, getRawPointer, suffix, toArrayBuffer } from "./deno-ffi.js";

export async function opentui() {
  const core = await import("@opentui/core");
  const solid = await import("@opentui/solid");
  return { createCliRenderer: core.createCliRenderer, render: solid.render };
}
