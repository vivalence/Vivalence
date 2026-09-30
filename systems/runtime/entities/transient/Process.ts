import { types } from "@mikro-orm/core";
import { control, steer, v } from "@vivalence/typology";
import { VirtualEntity, VirtualRepository, VirtualSchema } from "@vivalence/typology/entities";

export class ProcessEntity extends VirtualEntity {
  type = "";
  slug = "";
  mask = null;
  controller = null;
  execution = null;

  get manifest() {
    return this.mask.manifest;
  }

  get reference() {
    return this.mask.reference;
  }

  get $status() {
    return this.controller?.status.$transient ?? null;
  }

  get status() {
    return this.controller?.status.reflection.code ?? null;
  }

  async execute(execution) {
    if (this.execution) throw new Error(`${this.type} ${this.slug} is executed`);
    this.execution = steer.dispatch.execute(execution, { controller: this.controller, mask: this.mask, [this.type]: this });
    await control.controlled(this.controller);
    return this;
  }
}

export class ProcessRepository extends VirtualRepository {
  async create(data) {
    if (await this.findOne({ slug: data.slug })) throw new Error(`${data.slug} is held`);
    return super.create(data);
  }

  async kill(where, signal) {
    const { signals, transitions } = v.primitives.controller.MACHINE;
    const processes = await this.find(where);
    await Promise.all(processes.filter((process) => transitions[signals[signal]][process.status]).map((process) => process.controller.kill(signal)));
    if (["stop", "abort"].includes(signals[signal])) await Promise.all(processes.map((process) => process.execution));
  }

  census() {
    return Object.fromEntries(this.$entities.get().map((process) => [process.slug, process.status]));
  }

  async removeOne(where) {
    const process = await this.findOneOrFail(where);
    if (!v.primitives.controller.MACHINE.states[process.status].settled) await process.controller.kill("SIGKILL");
    return super.removeOne({ id: process.id });
  }
}

export const ProcessSchema = new VirtualSchema({
  class: ProcessEntity,
  repository: () => ProcessRepository,
  properties: {
    type: { type: types.string },
    slug: { type: types.string },
    mask: { type: "any", persist: false, hidden: true, nullable: true },
    controller: { type: "any", persist: false, hidden: true, nullable: true },
    execution: { type: "any", persist: false, hidden: true, nullable: true },
    status: { type: types.string, persist: false, getter: true, nullable: true },
  },
});
