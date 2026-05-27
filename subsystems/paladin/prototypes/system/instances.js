export class Instances {
  constructor(paladin, path) {
    this.paladin = paladin;
    this.path = path;
  }
  async read(slug) {
    return (await this.paladin.read.json(this.path, {}))[slug] ?? null;
  }
  async write(slug, partial) {
    const all = await this.paladin.read.json(this.path, {});
    const now = new Date().toISOString();
    all[slug] = { ...(all[slug] ?? { createdAt: now }), ...partial, updatedAt: now };
    await this.paladin.state.json(this.path, all);
  }
}
