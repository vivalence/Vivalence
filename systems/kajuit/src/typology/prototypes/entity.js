export class Entity {
  toJSON() {
    const props = this.constructor.schema?.properties ?? {};
    const out = {};
    for (const [key, value] of Object.entries(this)) {
      if (typeof value === "function") continue;
      if (value instanceof Set || value instanceof Map) continue;

      const spec = props[key];
      if (spec) {
        if (spec.kind === "m:1") {
          out[key] = value?.id ? { id: value.id } : value;
          continue;
        }
        if (spec.kind === "1:m" || spec.kind === "m:n") {
          out[key] = Array.isArray(value)
            ? value.map((element) => (element?.id ? { id: element.id } : element))
            : value;
          continue;
        }
      }

      if (
        value != null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        value.constructor !== Object
      )
        continue;
      out[key] = value;
    }
    return out;
  }
}
