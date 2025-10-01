import { hash } from "@vivalence/shared";

export type ForwardFunction = (signals: any[]) => Promise<Feature[]>;
//

export interface Context {
  [key: string]: any;
}

export class Feature {
  token: Record<string, any> = {};
  annotation: Record<string, any> = {};
  signal?: Signal;
  [key: string]: any;

  constructor(data?: {
    token?: Record<string, any>;
    annotation?: Record<string, any>;
  }) {
    this.token = data?.token || {};
    this.annotation = data?.annotation || {};
  }

  from(signal: Signal) {
    if (!this.signal) this.signal = signal;
    return this;
  }

  get cached() {
    const cache = JSON.stringify({
      token: this.token,
      annotation: this.annotation,
    });
    return cache;
  }

  fromCache(cache: string) {
    return new Feature(JSON.parse(cache));
  }
}

export class Signal<T = any> {
  type: string;
  value: T;
  ancestor?: Signal;
  forms: Form[] = [];

  constructor(type: string, value: T) {
    this.type = type;
    this.value = value;
  }

  get hash() {
    return hash.array([this.type, this.value]);
  }

  from(ancestor: Signal) {
    if (!this.ancestor) this.ancestor = ancestor;

    if (!this.forms.includes(ancestor.constructor)) {
      console.log(
        `[CLASSIFIER WARNING] Signal: ${ancestor.constructor.name} is not a form of ${this.constructor.name}`,
      );
    }

    return this;
  }
}

export const Form = Signal;

// Misnomer. more of a detector, scanner, interpreter, or the like.
export type ParserFunction = (
  signal: T,
  ctx: Context,
  next: ForwardFunction,
) => Promise<Feature[]>;

export class Parser<Signal> {
  constructor(public fn: ParserFunction) {}

  parse(
    signal: Signal,
    ctx: Context,
    next: ForwardFunction,
  ): Promise<Feature[]> {
    return this.fn(signal.value, ctx, next);
  }

  get hash() {
    return hash.string(this.fn.toString());
  }
}
