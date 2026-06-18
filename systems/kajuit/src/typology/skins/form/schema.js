const propsOf = (schema) => {
  if (!schema || typeof schema !== "object") return {};
  if (schema.properties) return schema.properties;
  if (Array.isArray(schema.allOf)) return Object.assign({}, ...schema.allOf.map(propsOf));
  return {};
};

export const dataSchema = (viewSchema) => propsOf(viewSchema).data ?? null;

const enumOf = (sub) => {
  if (Array.isArray(sub?.enum)) return sub.enum;
  if (Array.isArray(sub?.anyOf) && sub.anyOf.every((entry) => "const" in entry))
    return sub.anyOf.map((entry) => entry.const);
  return null;
};

const optionsOf = (sub) => {
  const direct = enumOf(sub);
  if (direct) return direct;
  if (Array.isArray(sub?.anyOf))
    for (const member of sub.anyOf) {
      const options = enumOf(member) ?? enumOf(member?.items);
      if (options) return options;
    }
  return null;
};

// Entity schemas carry their $id ("Literal" / "Symbol"); a relation field is
// v.rel(v.literal()) = union([ID, literalSchema]) — or an array thereof.
const ENTITY_IDS = { Literal: "literal", Symbol: "symbol" };

const entityIdOf = (sub) => {
  if (!sub || typeof sub !== "object") return null;
  if (ENTITY_IDS[sub.$id]) return ENTITY_IDS[sub.$id];
  for (const member of sub.anyOf ?? sub.allOf ?? []) {
    const found = entityIdOf(member);
    if (found) return found;
  }
  return null;
};

const entityOf = (sub) => {
  if (sub?.type === "array") {
    const entity = entityIdOf(sub.items);
    return entity ? { entity, multiple: true } : null;
  }
  const entity = entityIdOf(sub);
  return entity ? { entity, multiple: false } : null;
};

const kindOf = (sub) => {
  const entity = entityOf(sub);
  if (entity) return entity.multiple ? "entity-set" : "entity-ref";
  if (optionsOf(sub)) return "enum";
  if (sub?.type === "integer" || sub?.type === "number") return "number";
  if (sub?.type === "boolean") return "boolean";
  return "string";
};

export const fields = (schema) => {
  const props = propsOf(schema);
  const required = schema?.required ?? [];
  return Object.entries(props).map(([name, sub]) => {
    const entity = entityOf(sub);
    return {
      name,
      kind: kindOf(sub),
      options: optionsOf(sub),
      entity: entity?.entity ?? null,
      multiple: entity?.multiple ?? false,
      fallback: sub?.default,
      description: sub?.description ?? "",
      required: required.includes(name),
    };
  });
};

// Resolve the object-schema the masked form renders from, per thread config:
//   aimed → the emitter leaf's flat input at AIMED.mount;
//   else  → the view mask's data props + the buffer's literal/symbol relations.
export const maskSchema = (mode, traits, trait) => {
  if (traits?.includes("AIMED") && trait?.AIMED?.mount) {
    const nature = trait.AIMED.mount.replace(/^\/emit\//, "").replace(/^\//, "");
    const leaf = (mode?.emitter?.leaves ?? []).find((entry) => entry.nature === nature);
    return leaf?.input ?? null;
  }
  const view = mode?.view?.schema;
  if (!view) return null;
  const top = propsOf(view);
  const data = propsOf(top.data);
  const relations = Object.fromEntries(Object.entries(top).filter(([, sub]) => entityOf(sub)));
  return { type: "object", properties: { ...data, ...relations } };
};
