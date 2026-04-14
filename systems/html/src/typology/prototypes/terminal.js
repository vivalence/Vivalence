export class Terminal {
  id = null;
  slug = null;
  daemon = null;
  thread = null;

  constructor(data) {
    Object.assign(this, data);
  }

  toJSON() {
    return {
      id: this.id,
      slug: this.slug,
      daemon: this.daemon?.slug ?? this.daemon,
      thread: this.thread?.id ?? this.thread,
    };
  }
}
