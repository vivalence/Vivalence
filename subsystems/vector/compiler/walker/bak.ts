// export class Deferred<T = any> {
//   handler: Promise<T>;
//   resolve!: (value: T | PromiseLike<T>) => void;
//   reject!: (reason?: any) => void;

//   constructor() {
//     this.handler = new Promise<T>((resolve, reject) => {
//       this.resolve = resolve;
//       this.reject = reject;
//     });
//   }
// }

// import type { Context, Effect, Middleware, Step } from "../types/index.ts";
// import { TraversalError, Signal } from "../types/index.ts";

// import { Trajectory } from "../core/trajectory.ts";
// import { compose } from "../core/lib.ts";
// import { Deferred } from "./lib/index.ts";

// export class Walker {
//   private trajectory: Trajectory;
//   private stack: Middleware[] = [];
//   private resolved: boolean = false;
//   private deferred: Deferred;

//   constructor(trajectory: Trajectory, deferred: Deferred) {
//     this.trajectory = trajectory;
//     this.stack = [];
//     this.deferred = deferred;
//   }

//   resolve(effect: Effect): Promise {
//     this.resolved = true;
//     this.deferred.resolve((input: any, context: Context) => {
//       return compose(this.stack)(input, context, effect);
//     });
//   }
//   // async resolve_ref(effect: Effect): Promise {this.resolved = true; this.deferred.resolve(async (context: Context) => {const fn = compose(this.stack); await fn(context, async (ctx: Context) => {ctx.response = await effect(ctx);}); return context.response;});}

//   async traverse(signal: Signal): Promise<Step> {
//     this.stack = [...this.stack, ...this.trajectory.middlewares];

//     const match = this.trajectory.match(signal);

//     if (!match) {
//       if (!this.trajectory.types.includes(signal.type)) {
//         throw new TraversalError(signal, "PATTERN_TYPE_NOT_FOUND");
//       } else {
//         throw new TraversalError(signal, "NO_PATTERN_MATCHED");
//       }
//     } else if (match.effect) {
//       this.resolve(match.effect);
//     } else if (match.descendant) {
//       this.trajectory = match.descendant;
//     }

//     return match;
//   }

//   // maybe implement a channel pattern or a generator
//   async walk(
//     signals: Signal[] = [],
//     getSignal: (docs: any) => Promise<Signal[]>,
//   ): Promise<Step> {
//     const steps = [];
//     let maxSteps = 20;

//     try {
//       while (!this.resolved) {
//         if (0 > maxSteps--) throw new TraversalError(null, "MAX_STEPS_REACHED");

//         if (signals.length > 0) {
//           steps.push(await this.traverse(signals.shift()!));
//         } else {
//           signals.push(...(await getSignal(this.trajectory.docs)));
//         }
//       }
//     } catch (error) {
//       // console.error("WALKER ERROR", error);
//       steps.push({ error });
//       if (!this.resolved) {
//         this.resolved = true;
//         this.deferred.reject(error);
//       }
//     } finally {
//       return steps;
//     }
//   }
// }
