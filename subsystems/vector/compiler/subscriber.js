import * as parser from "../parser/index.js";

export class Subscriber {
  constructor(subscriptions, emitter) {
    this.subscriptions = subscriptions;
    this.emitter = emitter;
  }

  emit(event, args) {
    const entityName = args.entity?.constructor?.name
      .toLowerCase()
      .replace("entity", "");

    const signal = [
      ...parser.sig.signal(entityName),
      ...parser.sig.signal(event),
    ];

    this.emitter(signal, {
      entity: args.entity,
      change: args.changeSet,
      em: args.em,
    });
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
