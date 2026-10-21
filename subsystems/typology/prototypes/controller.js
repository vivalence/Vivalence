import * as promise from "../gestalten/belt/promise.js";
import { Signal } from "./signal.js";
import { Span, faulted } from "./span.js";
import { Status } from "./status.js";
import * as steer from "../gestalten/steer/index.js";
import { v } from "../schematics/index.js";
import { Vector } from "./vector.js";

export class Controller {
  children = new Set();
  gate = promise.waiter();

  constructor({ stdout = new Span("controller"), stdin = new Vector(), status = new Status("IDLE"), abort = new AbortController(), parent = null } = {}) {
    Object.assign(this, { stdout, stdin, abort, parent, status });
    const { MACHINE } = v.primitives.controller;
    const aborted = () => this.status.set({ code: "ABORTED", reason: this.abort.signal.reason });

    this.settled = new Promise((fulfil) => {
      const unlisten = this.status.$transient.listen((reflection) => {
        const state = MACHINE.states[reflection.code];
        if (!state) throw new Error(`[controller] no status ${reflection.code} in a machine of ${Object.keys(MACHINE.states).join(" · ")}`);
        this.stdout.status({ ...reflection, error: reflection.error && faulted(reflection.error) });
        this.gate.wake();
        if (!state.settled) return;
        unlisten();
        this.abort.signal.removeEventListener("abort", aborted);
        this.parent?.children.delete(this);
        for (const child of this.children) child.abort.abort(`parent ${reflection.code}`);
        fulfil(this.toJSON());
      });
    });

    this.abort.signal.aborted ? aborted() : this.abort.signal.addEventListener("abort", aborted, { once: true });

    const signalled = (name, move) =>
      this.stdin.open(name, async (ctx) => {
        move(ctx);
        for (const child of this.children) await child.kill(name, ctx.input);
      });
    signalled("SIGSTOP", () => this.status.is("RUNNING") && this.status.set({ code: "PAUSED" }));
    signalled("SIGCONT", () => this.status.is("PAUSED") && this.status.set({ code: "RUNNING" }));
    signalled("SIGTERM", (ctx) => this.status.is(["RUNNING", "PAUSED"]) && this.status.set({ code: "STOPPING", signal: "SIGTERM", reason: ctx.input }));
    signalled("SIGKILL", (ctx) => this.abort.abort(ctx.input ?? "SIGKILL"));

    this.parent?.children.add(this);
  }

  start() {
    if (this.status.is("IDLE")) this.status.set({ code: "RUNNING" });
    this.stdout.start();
    return this;
  }

  stop() {
    this.stdout.stop();
    if (this.status.is(["RUNNING", "PAUSED", "STOPPING"])) this.status.set({ code: this.status.is("STOPPING") ? "STOPPED" : "DONE" });
    return this;
  }

  fault(error) {
    if (!v.primitives.controller.MACHINE.states[this.status.reflection.code].settled) this.status.set({ code: "FAILED", error });
    this.stdout.fault(error);
    return this;
  }

  branch(name) {
    return new Controller({ parent: this, stdout: this.stdout.branch(name) });
  }

  kill(name, input) {
    return steer.dispatch.invoke(this.stdin, new Signal(name), steer.strategy.echo)(input);
  }

  async proceed() {
    while (this.status.is("PAUSED")) await this.gate.wait(this.abort.signal);
    return this.status.is("RUNNING");
  }

  toJSON() {
    const { error, ...reflection } = this.status.reflection;
    return { path: this.stdout.absolute, ...reflection, error: error && faulted(error), children: [...this.children].map((child) => child.toJSON()) };
  }
}
