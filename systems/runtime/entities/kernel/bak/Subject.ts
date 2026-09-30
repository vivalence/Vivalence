import { types, Collection, EntitySchema, EntityRepositoryType } from "@mikro-orm/core";
import { type Opt, type Rel } from "@mikro-orm/core";
import { DataRepository, DimensionEntity } from "../index.ts";
import { DataEntity, DataSchema } from "../index.ts";

// export enum SubjectTraitsEnum {CONSTRAINED = "CONSTRAINED", ANNOTATED = "ANNOTATED",}

export class SubjectRepository extends DataRepository {
  unique(opt) {
    return { slug: opt.slug };
  }

  // async getStructural() {return this.findByTrait(SubjectTraitsEnum.STRUCTURAL);}
}

export class SubjectEntity extends DataEntity {
  // traits: SubjectTraitsEnum[] & Opt = [];
  // data: any & Opt = {};
  // dimensions = new Collection<DimensionEntity>(this);
  slug: string & Opt = "";
  name?: string;
  description?: string;
  dimensions: any[] & Opt = [];
  relations: any[] & Opt = [];
  // constraints: any[] & Opt = [];

  [EntityRepositoryType]?: SubjectRepository;

  // constructor(node = {}) {super(node); Object.assign(this, node);}
}

export const SubjectSchema = new EntitySchema<SubjectEntity, DataEntity>({
  class: SubjectEntity,
  tableName: "Subject",
  name: "Subject",
  extends: DataSchema,
  uniques: [{ properties: ["slug"] }],
  repository: () => SubjectRepository,

  properties: {
    slug: { type: types.string },
    name: { type: types.string, nullable: true },
    description: { type: types.string, nullable: true },
    // traits: {type: types.json, defaultRaw: `"[]"`, enum: true, array: true, items: () => SubjectTraitsEnum, default: [],},
    // data: { type: types.json, default: {} },
    // dimensions: {kind: "m:n", entity: () => DimensionEntity, inversedBy: "subjects",},
    dimensions: { type: types.json, default: [] },
    relations: { type: types.json, default: [] },
    // annotation: { type: types.json, default: [] },
    // constraints: {type: types.json, default: [],},
  },
});

export default {
  type: "subject",
  schema: SubjectSchema,
  entity: SubjectEntity,
  repository: SubjectRepository,
};
