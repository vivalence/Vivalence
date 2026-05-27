import { assertEquals } from "@std/assert";
import { Die, Runtime } from "@vivalence/runtime";

Deno.test("disintegrate idempotent under concurrent shutdown signals", async () => {
  const die = new Die({ good: new Runtime() });
  die.status.set("alive");

  // race: terminal-group SIGINT + parent-teardown SIGTERM
  await Promise.all([die.disintegrate(), die.disintegrate()]);

  assertEquals(die.status.is("STOPPED"), true);
  assertEquals(die.abort.signal.aborted, true);
});
