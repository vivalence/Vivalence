export default class Scope {
  constructor(scope = {}) {
    for (const key in scope) {
      if (Object.prototype.hasOwnProperty.call(scope, key)) {
        this[key] = scope[key];
      }
    }
  }
}

// import { Type } from "@sinclair/typebox";

// const EntityRef = Type.Union([
//   Type.Object({ id: Type.String() }),
//   Type.Object({ slug: Type.String() }),
// ]);

// const UnitRef = Type.Union([
//   EntityRef,
//   Type.Object({
//     tags: Type.Array(EntityRef),
//   }),
// ]);

// export const ScopeSchema = Type.Object({
//   user: Type.Optional(EntityRef),
//   runtime: Type.Optional(EntityRef),
//   dependency: Type.Optional(EntityRef),
//   tactic: Type.Optional(EntityRef),
//   game: Type.Optional(EntityRef),
//   tag: Type.Optional(EntityRef),
//   tags: Type.Optional(Type.Array(EntityRef)),
//   unit: Type.Optional(UnitRef),
//   units: Type.Optional(Type.Array(UnitRef)),
//   memory: Type.Optional(EntityRef),
//   instruction: Type.Optional(EntityRef),
//   queue: Type.Optional(EntityRef),
// });
