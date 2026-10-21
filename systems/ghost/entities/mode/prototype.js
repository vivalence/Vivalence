import { Entity, Span, Status, Vector } from "@vivalence/typology";

export class Mode extends Entity {
  type = null;
  slug = null;
  name = null;
  description = null;
  version = null;
  traits = [];
  daemon = null;
  host = null;
  reference = null;
  module = null;
  status = new Status();
  stdout = new Span("mode");
  repl = new Vector();
  keymap = new Vector();
  metadata = {};
  runtime = null;
  connection = null;
  call = null;
  harness = null;

  constructor(citizen = null) {
    super();
    if (citizen !== null) Object.assign(this, citizen.manifest, { module: citizen, reference: citizen.reference });
  }

  get manifest() {
    return { type: this.type, slug: this.slug, name: this.name, description: this.description, version: this.version, traits: this.traits };
  }

  implements(trait) {
    return this.traits.includes(trait.toUpperCase());
  }

  toJSON() {
    const { module, metadata, ...base } = super.toJSON();
    return base;
  }
}
