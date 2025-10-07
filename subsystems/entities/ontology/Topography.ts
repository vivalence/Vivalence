import {
  types,
  Collection,
  EntitySchema,
  EntityRepositoryType,
  type Opt,
  type Rel,
} from "@mikro-orm/core";
import { DataRepository, DimensionEntity } from "@vivalence/entities";
import { DataEntity, DataSchema } from "@vivalence/entities";

export enum TopographyTraitsEnum {
  CONSTRAINED = "CONSTRAINED",
  ANNOTATED = "ANNOTATED",
}

export class TopographyRepository extends DataRepository {
  unique(opt) {
    return { slug: opt.slug };
  }

  // async getStructural() {return this.findByTrait(TopographyTraitsEnum.STRUCTURAL);}
}

export class TopographyEntity extends DataEntity {
  traits: TopographyTraitsEnum[] & Opt = [];
  data: any & Opt = {};
  dimensions = new Collection<DimensionEntity>(this);
  annotations: any[] & Opt = [];
  constraints: any[] & Opt = [];

  [EntityRepositoryType]?: TopographyRepository;

  constructor(node = {}) {
    super();
    Object.assign(this, node);
    // console.log(node);
  }
}

export const TopographySchema = new EntitySchema<TopographyEntity, DataEntity>({
  class: TopographyEntity,
  tableName: "Topography",
  extends: DataSchema,
  uniques: [{ properties: ["slug"] }],
  repository: () => TopographyRepository,

  properties: {
    traits: {
      type: types.json,
      defaultRaw: `"[]"`,
      enum: true,
      array: true,
      items: () => TopographyTraitsEnum,
      default: [],
    },
    data: { type: types.json, default: {} },
    dimensions: {
      kind: "m:n",
      entity: () => DimensionEntity,
      inversedBy: "topographies",
    },
    annotations: { type: types.json, default: [] },
    constraints: {
      type: types.json,
      default: [],
    },
  },
});

export default {
  schema: TopographySchema,
  entity: TopographyEntity,
  repository: TopographyRepository,
};
