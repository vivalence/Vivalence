import { Signature } from "./signature.js";
import { Pipe } from "./pipe.js";

const CONFIG = {
  journal: 1000,
};

export class Span extends Signature {
  static tally = 0;

  constructor(signature = null, trace = null) {
    super(signature, trace);
    this.id ??= Span.tally++;
    if (!this.trace) {
      this.journal ??= [];
      this.channel ??= new Pipe();
    }
  }

  hasher() {
    return this.id;
  }

  from(trace) {
    return super.from(trace, true);
  }

  get records() {
    return this.root.journal;
  }

  get pipe() {
    return this.root.channel;
  }

  get absolute() {
    const natures = [];
    for (const node of this.heritage()) if (node.nature) natures.unshift(node.nature);
    return ("/" + natures.join("/")).replace(/\/{2,}/g, "/");
  }

  to(...sinks) {
    this.pipe.to(...sinks);
    return this;
  }

  mark(verb, data) {
    const record = {
      span: this.id,
      trace: this.trace?.id ?? null,
      path: this.absolute,
      verb,
      at: performance.now(),
    };
    if (data !== undefined) record.data = data;
    const journal = this.records;
    journal.push(record);
    if (journal.length > CONFIG.journal) journal.splice(0, journal.length - CONFIG.journal);
    this.pipe.send(record);
    return this;
  }

  open() {
    return this.mark("open");
  }

  close() {
    return this.mark("close");
  }

  note(data) {
    return this.mark("note", data);
  }

  fault(error) {
    return this.mark("fault", { message: error?.message ?? String(error), code: error?.code ?? null });
  }
}
