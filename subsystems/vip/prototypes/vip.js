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
    return await this.pensieve.revelio(cast.lookup(query));
  }

  async accioMany(many) {
    return await Promise.all(many.map((query) => this.accio(query)));
  }

  async accioMap(many) {
    const accioedModules = await Promise.all(
      Object.entries(many).map(async ([slug, query]) => {
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
    return Object.fromEntries(accioedModules.filter((entry) => entry !== null));
  }
}
