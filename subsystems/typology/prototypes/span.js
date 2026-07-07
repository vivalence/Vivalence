import { Signature } from "./signature.js";
import { hash } from "@vivalence/typology";
import { Timed, Transported, Transitioned, Subjected, Faulted, Objected } from "./tracks.js";

export class Span extends Signature {
  pipe = null;

  timing = new Timed(null, this);
  transport = null;
  transition = null;
  subject = null;
  fault = null;
  object = null;

  track = {
    transport: (options) => {
      if (!this.transport) this.transport = new Transported(options, this);
      return this.transport;
    },
    transition: (options) => {
      if (!this.transition) this.transition = new Transitioned(options, this);
      return this.transition;
    },
    subject: (options) => {
      if (!this.subject) this.subject = new Subjected(options, this);
      return this.subject;
    },
    fault: (options) => {
      if (!this.fault) this.fault = new Faulted(options, this);
      return this.fault;
    },
    object: (payload, schema) => {
      if (!this.object) this.object = new Objected({ schema }, this);
      if (payload !== undefined) this.object.set(payload);
      return this.object;
    },
  };

  _hash = null;

  to(pipe) {
    this.pipe = pipe;
    return this;
  }

  branch(signature) {
    const child = super.branch(signature);
    child.pipe ??= this.pipe;
    return child;
  }

  emit() {
    this.pipe?.send(this.record);
    return this;
  }

  log(subject, payload, transport) {
    const write = (nature, value, wire) => {
      const child = this.branch(nature);
      if (wire) {
        const track = child.track.transport();
        if (wire.request) track.send(wire.request);
        if (wire.response) track.receive(wire.response);
      }
      if (value instanceof Error) child.track.fault().raise(value.message, value.code);
      else child.track.object(value);
      return child;
    };
    if (typeof subject === "string") return write(subject, payload, transport);
    let child;
    for (const [nature, value] of Object.entries(subject)) child = write(nature, value, payload);
    return child;
  }

  begin() {
    this.timing.begin();
    this._hash = hash.array([this.nature, this.trace?.hash ?? null, this.timing.begun]);
    return this;
  }
  seal() {
    this.timing.seal();
    return this;
  }
  drain(pipe) {
    this.seal();
    const target = pipe ?? this.pipe;
    if (!this.trace && target) {
      typeof target === "function" ? target(this) : target.send(this);
    }
    return this;
  }

  get duration() {
    return this.timing.duration;
  }
  get complete() {
    return this.timing.complete && this.gauges.every((gauge) => gauge.complete);
  }

  get hash() {
    return this._hash;
  }
  hasher() {
    return this._hash;
  }

  get absolute() {
    const natures = [];
    for (const node of this.heritage()) if (node.nature) natures.unshift(node.nature);
    return ("/" + natures.join("/")).replace(/\/{2,}/g, "/");
  }

  get record() {
    const result = { nature: this.nature, absolute: this.absolute, timing: this.timing.json };
    if (this.transport) result.transport = this.transport.json;
    if (this.transition) result.transition = this.transition.json;
    if (this.subject) result.subject = this.subject.json;
    if (this.fault) result.fault = this.fault.json;
    if (this.object) result.object = this.object.json;
    return result;
  }

  get json() {
    const result = this.record;
    if (this.gauges.length) result.children = this.gauges.map((gauge) => gauge.json);
    return result;
  }
}
