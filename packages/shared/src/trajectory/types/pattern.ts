import { hash } from "@vivalence/shared";
import { Signal } from "./signal.ts";

export class Pattern<T = any> {
  readonly type: string;
  readonly match: (signal: Signal<any>) => Record<string, string> | null;
  readonly docs?: Record<string, any>;

  constructor(
    type: string,
    match: (signal: Signal<any>) => Record<string, string> | null,
    docs?: Record<string, any>,
  ) {
    this.type = type;
    this.match = match;
    this.docs = docs;
  }

  get hash() {
    return hash.object(this);
  }

  matchWithDocs(
    signal: Signal<any>,
  ): { match: Record<string, string>; docs: Record<string, any> } | null {
    const match = this.match(signal);
    if (match === null) return null;

    return {
      match,
      docs: this.docs || {},
    };
  }
}
