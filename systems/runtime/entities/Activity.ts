import { EntityRepositoryType, types, wrap } from "@mikro-orm/core";
import { Controller, Queue, Span, faulted, shape, steer, trace, v } from "@vivalence/typology";
import { VirtualEntity, VirtualRepository, VirtualSchema } from "@vivalence/typology/entities";
import { UserEntity, ModeEntity, ThreadEntity, BufferEntity, TurnEntity } from "./index.ts";

export enum ActivityTypeEnum {
  HALLUCINATION = "HALLUCINATION",
}

const RING = 12;

export class ActivityRepository extends VirtualRepository<ActivityEntity> {
  #taps = new Map<string, () => void>();

  #bound(): string | undefined {
    const context = this.em.getContext(false);
    if (context.global && !context.config.get("allowGlobalContext")) return undefined;
    return context.getFilterParams("user")?.user;
  }
  #scoped(where: object = {}): object {
    const bound = this.#bound();
    return bound
      ? { $and: [where, { $or: [{ user: bound }, { user: { $exists: false } }] }] }
      : where;
  }
  find(where?: object) {
    return super.find(this.#scoped(where));
  }
  findOne(where?: object) {
    return super.findOne(this.#scoped(where));
  }
  findOneOrFail(where: object) {
    return super.findOneOrFail(this.#scoped(where));
  }
  findAndCount(where?: object) {
    return super.findAndCount(this.#scoped(where));
  }
  count(where?: object) {
    return super.count(this.#scoped(where));
  }
  update(where: object, data: object) {
    return super.update(this.#scoped(where), data);
  }
  remove(where?: object) {
    return super.remove(this.#scoped(where));
  }

  async control(
    data: object,
    controller = new Controller({
      stdout: new Span("hallucination"),
    }),
  ): Promise<ActivityEntity> {
    const activity = await this.create(data);
    activity.controller = controller;
    controller.stdout.pipe.tap((record) =>
      console.log(`[hal ${trace.pathname(record.path)}] ${record.track}`, record.data ?? ""),
    );
    controller.stdout.log({ activity: activity.id, ...data });
    const steps: unknown[] = [...activity.steps];
    let writing: Promise<unknown> = Promise.resolve();
    const untap = controller.stdout.pipe.tap((record) => {
      const { code, error } = controller.status.reflection;
      steps.push(record);
      if (steps.length > RING) steps.splice(0, steps.length - RING);
      const ring = [...steps];
      writing = writing.then(() =>
        this.updateOne({ id: activity.id }, { status: code, error: error ? faulted(error) : null, steps: ring }),
      );
    });
    this.#taps.set(activity.id, untap);
    controller.settled.then(() => writing.then(() => this.remove({ id: activity.id })));
    return activity;
  }

  async removeOne(where: object): Promise<ActivityEntity> {
    const activity = await this.findOneOrFail(where);
    this.#taps.get(activity.id)?.();
    this.#taps.delete(activity.id);
    const code = activity.controller?.status.reflection.code;
    if (code && !v.primitives.controller.MACHINE.states[code].settled)
      activity.controller.abort.abort("activity removed");
    return super.removeOne({ id: activity.id });
  }
}

export class ActivityEntity extends VirtualEntity {
  [EntityRepositoryType]?: ActivityRepository;
  #controller;
  user;
  mode;
  thread;
  buffer;
  turn;
  type = ActivityTypeEnum.HALLUCINATION;
  status = "IDLE";
  error = null;
  steps = [];

  set controller(controller) {
    if (this.#controller) throw new Error("an activity is controlled once");
    this.#controller = controller;
  }
  get controller() {
    return this.#controller;
  }
  get stdin() {
    return shape.object(this.#controller.stdin, steer.strategy.echo);
  }

  stdout(signal?: AbortSignal) {
    const { stdout, status } = this.#controller;
    const { states } = v.primitives.controller.MACHINE;
    return (async function* () {
      if (states[status.reflection.code].settled) return yield* stdout.history;
      const live = new Queue();
      const untap = stdout.pipe.tap(live);
      try {
        yield* [...stdout.history];
        for await (const record of live.drain(signal)) {
          yield record;
          if (record.track === "status" && trace.key(record.path) === trace.key(stdout.absolute) && states[record.data.code].settled) return;
        }
      } finally {
        untap();
      }
    })();
  }
  toJSON() {
    const plain = wrap(this).toObject();
    for (const relation of ["user", "mode", "thread", "buffer", "turn"])
      plain[relation] = plain[relation]?.id ?? plain[relation] ?? null;
    return plain;
  }
}

export const ActivitySchema = new VirtualSchema({
  class: ActivityEntity,
  repository: () => ActivityRepository,
  properties: {
    user: { kind: "m:1", entity: () => UserEntity },
    mode: { kind: "m:1", entity: () => ModeEntity, nullable: true },
    thread: { kind: "m:1", entity: () => ThreadEntity, nullable: true },
    buffer: { kind: "m:1", entity: () => BufferEntity, nullable: true },
    turn: { kind: "m:1", entity: () => TurnEntity, nullable: true },
    type: { enum: true, items: () => ActivityTypeEnum },
    status: { enum: true, items: () => Object.keys(v.primitives.controller.MACHINE.states) },
    error: { type: types.json, nullable: true },
    steps: { type: types.json },
  },
});

export default {
  type: "activity",
  schema: ActivitySchema,
  entity: ActivityEntity,
  repository: ActivityRepository,
};
