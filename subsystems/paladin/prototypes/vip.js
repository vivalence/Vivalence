import { is, cast, Path } from "@vivalence/typology";
import { Pensieve } from "./pensieve.js";

export class Vip {
  constructor(paladin) {
    this.paladin = paladin;
    this.pensieve = new Pensieve();
  }

  async mount(root) {
    const home = root.absolute ?? String(root);

    const paths = await this.paladin.find.viva(root);
    const modules = [];
    for (const path of paths) {
      const module = await this.paladin.read.viva(path);
      modules.push({ ...module, mount: new Path(path) });
    }

    const declaration = modules.find((module) => module.manifest?.type === "package");
    const owner = declaration?.manifest?.owner;
    if (modules.length && !owner)
      throw new Error(`[VIP] mount ${home}: package declares no owner — author manifest.owner (e.g. "@viva")`);

    for (const module of modules) {
      // stamp on a COPY — read.viva returns the live module namespace; don't mutate the import.
      // a module inherits the mount's stamp by default; its own manifest.owner LOCKS it.
      this.pensieve.register({
        ...module,
        manifest: { ...module.manifest, owner: module.manifest?.owner ?? owner },
      });
    }

    return this;
  }

  // testament/ledger/registry.json is the record of package locations. Absent →
  // seeded by discovery over scope.registry (self-priming, no init ceremony).
  // Locations resolve through paladin.source — absolute, ./cwd, {file,source}, bare segment.
  async supply() {
    await this.paladin.ledger.mount(); // fn.once — self-priming, no boot-order landmine
    const locations = await this.paladin.ledger.registry.read()
      ?? await this.paladin.ledger.registry.seed(this.paladin.scope.registry);
    for (const location of locations) await this.mount(this.paladin.source(location));
    return this;
  }

  async list(query = {}) {
    return this.pensieve.byType(query.type);
  }

  async accio(query) {
    const lookup = cast.lookup(query);
    if (!this.pensieve.has(lookup.owner))
      throw new Error(`[VIP] package ${lookup.owner} not supplied on this system`);
    const module = await this.pensieve.revelio(lookup);
    if (module) return module;
    throw new Error(`[VIP] Module 404: ${JSON.stringify({ lookup })}`);
  }

  async accioMany(many) {
    return await Promise.all(many.map(async (query) => {
      if (typeof query === "object" && query !== null && typeof query.module === "string") {
        return { service: await this.accio(query.module), mask: query };
      }
      return await this.accio(query);
    }));
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
