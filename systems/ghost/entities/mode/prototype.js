import { atom } from "nanostores";
import { Entity, RemoteRepository, Span, Status, Vector } from "@vivalence/typology";

export class Mode extends Entity {
  type = null;
  slug = null;
  name = null;
  description = null;
  version = null;
  traits = [];
  daemon = null;
  reference = null;
  module = null;
  status = new Status();
  stdout = new Span("mode");
  repl = new Vector();
  metadata = {};
  runtime = null;
  connection = null;
  call = null;
  harness = null;
  $application = atom(null);

  constructor(citizen = null) {
    super();
    if (citizen !== null) Object.assign(this, citizen.manifest, { module: citizen, reference: citizen.reference });
  }

  get manifest() {
    return { type: this.type, slug: this.slug, name: this.name, description: this.description, version: this.version, traits: this.traits };
  }
  get application() {
    return this.$application.get();
  }
  set application(value) {
    this.$application.set(value);
  }

  implements(trait) {
    return this.traits.includes(trait.toUpperCase());
  }

  toJSON() {
    const { $application, module, metadata, ...base } = super.toJSON();
    return { ...base, application: this.application };
  }
}

export const repository = (dataspace) => new RemoteRepository(Mode).connect(dataspace.runtime.connection.branch(`${dataspace.runtime.reference.absolute}/entities/mode`));

export const hydration = new Vector().use(async (ctx, next) => {
  await next();
  ctx.entity.runtime = ctx.runtime;
  ctx.entity.reference = (ctx.entity.daemon === null ? ctx.runtime : ctx.entity.daemon).reference.branch(`/mode/${ctx.entity.type}/${ctx.entity.slug}`);
  ctx.entity.connection = (ctx.entity.daemon === null ? ctx.runtime : ctx.entity.daemon).aperture.branch(`/mode/${ctx.entity.type}/${ctx.entity.slug}`);
});
