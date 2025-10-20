export class Die {
  slug = null;
  cake = null;

  register = {
    gaia: null,
    database: null,
    kernel: [],
    modes: [],
    services: [],
  };

  variant = {
    datamap: {},
    kernel: {},
    traits: {},
    services: {},
    modes: [],
    entities: [],
  };

  good = null;
  connection = null;
  status = null;

  constructor(die = {}) {
    Object.assign(this, die);
    if (!this.slug) this.slug = this.cake?.slug;
  }
}

// export class Die {
//   // inside daemon
//   // runtime die
//   // daemon declares them things they die. love it.
//   // const die = {
//   //   slug,
//   //   cake,
//   //   path: new Path(`/runtime/${slug}`),
//   //   url: new Url(`/runtime/${slug}`, cake.statics.serve),
//   //   register: {
//   //     kernel: {},
//   //     modes: {},
//   //     services: {},
//   //   },
//   //   maps: {
//   //     orm: {},
//   //     entity: {},
//   //     mode: {},
//   //     trait: {},
//   //     service: {},
//   //   },
//   // };
// }
