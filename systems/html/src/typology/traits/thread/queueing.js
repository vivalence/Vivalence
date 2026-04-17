import { computed } from "nanostores";
import { object, Span, Blacklist } from "@vivalence/typology";
import { Stall } from "../../prototypes/stall.js";
import { telemetry } from "$telemetry";

export const QUEUEING = (thread, ctx) => {
  if (thread.queue) thread.queue.close();
  const config = object.merge({ depth: 1 }, thread.trait.QUEUEING);
  const $pending = computed(thread.$buffers, (buffers) =>
    buffers.filter((b) => !b.status || b.status === "PENDING"),
  );
  thread.queue = new Stall($pending, thread.$buffer);

  return () => {
    thread.queue.$active.subscribe((buffer) => {
      if (!buffer) return;
      buffer.status = "ACTIVE";
      thread.daemon.entities.em.persist(buffer);
    });

    thread.queue.withPull(async (queue) => {
      const span = new Span("pull").to(telemetry).begin();
      span.track.transition().depart(thread.queue.$status.get());
      span.track.subject().target("buffer", thread.id);

      try {
        const blacklist = new Blacklist().absorb(thread.$buffers?.get?.() ?? []);
        const result = await thread.pull({ blacklist });
        thread.queue.suspend();
        const buffers = await Promise.all(
          (result.buffers ?? []).map((pojo) => thread.daemon.entities.buffer.merge(pojo)),
        );
        for (const buffer of buffers.filter(Boolean)) {
          buffer.context = { buffer, terminal: thread };
          buffer.on.release(() => {
            thread.daemon.entities.em.persist(buffer);
            thread.queue.next();
          });
        }
        thread.queue.resume();

        const condition = buffers.length ? "NOMINAL" : "EXHAUSTED";
        span.track.transition().arrive(condition);
        span.drain();

        return { buffers, condition };
      } catch (error) {
        span.track.fault().raise(error.message, error.code ?? "PULL_ERROR");
        span.track.transition().arrive("ERROR");
        span.drain();
        throw error;
      }
    }, config.depth);

    thread.queue.$status.subscribe((status) => {
      if (status === "ERROR") {
        const error = thread.queue.$error.get();
        const span = new Span("stall.error").to(telemetry).begin();
        span.track.fault().raise(error?.message ?? "unknown", error?.code ?? "STALL_ERROR");
        span.track.subject().target("thread", thread.id);
        span.drain();
      }
    });
  };
};
