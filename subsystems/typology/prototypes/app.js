import { Path } from "@vivalence/typology";
import { Bundle } from "./bundle.js";

export class App {
  mask = {};
  mount = null; // Path — the view entry ("buffer/Flashcard.svelte")
  url = null;
  bundle = new Bundle();

  constructor(mount, mask = {}) {
    if (mount instanceof App) return mount;
    if (typeof mount === "object" && !(mount instanceof App)) {
      mask = mount.mask ?? {};
      mount = mount.mount;
    }
    this.mask = mask;
    this.mount = new Path(mount);
    this.bundle.entry = this.mount; // shared Path — the bundle compiles the app's mount
  }

  cast(desc = {}) {
    if (!desc.data) desc.data = {};
    this.mask.cast(desc);
    return desc.data;
  }

  fill(desc = {}) {
    if (!desc.data) desc.data = {};
    this.mask.fill(desc);
    return desc.data;
  }

  withUrl(url) {
    this.url = url;
    this.bundle.url = url;
    return this;
  }

  withBundler(bundler) {
    this.bundle.withBundler(bundler);
    return this;
  }
}
