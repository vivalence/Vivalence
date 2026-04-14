import { Signature } from "./signature.js";
import { hash } from "@vivalence/typology";
import { Timed, Transported, Transitioned, Subjected, Faulted } from "./tracks.js";

export class Span extends Signature {
  timing = new Timed(null, this);
  transport = null;
  transition = null;
  subject = null;
  fault = null;
  pipe = null;

  track = {
    transport:  (options) => { if (!this.transport) this.transport = new Transported(options, this); return this.transport; },
    transition: (options) => { if (!this.transition) this.transition = new Transitioned(options, this); return this.transition; },
    subject:    (options) => { if (!this.subject) this.subject = new Subjected(options, this); return this.subject; },
    fault:      (options) => { if (!this.fault) this.fault = new Faulted(options, this); return this.fault; },
  };

  _hash = null;

  to(pipe) { this.pipe = pipe; return this; }
  begin() {
    this.timing.begin();
    this._hash = hash.array([this.nature, this.trace?.hash ?? null, this.timing.begun]);
    return this;
  }
  seal() { this.timing.seal(); return this; }
  drain(pipe) {
    this.seal();
    const target = pipe ?? this.pipe;
    if (!this.trace && target) {
      typeof target === "function" ? target(this) : target.send(this);
    }
    return this;
  }

  get duration() { return this.timing.duration; }
  get complete() { return this.timing.complete && this.gauges.every((gauge) => gauge.complete); }

  get hash() { return this._hash; }
  hasher() { return this._hash; }

  get json() {
    const result = { nature: this.nature, timing: this.timing.json };
    if (this.transport) result.transport = this.transport.json;
    if (this.transition) result.transition = this.transition.json;
    if (this.subject) result.subject = this.subject.json;
    if (this.fault) result.fault = this.fault.json;
    if (this.gauges.length) result.children = this.gauges.map((gauge) => gauge.json);
    return result;
  }
}
