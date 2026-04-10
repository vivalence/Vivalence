export class Terminal {
  id = null;
  slug = null;
  daemon = null;
  thread = null;

  constructor(data) {
    Object.assign(this, data);
  }

  // TODO: derive serialized fields from schema — manual field lists lose data silently
  toJSON() {
    return { id: this.id, slug: this.slug, daemon: this.daemon, thread: this.thread };
  }
}
