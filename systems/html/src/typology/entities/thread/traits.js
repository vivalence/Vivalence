import { computed } from "nanostores";
import { is, Span, Blacklist } from "@vivalence/typology";
import { Stall } from "../../prototypes/stall.js";
import { telemetry } from "$telemetry";

export const traits = {
  LABELED(thread) {
    if (!is.labeled(thread.label) && is.labeled(thread.trait.LABELED)) {
      thread.label = thread.trait.LABELED;
    }
    if (!is.labeled(thread.label) && thread.intent) {
      thread.label = {
        name: thread.intent.name ?? thread.intent.slug,
        description: thread.intent.description ?? thread.mode?.name ?? null,
      };
    }
    if (!is.labeled(thread.label) && thread.mode) {
      thread.label = {
        name: thread.mode.name ?? thread.mode.slug,
        description: thread.mode.description ?? null,
      };
    }
  },
  MASKED(thread) {
    const config = thread.trait.MASKED ?? {};
    thread.mask = { thread: thread.id, ...config };
  },

  AIMED(thread) {
    const config = thread.trait.AIMED;
    return () => {
      thread.pull = thread.mode.connection.aim(config.mount, thread.mask);
    };
  },

  QUEUEING(thread) {
    if (thread.queue) thread.queue.close();
    const config = thread.trait.QUEUEING ?? {};
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
        // console.log("withPull()", queue);
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
              buffer.status = "DONE";
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
      }, config.depth ?? 1);

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
  },
};
