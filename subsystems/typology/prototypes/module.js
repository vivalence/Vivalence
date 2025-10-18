import { Path } from "@vivalence/typology";
import { shards } from "@vivalence/vector";
import { Aperture } from "@vivalence/vector/aperture";

// todo: rename to mode
// todo: move to daemon
export class Module {
  // status, connection
  // entity: <em.Module>
  // type, slug, traits
  // url
  // call

  constructor(register) {
    this.type = register.manifest.type;
    this.slug = register.manifest.slug;
    this.traits = register.manifest.traits || [];
    this.register = register;
    this.aperture = new Aperture()
      .use(shards.context.attach("module", this))
      .open("/status", async () => ({ code: "SUCCESS" }))
      .open("/manifest", async () => ({ ...this.manifest }));
  }
  implements(trait) {
    return this.traits.includes(trait);
  }
  get manifest() {
    return { ...this.register.manifest };
  }
}
