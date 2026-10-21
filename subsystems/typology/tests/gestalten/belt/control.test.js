import { control, Controller, sleep, Span, specimen } from "@vivalence/typology";

const mint = () => new Controller({ stdout: new Span("controlled") });

specimen.describe("control.controlled — the wait for a status on a controller", () => {
  specimen.it("resolves with the controller once it starts: IDLE → RUNNING", async () => {
    const controller = mint();
    const waited = control.controlled(controller);
    specimen.expect(controller.status.is("IDLE")).toBe(true);
    controller.start();
    specimen.expect(await waited).toBe(controller);
    specimen.expect(controller.status.is("RUNNING")).toBe(true);
  });

  specimen.it("rejects with the status's error when it faults before it starts: IDLE → FAILED", async () => {
    const controller = mint();
    const waited = control.controlled(controller);
    controller.fault(new Error("refused at boot"));
    await specimen.expect(waited).rejects.toThrow();
    specimen.expect(controller.status.is("FAILED")).toBe(true);
    specimen.expect(controller.status.reflection.error).toBeDefined();
  });

  specimen.it("answers a controller already past IDLE without listening: RUNNING resolves, DONE rejects", async () => {
    const running = mint();
    running.start();
    specimen.expect(await control.controlled(running)).toBe(running);

    const done = mint();
    done.start();
    done.stop();
    await specimen.expect(control.controlled(done)).rejects.toThrow("DONE");
  });

  specimen.it("takes another check: a controller counted PAUSED", async () => {
    const controller = mint();
    controller.start();
    await controller.kill("SIGSTOP");
    specimen.expect(await control.controlled(controller, (status) => status.code === "PAUSED")).toBe(controller);
  });
});

specimen.describe("control.hold — the wait for a controller to leave its live states", () => {
  specimen.it("stays pending while IDLE, RUNNING or PAUSED, resolves at the stop", async () => {
    const controller = mint();
    let held = true;
    const holding = control.hold(controller).then(() => (held = false));
    controller.start();
    await controller.kill("SIGSTOP");
    await controller.kill("SIGCONT");
    await sleep.ms(5);
    specimen.expect(held).toBe(true);
    await controller.kill("SIGTERM");
    await holding;
    specimen.expect(controller.status.is("STOPPING")).toBe(true);
    controller.stop();
    specimen.expect(controller.status.is("STOPPED")).toBe(true);
  });

  specimen.it("resolves at once on a settled controller", async () => {
    const controller = mint();
    controller.start();
    controller.stop();
    await control.hold(controller);
    specimen.expect(controller.status.is("DONE")).toBe(true);
  });

  specimen.it("resolves on a fault and on an abort alike", async () => {
    const faulted = mint();
    faulted.start();
    const holding = control.hold(faulted);
    faulted.fault(new Error("mid-run"));
    await holding;
    specimen.expect(faulted.status.is("FAILED")).toBe(true);

    const aborted = mint();
    aborted.start();
    const aborting = control.hold(aborted);
    await aborted.kill("SIGKILL");
    await aborting;
    specimen.expect(aborted.status.is("ABORTED")).toBe(true);
  });
});
