export class Entity {
  constructor(entity) {
    Object.assign(this, entity);
  }

  toJSON() {
    const out = {};
    for (const [k, v] of Object.entries(this)) {
      if (typeof v === "function") continue;
      if (v && typeof v === "object" && "get" in v) {
        out[k] = v.get();
      } else if (v instanceof Set) {
        out[k] = [...v].map((e) => e?.id ?? e?.slug ?? e);
      } else if (v && typeof v.toJSON === "function") {
        out[k] = v.toJSON();
      } else {
        out[k] = v;
      }
    }
    return out;
  }
}
