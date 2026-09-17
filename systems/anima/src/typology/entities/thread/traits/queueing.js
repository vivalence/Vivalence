// import { computed } from "nanostores";
// import { object, Span, Blacklist } from "@vivalence/typology";
// import { Stall } from "../../../prototypes/stall.js";
// import { telemetry } from "$telemetry";

// QUEUEING is a marker trait: it carries no behavior to install, only config (the queue
// depth) its consumers read live. The Stall is terminal-owned; it reads `depth` each tick.

// how many buffers the stall keeps queued. defaults to 1 when QUEUEING is absent.
export const depth = (thread) => thread.trait?.QUEUEING?.depth ?? 1;

// the composition rule: if QUEUEING is configured, its depth must be usable (≥ 1). Absent →
// depth defaults to 1 → passes; only a misconfigured depth: 0 fails.
export const valid = (thread) => (depth(thread) >= 1 ? null : "QUEUEING depth < 1");

// export const QUEUEING = (thread, ctx) => {
//   // if (thread.queue) thread.queue.close();
//
//   const config = object.merge({ depth: 1 }, thread.trait.QUEUEING);
//   // const $pending = computed(thread.$buffers, (buffers) => buffers.filter((b) => !b.status || b.status === "PENDING"),);
//   thread.queue = new Stall(thread.$buffers, thread.$buffer);
//
//   // const persist = (buffer) => thread.daemon.entities.em.persist(buffer);
//   // const enlist = (buffer) => {buffer.on.mount(() => {buffer.status = "ACTIVE"; persist(buffer);}); buffer.on.release(() => {buffer.status = "DONE"; persist(buffer); thread.queue.next();});};
//
//   thread.queue.withPull(async (queue) => {
//     const span = new Span("pull").to(telemetry).begin();
//     span.track.transition().depart(thread.queue.$status.get());
//     span.track.subject().target("buffer", thread.id);
//
//     try {
//       const blacklist = new Blacklist().absorb(thread.$buffers.get());
//       const result = await thread.pull({ blacklist });
//
//       const buffers = await Promise.all(
//         result.buffers.map((pojo) => thread.daemon.entities.buffer.merge(pojo)),
//       );
//       // for (const buffer of buffers.filter(Boolean)) enlist(buffer);
//
//       const condition = buffers.length ? "NOMINAL" : "EXHAUSTED";
//       span.track.transition().arrive(condition);
//       span.drain();
//
//       return { buffers, condition };
//     } catch (error) {
//       span.track.fault().raise(error.message, error.code ?? "PULL_ERROR");
//       span.track.transition().arrive("ERROR");
//       span.drain();
//       throw error;
//     }
//   }, config.depth);
//
//   thread.queue.$status.subscribe((status) => {
//     if (status === "ERROR") {
//       const error = thread.queue.$error.get();
//       const span = new Span("stall.error").to(telemetry).begin();
//       span.track.fault().raise(error?.message ?? "unknown", error?.code ?? "STALL_ERROR");
//       span.track.subject().target("thread", thread.id);
//       span.drain();
//     }
//   });
//   // return () => {};
// };
