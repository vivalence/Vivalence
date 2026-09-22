import { assertEquals } from "@std/assert";
import { persona } from "../tools/doors.js";

Deno.test("persona without a hallucinator", async () => {
  const ctx = { daemon: { cortex: { findOne: () => null } }, input: { user: "hi" } };
  assertEquals(await persona(ctx), { greeting: "No hallucinator attached. Bot says high." });
});
