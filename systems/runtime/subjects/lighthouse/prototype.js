export class Lighthouse {
  manifest;
  trait;
  secret;
  users = null;
  aperture = null;
  authenticate = null;
  bind = null;

  constructor(record) {
    this.manifest = { type: "lighthouse", slug: "lighthouse", traits: record.traits };
    this.trait = record.trait;
    this.secret = record.secrets.jwt;
  }

  implements(name) {
    return this.manifest.traits.includes(name);
  }
}
