export { type PatternDocs, Pattern } from "./pattern.ts";
export { Signal } from "./signal.ts";
export { TraversalError } from "./error.ts";

export type PatternFunction = Function<Pattern[]>;

export type Input = any | Record<any, any>;
export type Result = any | Record<any, any>;

// export type Input = any | { [key: string]: any };
// export type Result = any | { [key: string]: any };

export interface Context {
  [key: string]: any;
}

export interface Middleware {
  (input: Input, ctx: Context, next: () => Promise<Result>): Promise<Result>;
}

export interface Effect {
  (input: Input, ctx: Context): Promise<Result>;
}

export type Match = null | {
  match?: any;
  signal?: Signal;
  effect?: Effect;
  descendant?: any; // Trajectory
};
