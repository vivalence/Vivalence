import { IsOptional, Type } from "typebox";
import { Value } from "typebox/value";
import { Compile } from "typebox/compile";

const derive = (target, patch) =>
  Object.assign(Object.defineProperties({}, Object.getOwnPropertyDescriptors(target)), patch);

function enhance(schema) {
  return new Proxy(schema, {
    get(target, prop, receiver) {
      if (["desc", "descr"].includes(prop))
        return (d) => enhance(derive(target, { description: d }));
      if (prop === "$id") {
        if ("$id" in target) return target.$id;
        return (name) => enhance(derive(target, { $id: name }));
      }
      if (prop === "optional") return () => enhance(Type.Optional(target));
      if (prop === "default") {
        if ("default" in target) return target.default;
        return (val) => enhance(derive(target, { default: val }));
      }
      if (prop === "group") {
        if ("group" in target) return target.group;
        return (name) => enhance(derive(target, { group: name }));
      }
      if (prop === "check") return (value) => Value.Check(target, value);
      if (prop === "decode") return (value) => Value.Decode(target, value);
      if (prop === "encode") return (value) => Value.Encode(target, value);
      if (prop === "create") return () => Value.Create(target);
      if (prop === "clean") return (value) => Value.Clean(target, value);
      if (prop === "errors") return (value) => Value.Errors(target, value);
      if (prop === "compile") return () => Compile(target);
      if (prop === "fill") return (value) => (Value.Default(target, value), value);
      if (prop === "cast")
        return (value) => (Value.Default(target, value), Value.Convert(target, value), value);
      return Reflect.get(target, prop, receiver);
    },
  });
}

export { enhance };

const resolving = new Set();

export function entityFactory(descriptor, base) {
  const factory = (spec) => {
    if (resolving.has(descriptor.$id)) {
      return enhance(
        Type.Intersect([base, Type.Object(descriptor.own, { additionalProperties: true })], {
          $id: descriptor.$id,
          additionalProperties: true,
        }),
      );
    }

    resolving.add(descriptor.$id);
    const relations = {};
    for (const [k, thunk] of Object.entries(descriptor.relations ?? {})) {
      relations[k] = thunk();
    }
    resolving.delete(descriptor.$id);

    const full = Type.Intersect(
      [
        base,
        Type.Object(descriptor.own, { additionalProperties: true }),
        Type.Object(relations, { additionalProperties: true }),
      ],
      { $id: descriptor.$id, additionalProperties: true },
    );

    if (!spec) return enhance(full);

    const overrides = {};
    for (const [k, v] of Object.entries(spec)) {
      if (descriptor.narrowable?.includes(k)) {
        overrides[k] =
          typeof v === "object" && v !== null && !v.type && !v.anyOf && !v.allOf && !v.oneOf
            ? Type.Object(v, { additionalProperties: true })
            : v;
      } else {
        overrides[k] = v;
      }
    }

    return enhance(Type.Intersect([full, Type.Object(overrides)], { additionalProperties: true }));
  };

  factory.$id = descriptor.$id;
  factory.descriptor = descriptor;
  return factory;
}

export const v = {
  string: (opts) => enhance(Type.String(opts)),
  number: (opts) => enhance(Type.Number(opts)),
  boolean: (opts) => enhance(Type.Boolean(opts)),
  integer: (opts) => enhance(Type.Integer(opts)),
  object: (props, opts) => enhance(Type.Object(props, opts)),
  array: (items, opts) => enhance(Type.Array(items, opts)),
  union: (variants, opts) => enhance(Type.Union(variants, opts)),
  intersect: (schemas, opts) => enhance(Type.Intersect(schemas, opts)),
  const: (val) => enhance(Type.Literal(val)),
  enum: (vals, opts) =>
    enhance(
      Type.Union(
        vals.map((val) => Type.Literal(val)),
        opts,
      ),
    ),
  record: (keys, values) => enhance(Type.Record(keys, values)),
  any: () => enhance(Type.Any()),
  unknown: () => enhance(Type.Unknown()),
  null: () => enhance(Type.Null()),

  $ref: (schema) => enhance(Type.Ref(schema)),

  diff: (a, b) => Value.Diff(a, b),
  patch: (value, edits) => Value.Patch(value, edits),
  equal: (a, b) => Value.Equal(a, b),
  clone: (value) => Value.Clone(value),
  check: (schema, value) => Value.Check(schema, value),
  decode: (schema, value) => Value.Decode(schema, value),
  encode: (schema, value) => Value.Encode(schema, value),
  fill: (schema, value) => (Value.Default(schema, value), value),
  cast: (schema, value) => (Value.Default(schema, value), Value.Convert(schema, value), value),
  convert: (schema, value) => Value.Convert(schema, value),
  errors: (schema, value) => Value.Errors(schema, value),
  create: (schema) => Value.Create(schema),
  clean: (schema, value) => Value.Clean(schema, value),
  isOptional: (schema) => IsOptional(schema),
  compile: (schema) => Compile(schema),
};
