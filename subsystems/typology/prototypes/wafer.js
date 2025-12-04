import { Status } from "@vivalence/typology";

export class Wafer {
  mask = null;
  good = null;
  manifest = {};
  good = null;
  status = new Status("<uninitialized>", this);

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

  async populate() {}
  async resolve() {}
  async integrate() {}
  async disintegrate() {}
}

// export class Die {
//   mask = null;
//   manifest = {};
//   good = null;
//   status = new Status("<uninitialized>", this);
//   connection = null;
//   constructor(die = {}) {
//     Object.assign(this, die);
//     if (!this.slug) this.manifest.slug = this.mask?.slug;
//   }
//   get slug() {
//     return this.manifest.slug;
//   }
//   get type() {
//     return this.manifest.type;
//   }
// }

// export class DaemonDie extends Die {
//   register = {
//     authority: null,
//     datamap: null,
//     kernel: [],
//     modes: [],
//     services: [],
//   };
//   variant = {
//     kernel: {},
//     modes: [],
//     traits: {},
//     entities: [],
//     services: {},
//   };
//   constructor(die) {
//     super(die);
//   }
// }
// import { Status } from "@vivalence/typology";

// // runtime die
// export class Die {
//   // type = null;
//   slug = null;
//   cake = null;

//   register = {
//     lighthouse: null,
//     datamap: null,
//     kernel: [],
//     modes: [],
//     services: [],
//   };

//   variant = {
//     kernel: {},
//     modes: [],
//     traits: {},
//     entities: [],
//     services: {},
//   };

//   good = null;
//   connection = null;
//   status = new Status("<uninitialized>");

//   constructor(die = {}) {
//     Object.assign(this, die);
//     if (!this.slug) this.slug = this.cake?.slug;
//   }
// }

// // export class Die {
// //   // inside daemon
// //   // runtime die
// //   // daemon declares them things they die. love it.
// //   // const die = {
// //   //   slug,
// //   //   cake,
// //   //   register: {
// //   //     kernel: {},
// //   //     modes: {},
// //   //     services: {},
// //   //   },
// //   //   maps: {
// //   //     orm: {},
// //   //     entity: {},
// //   //     mode: {},
// //   //     trait: {},
// //   //     service: {},
// //   //   },
// //   // };
// // }
