import {
  types,
  EntitySchema,
  Collection,
  type Opt,
  type Rel,
} from "@mikro-orm/core";

import { DataRepository, DataEntity, DataSchema } from "../base/DataEntity.ts";
import { ValenceEntity } from "./Valence.ts";

export class ModuleRepository extends DataRepository {
  unique(opt) {
    // ?? uniqueKeys = ["slug", "type"];
    return { type: opt.type, slug: opt.slug };
  }
}
export class ModuleEntity extends DataEntity {
  valences = new Collection<ValenceEntity>(this);
  installed: Boolean = false;
}

export const ModuleSchema = new EntitySchema({
  class: ModuleEntity,
  repository: () => ModuleRepository,
  extends: DataSchema,
  name: "Module",
  tableName: "Module",
  uniques: [{ properties: ["slug", "type"] }],
  properties: {
    installed: { type: types.boolean },
    valences: {
      kind: "1:m",
      entity: () => ValenceEntity,
      mappedBy: (valence) => valence.module,
    },
  },
});

export default {
  schema: ModuleSchema,
  entity: ModuleEntity,
  repository: ModuleRepository,
};
