import { Signal } from "../types.ts";
export class TraversalError extends Error {
  constructor(
    public signal: Signal,
    public code: string,
    message?: string,
  ) {
    super(message);
    this.name = "TraversalError";
  }
}
