import { Signal } from "@vivalence/typology";

export class Subscriber {
  constructor(subscriptions, emitter) {
    this.subscriptions = subscriptions;
    this.emitter = emitter;
  }

  emit(event, args) {
    const entityName = args.entity?.constructor?.name
      .toLowerCase()
      .replace("entity", "");

    const signal = new Signal([entityName, event]);

    try {
      this.emitter(signal, {
        entity: args.entity,
        change: args.changeSet,
        em: args.em,
      });
    } catch (err) {
      if (err.code === "NOT_FOUND") return undefined;
      console.log("[TWITCH ERROR] @vector/shape/subscriber");
      console.trace(err);
      throw err;
    }
  }
  getSubscribedEntities() {
    return this.subscriptions;
  }

  onInit(args) {
    return this.emit("init", args);
  }

  onLoad(args) {
    return this.emit("load", args);
  }

  afterCreate(args) {
    return this.emit("create/after", args);
  }

  beforeCreate(args) {
    return this.emit("create/before", args);
  }

  afterUpdate(args) {
    return this.emit("update/after", args);
  }

  beforeUpdate(args) {
    return this.emit("update/before", args);
  }
}
