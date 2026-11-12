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

specimen.describe("control.fault — a step that throws faults on a controller's stdout", () => {
  const faults = (controller) => controller.stdout.$history.get().filter((record) => record.track === "fault");
  const thrown = new Error("the step failed");
  const throwing = async () => {
    throw thrown;
  };

  specimen.it("defaults to the die's own controller", async () => {
    const die = { controller: mint() };
    await control.fault()(die, throwing);
    specimen.expect(faults(die.controller).map((record) => record.data.message)).toEqual([thrown.message]);
  });

  specimen.it("takes a function that finds the controller", async () => {
    const controller = mint();
    await control.fault(() => controller)({}, throwing);
    specimen.expect(faults(controller)).toHaveLength(1);
  });

  specimen.it("takes a dotted key, walked with object.at", async () => {
    const die = { daemon: { controller: mint() } };
    await control.fault("daemon.controller")(die, throwing);
    specimen.expect(faults(die.daemon.controller)).toHaveLength(1);
  });

  specimen.it("a step that passes faults nothing", async () => {
    const die = { controller: mint() };
    await control.fault()(die, async () => {});
    specimen.expect(faults(die.controller)).toEqual([]);
  });
});

specimen.describe("control.stderr — a step that throws faults on the span it locates", () => {
  const faults = (span) => span.$history.get().filter((record) => record.track === "fault");
  const thrown = new Error("the step failed");
  const throwing = async () => {
    throw thrown;
  };

  specimen.it("defaults to the die's own controller's stdout", async () => {
    const die = { controller: mint() };
    await control.stderr()(die, throwing);
    specimen.expect(faults(die.controller.stdout).map((record) => record.data.message)).toEqual([thrown.message]);
  });

  specimen.it("takes a function that finds the span", async () => {
    const mode = { stdout: new Span("mode") };
    await control.stderr((die) => die.mode.stdout)({ mode }, throwing);
    specimen.expect(faults(mode.stdout)).toHaveLength(1);
  });

  specimen.it("takes a dotted key, walked with object.at", async () => {
    const die = { daemon: { controller: mint() } };
    await control.stderr("daemon.controller.stdout")(die, throwing);
    specimen.expect(faults(die.daemon.controller.stdout)).toHaveLength(1);
  });

  specimen.it("a step that passes faults nothing", async () => {
    const die = { controller: mint() };
    await control.stderr()(die, async () => {});
    specimen.expect(faults(die.controller.stdout)).toEqual([]);
  });
});
