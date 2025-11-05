import { Status } from "@vivalence/typology";

export class Die {
  slug = null;
  cake = null;

  good = null;
  connection = null;
  status = new Status("<uninitialized>");

  constructor(die = {}) {
    Object.assign(this, die);
    if (!this.slug) this.slug = this.cake?.slug;
  }
}

export class DaemonDie extends Die {
  register = {
    authority: null,
    datamap: null,
    kernel: [],
    modes: [],
    services: [],
  };
  variant = {
    kernel: {},
    modes: [],
    traits: {},
    entities: [],
    services: {},
  };
}

export class ServiceDie extends Die {}
