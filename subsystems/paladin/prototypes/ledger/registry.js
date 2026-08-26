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

  async seed(scope) {
    const declarations = await this.paladin.find.type(scope, "package");
    const locations = [...new Set(declarations.map((module) => dirname(module.source.absolute)))];
    await this.write(locations);
    return locations;
  }
}
