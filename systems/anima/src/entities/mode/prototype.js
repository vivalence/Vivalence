import { Status } from "@vivalence/typology";
import { atom } from "nanostores";
import { Entity } from "../../prototypes/entity.js";

export class Mode extends Entity {
  status = new Status();
  metadata = {};

  $application = atom(null);

  get application() {
    return this.$application.get();
  }

  set application(value) {
    this.$application.set(value ?? null);
  }

  implements(trait) {
    return this.traits?.includes(trait.toUpperCase());
  }

  toJSON() {
    const { $application, ...base } = super.toJSON();
    return { ...base, application: this.application };
  }
}
