// paladin creates cake. cakes are put on dies and processed into a runtime or service.
// cake bundles information. its typological gestalt. doesnt do anything on its own. part of a recipie.
// {manifest, kernel,  modes, services, mount, slug, docs}

export class Cake {
  manifest = {};
  mount = null; // mountpath
  source = null; // filepath
  // serve = null;
  constructor(cake = {}) {
    if (cake.manifest?.type === "runtime") {
      this.lighthouse = null;
      this.datamap = null;
      this.kernel = [];
      this.modes = [];
      this.services = [];
    } else if (cake.manifest?.type === "service") {
      this.client = null; // string:slug - runtime pointer.
      this.service = null; // string:slug - remote pointer. convenience.
      this.remote = null; // cake - identifies client -> bake provider.
    }
    Object.assign(this, cake);
    if (!this.slug) this.slug = this.manifest.slug;

    // url: new Url(`/runtime/${slug}`, new URL("http://localhost")),
    // path: new Path(`/runtime/${slug}`),
  }
}

// Common properties manifest = {}; mount = null; source = null; path = null; url = null;
// Runtime-specific properties lighthouse = null; datamap = null; kernel = []; modes = []; services = []; statics = {}; docs = {};
// Service-specific properties runtime = null; remote = null; secret = {}; module = null;
