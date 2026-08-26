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
