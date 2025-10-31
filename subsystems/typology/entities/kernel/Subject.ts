import {
  types,
  Collection,
  EntitySchema,
  EntityRepositoryType,
  type Opt,
  type Rel,
} from "@mikro-orm/core";
import { DataRepository, DimensionEntity } from "../index.ts";
import { DataEntity, DataSchema } from "../index.ts";

export enum SubjectTraitsEnum {
  CONSTRAINED = "CONSTRAINED",
  ANNOTATED = "ANNOTATED",
}

export class SubjectRepository extends DataRepository {
  unique(opt) {
    return { slug: opt.slug };
  }

  // async getStructural() {return this.findByTrait(SubjectTraitsEnum.STRUCTURAL);}
}

export class SubjectEntity extends DataEntity {
  traits: SubjectTraitsEnum[] & Opt = [];
  data: any & Opt = {};
  dimensions = new Collection<DimensionEntity>(this);
  annotations: any[] & Opt = [];
  constraints: any[] & Opt = [];

  [EntityRepositoryType]?: SubjectRepository;

  constructor(node = {}) {
    super();
    Object.assign(this, node);
    // console.log(node);
  }
}

export const SubjectSchema = new EntitySchema<SubjectEntity, DataEntity>({
  class: SubjectEntity,
  tableName: "Subject",
  extends: DataSchema,
  uniques: [{ properties: ["slug"] }],
  repository: () => SubjectRepository,

  properties: {
    traits: {
      type: types.json,
      defaultRaw: `"[]"`,
      enum: true,
      array: true,
      items: () => SubjectTraitsEnum,
      default: [],
    },
    data: { type: types.json, default: {} },
    dimensions: {
      kind: "m:n",
      entity: () => DimensionEntity,
      inversedBy: "subjects",
    },
    annotations: { type: types.json, default: [] },
    constraints: {
      type: types.json,
      default: [],
    },
  },
});

export default {
  type: "subject",
  schema: SubjectSchema,
  entity: SubjectEntity,
  repository: SubjectRepository,
};
