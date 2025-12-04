import { Wafer } from "@vivalence/typology";

export class Die extends Wafer {
  constructor(die) {
    super(die);
    this.manifest = Object.assign({}, this.register?.manifest, this.manifest);
  }

  async integrate() {
    this.status.set("alive");
  }
}

// export class ProcessDie extends Die {
//   // register = null;
//   // type = null;
//   constructor(die) {
//     super(die);
//     if (!this.type) this.manifest.slug = this.mask?.slug;
//     this.manifest = Object.assign({}, this.register?.manifest, this.manifest);
//     // if (!this.slug) this.manifest.slug = this.register?.manifest.slug; if (!this.type) this.manifest.type = this.register?.manifest.type;
//   }
//   // get manifest() {return new Proxy({maybe?????});}
// }
