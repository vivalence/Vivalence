import { cast } from "@vivalence/typology";
import { computed, atom } from "nanostores";

// export const StallStatusEnum = {IDLE, NAVIGATING, PULLING, CLOSED, ERROR};

export class Stall {
  $queue = atom([]);
  $active = atom(null);
  $error = atom(null);
  $status = atom("<uninitialized>");

  threshold = 0;
  handlers = { pull: null, hooks: [] };

  get queue() {
    return [...this.$queue.get(), this.$active.get()].filter(Boolean);
  }

  withPull(pull, threshold = 0) {
    this.handlers.pull = pull;
    this.handlers.hooks = []; // this makes hook bundling on buffer render an imperative!
    this.threshold = threshold;
    return this;
  }

  next(promise) {
    const status = this.$status.get();
    if (["CLOSED", "NAVIGATING"].includes(status)) return;
    this.$status.set("NAVIGATING");

    const prev = { ...this.$active.get() };
    this.$active.set(null);
    const queue = this.$queue.get();

    if (queue.length > 0) {
      const [first, ...rest] = queue;
      this.$queue.set(rest);
      this.$active.set(first);
    }

    this.runHooks(prev, this.$active.get(), promise);

    this.$status.set("IDLE");
    this.pull();
  }

  async pull() {
    const status = this.$status.get();
    if (["CLOSED", "PULLING"].includes(status)) return;
    if (this.$queue.get().length > this.threshold) return;
    if (!this.handlers.pull) {
      console.log("@stall/pull() handler.pull missing");
      return;
    }

    this.$status.set("PULLING");

    try {
      const buffers = await this.handlers.pull(this);
      this.$queue.set([...this.$queue.get(), ...buffers]);
      if (!this.$active.get()) {
        const [first, ...rest] = this.$queue.get();
        this.$queue.set(rest);
        this.$active.set(first);
      }
      if (this.$status.get() === "PULLING") this.$status.set("IDLE");
    } catch (error) {
      console.log("[STALL PULL ERROR]", this, error);
      this.$status.set("ERROR");
      this.$error.set(error);
    }
  }

  push(buffers) {
    this.$queue.set([...this.$queue.get(), ...cast.array(buffers)]);

    if (!this.$active.get()) {
      const [first, ...rest] = this.$queue.get();
      this.$active.set(first);
      this.$queue.set(rest);
    }
  }

  reset() {
    this.handlers.pull = null;
    this.handlers.hooks = [];
    this.$active.set(null);
    this.$queue.set([]);
    this.$status.set("IDLE");
  }

  onNext(fn) {
    this.handlers.hooks.push(fn);
  }

  runHooks(prev, active, promise) {
    const prevHooks = prev?.hooks || [];
    [...prevHooks, ...this.handlers.hooks] //
      .forEach((f) => f(prev, active, promise));
  }

  toJSON() {
    const active = this.$active.get();
    return {
      status: this.$status.get(),
      active: active?.toJSON?.() ?? active?.id ?? null,
      queue: this.$queue.get().map((b) => b?.toJSON?.() ?? b?.id ?? b),
      error: this.$error.get()?.message ?? null,
      hasPull: !!this.handlers.pull,
      hooks: this.handlers.hooks.length,
    };
  }
}

// import { atom } from "nanostores";

// export const $queue = atom([]);
// export const $active = atom(null);
// export const $status = atom("IDLE");
// export const $error = atom(null);

// let threshold = 0;
// let pullHandler = null;
// const hooks = [];

// export function withThreshold(t) {
//   threshold = t;
// }

// export function withPull(pull) {
//   pullHandler = pull;
// }

// export function next(promise) {
//   const status = $status.get();
//   if (["STOP", "NEXT"].includes(status)) return;

//   $status.set("NEXT");
//   const prev = { ...$active.get() };

//   $active.set(null);
//   const queue = $queue.get();
//   if (queue.length > 0) {
//     const [first, ...rest] = queue;
//     $queue.set(rest);
//     $active.set(first);
//   }

//   runHooks(prev, $active.get(), promise);

//   $status.set("IDLE");
//   pull();
// }

// export function push(mode) {
//   $queue.set([...$queue.get(), mode]);
//   if (!$active.get()) {
//     const [first, ...rest] = $queue.get();
//     $queue.set(rest);
//     $active.set(first);
//   }
// }

// export async function pull() {
//   const status = $status.get();
//   if (["STOP", "PULLING"].includes(status)) return;
//   if ($queue.get().length > threshold) return;

//   $status.set("PULLING");

//   try {
//     if (!pullHandler) throw new Error("Puller fehlt");
//     const products = await pullHandler({ $queue, $active, $status });
//     $queue.set([...$queue.get(), ...products]);
//     if (!$active.get()) {
//       const [first, ...rest] = $queue.get();
//       $queue.set(rest);
//       $active.set(first);
//     }
//     $status.set("IDLE");
//   } catch (error) {
//     $error.set(error);
//     $status.set("STOP");
//     console.log("[STALL PULL ERROR]", error);
//   }
// }

// export function reset() {
//   $active.set(null);
//   $queue.set([]);
//   $status.set("IDLE");
// }

// export function onNext(fn) {
//   hooks.push(fn);
// }

// function runHooks(prev, active, promise) {
//   const prevHooks = prev?.hooks || [];
//   [...prevHooks, ...hooks].forEach((f) => f(prev, active, promise));
// }

// // // recast from svelte to nanostores.
// // export class Stall {
// //   queue = $state([]);
// //   active = $state(null);
// //   status = $state("IDLE");
// //   threshold = 0;
// //   handlers = {
// //     pull: null,
// //     hooks: [],
// //   };

// //   withThreshold(threshold) {
// //     this.threshold = threshold;
// //   }

// //   withPull(pull) {
// //     this.handlers.pull = pull;
// //   }

// //   next(promise) {
// //     if (["STOP", "NEXT"].includes(this.status)) return;
// //     this.status = "NEXT";
// //     let prev = { ...this.active }; // TODO: deepclone

// //     this.active = null;
// //     if (this.queue.length > 0) this.active = this.queue.shift();

// //     this.hooks(prev, this.active, promise);

// //     this.status = "IDLE";
// //     this.pull();
// //   }

// //   push(mode) {
// //     this.queue.push(mode);
// //     if (!this.active) this.active = this.queue.shift();
// //   }

// //   async pull() {
// //     if (["STOP", "PULLING"].includes(this.status)) return;
// //     if (this.queue.length > this.threshold) return;
// //     this.status = "PULLING";

// //     try {
// //       if (!this.handlers.pull) throw new Error("Puller fehlt");
// //       const buffers = await this.handlers.pull(this);
// //       this.queue.push(...buffers);
// //       if (!this.active) this.active = this.queue.shift();
// //       this.status = "IDLE";
// //       // return this;
// //     } catch (error) {
// //       this.error = error;
// //       this.status = "STOP";
// //       console.log("[BUFFER PULL ERROR]", this, error);
// //     }
// //   }

// //   reset() {
// //     this.active = null;
// //     this.queue = [];
// //     this.status = "IDLE";
// //   }

// //   onNext(fn) {
// //     this.handlers.hooks.push(fn);
// //   }

// //   hooks(prev, active, promise) {
// //     [...prev.hooks, ...this.handlers.hooks].map((f) =>
// //       f(prev, active, promise),
// //     );
// //   }
// // }
