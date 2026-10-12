import { atom, computed } from "nanostores";
import { Entity, RemoteRepository, Vector } from "@vivalence/typology";

export class Thread extends Entity {
  id = null;
  user = null;
  mode = null;
  phase = "manual";
  traits = [];
  trait = {};
  controller = null;
  $activity = atom(null);

  get activity() {
    return this.$activity.get();
  }

  toJSON() {
    const kept = Object.entries(super.toJSON()).filter(([key]) => !key.startsWith("$") && key !== "controller");
    const mode = this.mode === null || typeof this.mode === "string" ? this.mode : this.mode.id;
    return { ...Object.fromEntries(kept), mode };
  }
}

export const repository = (dataspace) => new RemoteRepository(Thread).connect(dataspace.runtime.connection.branch("/userspace/entities/thread"));

export const hydration = new Vector().use(async (ctx, next) => {
  await next();
  ctx.entity.$buffers = computed(ctx.runtime.entities.buffer.$entities, (buffers) => buffers.filter((buffer) => buffer.thread === ctx.entity));
  ctx.entity.$turns = computed(ctx.runtime.entities.turn.$entities, (turns) => turns.filter((turn) => turn.thread === ctx.entity).sort((first, second) => new Date(first.createdAt) - new Date(second.createdAt)));
});
