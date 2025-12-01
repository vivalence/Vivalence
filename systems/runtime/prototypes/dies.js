import { Status } from "@vivalence/typology";

export class Die {
  mask = null;
  manifest = {};
  good = null;
  status = new Status("<uninitialized>", this);
  connection = null;
  constructor(die = {}) {
    Object.assign(this, die);
    if (!this.slug) this.manifest.slug = this.mask?.slug;
  }
  get slug() {
    return this.manifest.slug;
  }
  get type() {
    return this.manifest.type;
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
  constructor(die) {
    super(die);
  }
}

export class ProcessDie extends Die {
  // register = null;
  // type = null;
  constructor(die) {
    super(die);
    if (!this.type) this.manifest.slug = this.mask?.slug;
    this.manifest = Object.assign({}, this.register?.manifest, this.manifest);
    // if (!this.slug) this.manifest.slug = this.register?.manifest.slug; if (!this.type) this.manifest.type = this.register?.manifest.type;
  }
  // get manifest() {return new Proxy({maybe?????});}
}
