import { specimen, promise, sleep } from "@vivalence/typology";

specimen.describe("waiter", () => {
  specimen.it("a wait suspends until its wake and an early wake is lost", async () => {
    const gate = promise.waiter();
    let resolved = false;
    const pending = gate.wait().then(() => { resolved = true; });
    await Promise.resolve();
    specimen.expect(resolved).toBe(false);
    gate.wake();
    await pending;
    specimen.expect(resolved).toBe(true);

    const unbuffered = promise.waiter();
    unbuffered.wake();
    let woken = false;
    const suspended = unbuffered.wait().then(() => { woken = true; });
    await Promise.resolve();
    specimen.expect(woken).toBe(false);
    unbuffered.wake();
    await suspended;
    specimen.expect(woken).toBe(true);
  });

  specimen.it("an abort releases the gate even when already fired", async () => {
    const gate = promise.waiter();
    const controller = new AbortController();
    let resolved = false;
    const pending = gate.wait(controller.signal).then(() => { resolved = true; });
    await Promise.resolve();
    specimen.expect(resolved).toBe(false);
    controller.abort();
    await pending;
    specimen.expect(resolved).toBe(true);

    const lateGate = promise.waiter();
    const aborted = new AbortController();
    aborted.abort();
    let immediate = false;
    await lateGate.wait(aborted.signal).then(() => { immediate = true; });
    specimen.expect(immediate).toBe(true);
  });

  specimen.it("a timeout signal fires the wait after its delay", async () => {
    const gate = promise.waiter();
    let resolved = false;
    gate.wait(sleep.signal(5)).then(() => { resolved = true; });
    await Promise.resolve();
    specimen.expect(resolved).toBe(false);
    await sleep.ms(20);
    specimen.expect(resolved).toBe(true);
  });

  specimen.it("wakes and aborts race without a double fire", async () => {
    const idle = promise.waiter();
    idle.wake();
    idle.wake();

    const staleGate = promise.waiter();
    let staleCount = 0;
    const stalePending = staleGate.wait().then(() => { staleCount++; });
    staleGate.wake();
    await stalePending;
    staleGate.wake();
    await Promise.resolve();
    specimen.expect(staleCount).toBe(1);

    const racingGate = promise.waiter();
    const controller = new AbortController();
    let raceCount = 0;
    const racePending = racingGate.wait(controller.signal).then(() => { raceCount++; });
    controller.abort();
    racingGate.wake();
    await racePending;
    await Promise.resolve();
    specimen.expect(raceCount).toBe(1);

    const valueless = promise.waiter();
    const outcome = await new Promise((resolve) => {
      valueless.wait().then(() => resolve("via-wake"));
      valueless.wake();
    });
    specimen.expect(outcome).toBe("via-wake");
  });
});
