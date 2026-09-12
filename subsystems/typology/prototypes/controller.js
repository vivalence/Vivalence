import { Failure, is, promise, Signal, Span, Status, steer, v, Vector } from "@vivalence/typology";

const said = (input) => (is.string(input) && input.length ? input : undefined);

export class Controller {
  children = new Set();
  status = new Status("IDLE");
  gate = promise.waiter();
  settled = null;

  constructor({ stdout = new Span("controller"), stdin = new Vector(), abort = new AbortController(), parent = null } = {}) {
    Object.assign(this, { stdout, stdin, abort, parent });
    const { MACHINE } = v.primitives.controller;

    this.settled = new Promise((fulfil) => {
      const untap = this.stdout.pipe.tap((record) => {
        if (record.span !== this.stdout.id) return;
        const from = this.status.reflection.code;
        const code = MACHINE.transitions[record.verb]?.[from] ?? from;
        if (code === from) return;
        const { error } = MACHINE.verbs[record.verb];
        this.status.set({ code, ...(error && { error: new Failure(error, record) }) });
        this.gate.wake();
        if (!MACHINE.states[code].settled) return;
        untap();
        this.parent?.children.delete(this);
        for (const child of this.children) child.abort.abort(`parent ${code}`);
        fulfil(this.toJSON());
      });
    });

    const aborted = () => this.stdout.mark("abort", { ...(said(this.abort.signal.reason) && { reason: this.abort.signal.reason }) });
    this.abort.signal.aborted ? aborted() : this.abort.signal.addEventListener("abort", aborted, { once: true });

    for (const [name, verb] of Object.entries(MACHINE.signals))
      this.stdin.open(name, async (ctx) => {
        verb === "abort"
          ? this.abort.abort(said(ctx.input) ?? name)
          : this.stdout.mark(verb, { signal: name, ...(said(ctx.input) && { reason: ctx.input }) });
        for (const child of this.children) await child.kill(name, ctx.input);
      });
    this.parent?.children.add(this);
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
    return {
      path: this.stdout.absolute,
      span: this.stdout.id,
      ...this.status.reflection,
      children: [...this.children].map((child) => child.toJSON()),
    };
  }

  [Symbol.for("nodejs.util.inspect.custom")]() {
    return `Controller(${this.stdout.absolute}):${this.status.reflection.code}`;
  }
}
