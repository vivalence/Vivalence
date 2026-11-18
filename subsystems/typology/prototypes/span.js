import { onSet } from "nanostores";
import { Signature } from "./signature.js";
import { Pipe } from "./pipe.js";
import { Queue } from "./queue.js";
import { Vector } from "./vector.js";
import * as steer from "../gestalten/steer/index.js";
import { Start, Stop, Request, Response, Fault, Log, Entity, Status } from "../schematics/primitives/track.js";

export const faulted = (error) => ({ type: error?.name ?? "Error", message: error?.message ?? String(error), code: error?.code, stack: error?.stack });

const record = (schema) => (data, ctx) =>
  ctx.span.pipe.send({ at: performance.timeOrigin + performance.now(), path: ctx.span.absolute, track: ctx.track, data: schema.cast(data) });

const STANDARD = new Vector()
  .open("start", record(Start))
  .open("stop", record(Stop))
  .open("request", record(Request))
  .open("response", record(Response))
  .open("fault", record(Fault))
  .open("log", record(Log))
  .open("entity", record(Entity))
  .open("status", record(Status));

export class Span extends Signature {
  static limit = 1000;

  constructor(signature = null, trace = null) {
    if (signature instanceof new.target) return signature;
    super(signature, trace);
    this.pipe = new Pipe();
    this.$history = this.pipe.fold([], (held, record) => [...held, record]);
    if (this.trace) this.pipe.tap(this.trace.pipe);
    onSet(this.$history, ({ newValue }) => newValue.splice(0, newValue.length - Span.limit));
    this.tracked = new Vector();
    this.tracks(this.trace ? this.trace.tracked : STANDARD);
  }

  from(trace) {
    return super.from(trace, true);
  }

  get history() {
    return this.$history.get();
  }

  async *drain(signal) {
    const live = new Queue();
    const untap = this.pipe.tap(live);
    try {
      yield* [...this.history];
      yield* live.drain(signal);
    } finally {
      untap();
    }
  }

  [Symbol.asyncIterator]() {
    return this.drain();
  }

  tracks(vector) {
    this.tracked.graft(vector);
    for (const { nature } of vector.patterns) this[nature] ??= (data) => this.track(nature, data);
    return this;
  }

  track(name, data) {
    steer.dispatch.execute(this.tracked, { span: this, track: name, input: data }, name);
    return this;
  }

  fault(error) {
    return this.track("fault", faulted(error));
  }
}
