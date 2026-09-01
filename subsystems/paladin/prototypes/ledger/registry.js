import { dirname, isAbsolute, relative } from "@std/path";
import { Path } from "@vivalence/typology";

const normalize = (reference) =>
  isAbsolute(reference) ? reference : reference.replace(/^\.\//, "");

export class Registry {
  constructor(paladin, path) {
    this.paladin = paladin;
    this.path = path;
  }

  read() {
    return this.paladin.read.json(this.path, null);
  }

  write(locations) {
    return this.paladin.state.json(this.path, locations);
  }

  async list() {
    return (await this.read()) ?? [];
  }

  async has(reference) {
    return (await this.list()).includes(normalize(reference));
  }

  async add(reference) {
    reference = normalize(reference);
    const references = await this.list();
    if (references.includes(reference)) return references;
    const next = [...references, reference];
    await this.write(next);
    return next;
  }

  async remove(reference) {
    reference = normalize(reference);
    const next = (await this.list()).filter((held) => held !== reference);
    await this.write(next);
    return next;
  }

  reference(absolute) {
    const store = this.paladin.scope.registry?.absolute;
    if (!store) return absolute;
    const segment = relative(store, absolute);
    return segment && !segment.startsWith("..") && !isAbsolute(segment) ? segment : absolute;
  }

  resolve(reference) {
    reference = normalize(reference);
    if (isAbsolute(reference)) return new Path(reference);
    if (!this.paladin.scope.registry)
      throw new Error(`[PALADIN] registry resolve ${reference}: no package store — a relative reference resolves against scope.registry (set VIVA_REGISTRY_MOUNT)`);
    return this.paladin.scope.registry.branch(reference);
  }

  async discover(scope) {
    if (!scope || !(await Deno.stat(scope.absolute).catch(() => null))) return [];
    const declarations = await this.paladin.find.type(scope, "package");
    return [...new Set(declarations.map((module) => dirname(module.source.absolute)))];
  }

  async seed(scope) {
    const locations = await this.discover(scope);
    await this.write(locations);
    return locations;
  }

  async reconcile(checkout, commons) {
    const held = await this.read();
    if (!held) return null;
    const present = async (reference) => Boolean(await Deno.stat(this.resolve(reference).absolute).catch(() => null));
    const dead = [];
    for (const reference of held) if (!(await present(reference))) dead.push(reference);
    if (!dead.length) return { locations: held, stale: [] };
    const inside = (reference) => Boolean(checkout) && this.resolve(reference).absolute.startsWith(`${checkout.absolute}/`);
    const stale = dead.filter((reference) => !inside(reference));
    const kept = held.filter((reference) => !dead.includes(reference) || stale.includes(reference));
    const healed = dead.some(inside) ? (await this.discover(commons)).filter((location) => !kept.includes(location)) : [];
    const record = [...kept, ...healed];
    await this.write(record);
    return { locations: record.filter((reference) => !stale.includes(reference)), stale };
  }
}
