import { dirname, isAbsolute } from "@std/path";
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

  async supply() {
    const locations = await this.paladin.ledger.registry.read()
      ?? await this.paladin.ledger.registry.seed(this.paladin.scope.repository.branch("registry"));
    for (const location of locations) await this.mount(this.paladin.ledger.registry.resolve(location));
    return this;
  }

  // tap = materialize + record. Mount is runtime's job — supply() folds the record at boot.
  async tap(source, target) {
    let reference = source;
    if (this.paladin.clone.remote(source)) {
      if (!target && !this.paladin.scope.registry)
        throw new Error(`[VIP] tap ${source}: no package store — a remote tap clones into scope.registry (set VIVA_REGISTRY_MOUNT)`);
      const slug = source.split("/").at(-1).replace(/\.git$/, "");
      const destination = target ? new Path(target) : this.paladin.scope.registry.branch(slug);
      await this.paladin.clone(source, destination);
      reference = target ? destination.absolute : slug;
    } else if (target) {
      throw new Error(`[VIP] tap ${source}: target only applies to a remote source — a local tap records the reference in place`);
    }
    const root = this.paladin.ledger.registry.resolve(reference);
    const stat = await Deno.stat(root.absolute).catch(() => null);
    if (!stat)
      throw new Error(`[VIP] tap ${source}: nothing at ${root.absolute} — pass a path, a remote, or a reference already in the store`);
    const home = stat.isFile ? new Path(dirname(root.absolute)) : root;
    const declarations = await this.paladin.find.type(home, "package");
    if (!declarations.length)
      throw new Error(`[VIP] tap ${source}: no package declaration (manifest.type "package") under ${home.absolute}`);
    if (declarations.length === 1)
      reference = this.paladin.ledger.registry.reference(dirname(declarations[0].source.absolute));
    await this.paladin.ledger.registry.add(reference);
    return reference;
  }

  // untap = record removal ONLY — the store keeps the working copy; next supply() simply omits it.
  async untap(reference) {
    return await this.paladin.ledger.registry.remove(reference);
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

  async accioOne(query) {
    if (is.string(query) && isAbsolute(query)) {
      const module = await this.paladin.read.viva(query);
      return { ...module, mount: new Path(query) };
    }
    if (is.object(query) && query.manifest && !query.module) return query;
    if (is.object(query) && is.string(query.module)) {
      return { service: await this.accio(query.module), mask: query };
    }
    return await this.accio(query);
  }

  async accioMany(many) {
    return await Promise.all(many.map((query) => this.accioOne(query)));
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
