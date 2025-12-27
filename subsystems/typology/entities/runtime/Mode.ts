import {
  types,
  EntitySchema,
  Collection,
  type Opt,
  type Rel,
} from "@mikro-orm/core";

import { DataRepository, DataEntity, DataSchema } from "../index.ts";
import { ValenceEntity } from "../index.ts";

export class ModeRepository extends DataRepository {
  unique(opt) {
    // ?? uniqueKeys = ["slug", "type"];
    return { type: opt.type, slug: opt.slug };
  }
}
export class ModeEntity extends DataEntity {
  valences = new Collection<ValenceEntity>(this);
  // products: Rel<ProductEntity>;
  installed: Boolean = false;
}

export const ModeSchema = new EntitySchema({
  class: ModeEntity,
  repository: () => ModeRepository,
  extends: DataSchema,
  name: "Mode",
  tableName: "Mode",
  uniques: [{ properties: ["slug", "type"] }],
  properties: {
    installed: { type: types.boolean },
    valences: {
      kind: "1:m",
      entity: () => ValenceEntity,
      mappedBy: (valence) => valence.mode,
    },
  },
});

export default {
  type: "mode",
  schema: ModeSchema,
  entity: ModeEntity,
  repository: ModeRepository,
};
