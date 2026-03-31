export class Entity {
  constructor(entity) {
    Object.assign(this, entity);
  }

  toJSON() {
    const props = this.constructor.schema?.properties ?? {};
    const out = {};
    for (const [k, v] of Object.entries(this)) {
      if (typeof v === "function") continue;
      if (v instanceof Set || v instanceof Map) continue;

      const spec = props[k];
      if (spec) {
        if (spec.kind === "m:1") { out[k] = v?.id ? { id: v.id } : v; continue; }
        if (spec.kind === "1:m" || spec.kind === "m:n") {
          out[k] = Array.isArray(v) ? v.map((e) => (e?.id ? { id: e.id } : e)) : v;
          continue;
        }
      }

      if (v != null && typeof v === "object" && !Array.isArray(v) && v.constructor !== Object) continue;
      out[k] = v;
    }
    return out;
  }
}
