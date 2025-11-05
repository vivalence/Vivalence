import { is, cast } from "@vivalence/typology";

import { Pensieve } from "./pensieve.js";

export class Vip {
  constructor(paladin) {
    this.paladin = paladin;
    this.pensieve = new Pensieve();
  }

  async mount(mount) {
    const paths = await this.paladin.find.viva(mount);
    for await (const path of paths) {
      const module = await this.paladin.read.viva(path);
      this.pensieve.register(module);
    }

    return this;
  }
  async accio(query) {
    const lookup = cast.lookup(query);
    const module = await this.pensieve.revelio(lookup);
    if (module) return module;
    throw new Error(`[VIP] Module 404: ${JSON.stringify({ lookup })}`);
  }

  async accioMany(many) {
    return await Promise.all(many.map((query) => this.accio(query)));
  }

  async accioMap(many) {
    const accioedModules = await Promise.all(
      Object.entries(many).map(async ([slug, query]) => {
        if (!query) return null;
        if (typeof query === "string") {
          return [slug, await this.accio(query)];
        } else if (typeof query.module === "string") {
          return [slug, await this.accio(query.module)];
        } else if (is.array(query)) {
          return [slug, await this.accioMany(query)];
        } else if (is.object(query)) {
          return [slug, await this.accioMap(query)];
        }
      }),
    );
    const filteredModule = Object.fromEntries(
      accioedModules.filter((entry) => entry !== null),
    );
    return filteredModule;
  }

  toJSON() {
    return { pensive: this.pensieve };
  }
}
