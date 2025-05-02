import { hash } from "@vivalence/shared";

export type NextFunction = (signals: any[]) => Promise<Feature[]>;
//

export interface Context {
  [key: string]: any;
}

// export interface Classification = Feature[][]

export class Feature {
  token: Record<string, any> = {};
  annotation: Record<string, any> = {};
  signal?: Signal;

  constructor(data?: { token?: Record<string, any>; annotation?: Record<string, any> }) {
    this.token = data?.token || {};
    this.annotation = data?.annotation || {};
  }

  from(signal: Signal) {
    if (!this.signal) this.signal = signal;
    return this;
  }

  get cached() {
    const cache = JSON.stringify({ token: this.token, annotation: this.annotation });
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

  constructor(type: string, value: T) {
    this.type = type;
    this.value = value;
  }

  get hash() {
    return hash.array([this.type, this.value]);
  }

  from(ancestor: Signal) {
    if (!this.ancestor) this.ancestor = ancestor;
    return this;
  }
}

export type ParserFunction = (signal: T, ctx: Context, next: NextFunction) => Promise<Feature[]>;

export class Parser<Signal> {
  constructor(public fn: ParserFunction) {}

  parse(signal: Signal, ctx: Context, next: NextFunction): Promise<Feature[]> {
    return this.fn(signal.value, ctx, next);
  }

  get hash() {
    return hash.string(this.fn.toString());
  }
}
