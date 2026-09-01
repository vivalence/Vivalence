import { isAbsolute } from "@std/path";

export const NOTHING =
  "instance: nothing selected — viva instances/use <slug|path>, --instance=<slug|path>, or VIVA_INSTANCE_MOUNT=<path>";

const local = (reference) => reference.includes("/") || reference.startsWith(".");

export class Instances {
  constructor(paladin, path) {
    this.paladin = paladin;
    this.path = path;
  }
  async read(slug) {
    return (await this.paladin.read.json(this.path, {}))[slug] ?? null;
  }
  // where a slug LIVES. a *_MOUNT env var is always a path, never a slug — a caller that
  // accepts a slug from an operator resolves it through here before storing anything.
  shelf(slug) {
    return this.paladin.scope.ledger.branch(`instances/${slug}`);
  }

  async list() {
    const all = await this.paladin.read.json(this.path, {});
    return Object.entries(all).map(([slug, held]) => ({ slug, ...held }));
  }
  async write(slug, partial) {
    const all = await this.paladin.read.json(this.path, {});
    const now = new Date().toISOString();
    all[slug] = { ...(all[slug] ?? { createdAt: now }), ...partial, updatedAt: now };
    await this.paladin.state.json(this.path, all);
  }
  async lookup(mount) {
    const all = await this.paladin.read.json(this.path, {});
    const hit = Object.entries(all).find(([, held]) => held.mount === mount);
    return hit ? { slug: hit[0], ...hit[1] } : null;
  }
  async resolve(reference) {
    if (!reference) throw new Error(NOTHING);
    if (local(reference)) {
      const token = isAbsolute(reference) || reference.startsWith(".") ? reference : `./${reference}`;
      const mount = this.paladin.source(token).absolute;
      return (await this.lookup(mount)) ?? { slug: null, mount };
    }
    const held = await this.read(reference);
    if (!held) throw new Error(`instance: no record '${reference}' — viva instances/list`);
    return { slug: reference, ...held };
  }
  async rename(prior, next) {
    const all = await this.paladin.read.json(this.path, {});
    if (!all[prior]) throw new Error(`instances: no record '${prior}'`);
    if (all[next]) throw new Error(`instances: '${next}' already held`);
    all[next] = { ...all[prior], updatedAt: new Date().toISOString() };
    delete all[prior];
    await this.paladin.state.json(this.path, all);
  }
  async remove(slug) {
    const all = await this.paladin.read.json(this.path, {});
    delete all[slug];
    await this.paladin.state.json(this.path, all);
  }
}
