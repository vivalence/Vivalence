import { Lock } from "./lock.js";
import { Log } from "./log.js";
import { Instances } from "./instances.js";
import { Registry } from "./registry.js";
import { Die } from "./die.js";

export class Ledger {
  constructor(paladin) {
    this.paladin = paladin;
  }

  get instances() {
    return new Instances(this.paladin, this.paladin.scope.ledger.branch("instances.json"));
  }

  get registry() {
    return new Registry(this.paladin, this.paladin.scope.ledger.branch("registry.json"));
  }

  lock(instance) {
    return new Lock(this.paladin, this.paladin.scope.ledger.branch(`/locks/${instance}.lock`));
  }

  log(instance) {
    return new Log(this.paladin, instance);
  }

  async boot(specs, { instance = null, attachment = "inherit" } = {}) {
    this.paladin.publish();
    const die = new Die({ ledger: this, specs, instance, attachment });
    await die.populate();
    await die.resolve();
    return die;
  }
}
