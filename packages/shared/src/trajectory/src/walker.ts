import { Signal, Step } from "../types.ts";
import { Trajectory, Context, Effect, Middleware, Match } from "./trajectory.ts";
import { Deferred, compose } from "./lib.ts";
import { TraversalError } from "./error.ts";

export class Walker {
  private trajectory: Trajectory;
  private stack: Middleware[] = [];
  private resolved: boolean = false;
  private deferred: Deferred;

  constructor(trajectory: Trajectory, deferred: Deferred) {
    this.trajectory = trajectory;
    this.stack = [];
    this.deferred = deferred;
  }

  async traverseEffects(step: Step, effect: Effect): Promise<Step> {
    this.resolved = true;
    this.deferred.resolve(async (context: Context) => {
      const fn = compose(this.stack);
      await fn(context, async (ctx: Context) => {
        ctx.response = await effect(ctx);
      });
      return context.response;
    });
    return step;
  }

  async traverseDescendants(step: Step, trajectory: Trajectory): Promise<Step> {
    this.trajectory = trajectory;
    return step;
  }

  async traverse(signal: Signal): Promise<Step> {
    this.stack = [...this.stack, ...this.trajectory.middlewares];

    const { step, effect, descendant } = this.trajectory.match(signal);

    const strategies = [
      () => effect && this.traverseEffects(step, effect),
      () => descendant && this.traverseDescendants(step, descendant),
    ];

    for (const strategy of strategies) {
      const result = await strategy();
      if (result) return result;
    }

    const typesAvailable = this.trajectory.getAvailableTypes();

    if (!typesAvailable.includes(signal.type)) {
      throw new TraversalError(signal, "PATTERN_TYPE_NOT_FOUND");
    } else {
      throw new TraversalError(signal, "NO_PATTERN_MATCHED");
    }
  }

  async walk(
    signals: Signal[] = [],
    askForDirections: (trajectory: Trajectory) => Promise<Signal[]>,
  ): Promise<Step> {
    let steps = [];
    const maxSteps = 10;

    try {
      while (!this.resolved && steps.length < maxSteps) {
        if (signals.length > 0) {
          steps.push(await this.traverse(signals.shift()!));
        } else {
          signals.push(...(await askForDirections(this.trajectory)));
        }
      }
      return steps;
    } catch (error) {
      if (!this.resolved) {
        this.resolved = true;
        this.deferred.reject(error);
      }
    }
  }
}
// // import { Trajectory, Context, Destination } from "./trajectory.ts";
// // import { SignalFactory } from "./signal.ts";
// // src/walker.ts
// import { Signal, Params } from "../types.ts";
// import { Trajectory, Context } from "./trajectory.ts";
// import { Deferred } from "./lib.ts";

// export class Walker {
//   private trajectory: Trajectory;
//   private stack: (ctx: any) => Promise<any>;
//   private resolved: boolean = false;
//   private deferred: Deferred;

//   constructor(trajectory: Trajectory, deferred: Deferred) {
//     this.trajectory = trajectory;
//     this.stack = (ctx) => Promise.resolve(ctx);
//     this.deferred = deferred;
//   }

//   async traverse(signal: Signal, params: Params): Promise<Params> {
//     const effectMatch = this.trajectory.matchEffects(signal);
//     if (effectMatch) {
//       const [newParams, effect] = effectMatch;
//       const mergedParams = { ...params, ...newParams };

//       this.resolved = true;
//       this.deferred.resolve(async (ctx: Context) => {
//         let result = null;

//         console.log("this.stack", this.stack);
//         const stackresult = await this.stack(ctx, async () => {
//           console.log("this.stack.ctx", ctx);
//           result = await effect(ctx);
//           ctx.effect = result;
//         });
//         console.log("stackresult", stackresult);
//         return result;
//       });

//       return mergedParams;
//     }

//     const descendantMatch = this.trajectory.matchDescendants(signal);
//     if (descendantMatch) {
//       const [newParams, descendant] = descendantMatch;
//       const mergedParams = { ...params, ...newParams };

//       this.stack = descendant.compose(this.stack);
//       this.trajectory = descendant;

//       return mergedParams;
//     }

//     return params;
//   }

//   async walk(
//     signal: Signal[] = [],
//     askForDirections: (trajectory: Trajectory) => Promise<Signal[]>,
//   ): Promise<Params> {
//     let params = {};
//     let step = 0;

//     while (!this.resolved && step++ < 10) {
//       if (signal.length > 0) {
//         params = await this.traverse(signal.shift()!, params);
//       } else {
//         const newSignals = await askForDirections(this.trajectory);
//         signal.push(...newSignals);
//       }
//     }

//     return params;
//   }
// }

// // export class Walker {
// //   private trajectory: Trajectory;

// //   constructor(trajectory: Trajectory, release: any) {
// //     this.trajectory = trajectory;
// //     this.stack = () => Promise.resolve();
// //     this.release = release;
// //   }
// //   resolve(cb) {
// //     this.release.resolve(cb);
// //   }

// //   async traverse(signal: Signal, parameters) {
// //     const [params, effect] = this.trajectory.matchEffects(signal);
// //     parameters.merge(params)

// //     if (effect) {
// //       this.resolve(async (ctx) => {
// //         return await effect(await this.stack(ctx));
// //       });
// //     } else {
// //       const [params,descendant] = this.trajectory.matchDescendants(signal);
// //       parameters.merge(params)
// //       if (descendant) {
// //         this.stack = descendant.compose(this.stack);
// //         this.trajectory = descendant;
// //       }
// //     }
// //     return parameters;
// //   }

// //   async walk(signal: Signal[], askForDirections: Function): Params {
// //     let params = {};
// //     while (!this.released) {
// //       if (signal.length > 0) params    =this.traverse(signal.pop(),params);
// //       else signal.join(await askForDirections(this.trajectory));
// //     }
// //     return params;
// //   }
// // }

// // // usage
// // const release = new Promise();
// // const walker = new Walker(trajectory, release);

// // const params = await walker.walk([], async (directions) => {
// //   // const input= getUserInput(direction)
// //   // return parseInputToSignal(input)
// // });
// // const handler = await release;

// // const context = {params};
// // const result = await handler(context);

// // // handler = (context)=>{
// // // middleware3(context, () => {
// // //   middleware2(context, () => {
// // //     middleware1(context, () => {
// // //       return effect(context);
// // //     });
// // //   });
// // // });
// // }
