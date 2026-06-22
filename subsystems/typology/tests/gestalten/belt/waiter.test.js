import { specimen, promise, sleep } from "@vivalence/typology";

// waiter() = the single-slot wake/suspend gate (belt async-control atom). The
// invariant net before any channel (Queue/Pipe/soma.tee/Broadcaster) leans on it.
// No wake buffering: wake() with no pending wait() is a silent no-op — callers
// guard with a buffer/done check first. wait(signal) resolves on wake OR abort.

const { waiter } = promise;

// settle the microtask queue so a pending .then() flag is observable
const tick = () => Promise.resolve();

specimen.describe("waiter: suspend / wake", () => {
  specimen.it("wait() before wake() — suspends, then resolves on wake()", async () => {
    const gate = waiter();
    let resolved = false;
    const pending = gate.wait().then(() => { resolved = true; });
    await tick();
    specimen.expect(resolved).toBe(false); // suspended
    gate.wake();
    await pending;
    specimen.expect(resolved).toBe(true);
  });

  specimen.it("wake() before wait() — lost (no buffering); next wait() still suspends", async () => {
    const gate = waiter();
    gate.wake(); // no waiter → dropped
    let resolved = false;
    const pending = gate.wait().then(() => { resolved = true; });
    await tick();
    specimen.expect(resolved).toBe(false); // the earlier wake did NOT carry over
    gate.wake();
    await pending;
    specimen.expect(resolved).toBe(true);
  });
});

specimen.describe("waiter: abort", () => {
  specimen.it("abort mid-wait — resolves", async () => {
    const gate = waiter();
    const controller = new AbortController();
    let resolved = false;
    const pending = gate.wait(controller.signal).then(() => { resolved = true; });
    await tick();
    specimen.expect(resolved).toBe(false);
    controller.abort();
    await pending;
    specimen.expect(resolved).toBe(true);
  });

  specimen.it("already-aborted signal — resolves immediately (no hang)", async () => {
    const gate = waiter();
    const controller = new AbortController();
    controller.abort();
    let resolved = false;
    await gate.wait(controller.signal).then(() => { resolved = true; });
    specimen.expect(resolved).toBe(true);
  });

  specimen.it("sleep.signal(ms) — fires the wait after the timeout", async () => {
    const gate = waiter();
    let resolved = false;
    gate.wait(sleep.signal(5)).then(() => { resolved = true; });
    await tick();
    specimen.expect(resolved).toBe(false); // not yet
    await sleep.ms(20);
    specimen.expect(resolved).toBe(true); // timeout aborted the wait
  });
});

specimen.describe("waiter: idempotence / races", () => {
  specimen.it("double wake() with no waiter — no throw", () => {
    const gate = waiter();
    gate.wake();
    gate.wake();
  });

  specimen.it("stale wake() after a wait resolved — silent no-op, never re-fires", async () => {
    const gate = waiter();
    let count = 0;
    const pending = gate.wait().then(() => { count++; });
    gate.wake();
    await pending;
    gate.wake(); // resolve is null now — must not throw or double-fire
    await tick();
    specimen.expect(count).toBe(1);
  });

  specimen.it("wake() and abort() racing — exactly one resolution, no throw", async () => {
    const gate = waiter();
    const controller = new AbortController();
    let count = 0;
    const pending = gate.wait(controller.signal).then(() => { count++; });
    controller.abort();
    gate.wake(); // concurrent with the abort
    await pending;
    await tick();
    specimen.expect(count).toBe(1); // settled once
  });

  specimen.it("carries no value — the gate transports nothing, only timing", async () => {
    const gate = waiter();
    const woken = await new Promise((r) => {
      gate.wait().then(() => r("via-wake"));
      gate.wake();
    });
    specimen.expect(woken).toBe("via-wake"); // wait() resolves to undefined; value is the caller's
  });
});
