// paladin creates mask. masks are put on dies and processed into a runtime or service.
// mask bundles information. its typological gestalt. doesnt do anything on its own. part of a recipie.
// {manifest, kernel, services, mount, slug, docs}

export class Mask {
  manifest = {};
  mount = null; // mountpath
  source = null; // filepath
  // serve = null;
  constructor(mask = {}) {
    if (mask.manifest?.type === "runtime") {
      this.lighthouse = null;
      this.datamap = null;
      this.kernel = [];
      this.services = [];
    } else if (mask.manifest?.type === "service") {
      this.client = null; // string:slug - runtime pointer.
      this.service = null; // string:slug - remote pointer. convenience.
      this.remote = null; // mask - identifies client -> bake provider.
    }
    Object.assign(this, mask);
    if (!this.slug) this.slug = this.manifest.slug;

    // url: new Url(`/runtime/${slug}`, new URL("http://localhost")), path: new Path(`/runtime/${slug}`),
    if (this.datamap && !this.datamap.mount) this.datamap.mount = this.mount;
  }
}

// Common properties manifest = {}; mount = null; source = null; path = null; url = null;
// Runtime-specific properties lighthouse = null; datamap = null; kernel = []; services = []; statics = {}; docs = {};
// Service-specific properties runtime = null; remote = null; secret = {}; module = null;
