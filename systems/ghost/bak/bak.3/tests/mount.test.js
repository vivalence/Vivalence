import { specimen, Controller, ConnectionError, Span, Vector, atom } from "@vivalence/typology";
import { Daemon } from "../prototypes/daemon.js";
import * as resolution from "../lifecycle/client/resolution.js";

const { describe, it, expect } = specimen;

describe("a host's mount faults on its own controller — the client never fails for a daemon", () => {
  it("a TIMEOUT in a daemon's mount marks it UNAVAILABLE, faults the daemon/<slug> branch, and leaves the client RUNNING", async () => {
    const controller = new Controller({ stdout: new Span("client") });
    controller.stdout.open();
    const hello = Object.assign(new Daemon(), { slug: "hello" });
    const faults = [];
    controller.stdout.pipe.tap((record) => record.verb === "fault" && faults.push(record.path));
    const execution = new Vector().do(() => {
      throw ConnectionError.timeout("Request aborted", {});
    });
    const die = { controller, client: { runtime: { daemons: [hello] } } };
    await resolution.daemons(execution)(die, async () => {
      await atom.until(hello.$status, (status) => status.code === "UNAVAILABLE", controller.abort.signal);
    });
    expect(controller.status.reflection.code).toBe("RUNNING");
    expect(faults).toEqual(["/client/daemon/hello"]);
    controller.abort.abort("done");
    await hello.mounting;
  });
});
