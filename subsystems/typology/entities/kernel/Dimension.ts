import {
  types,
  Collection,
  EntitySchema,
  EntityRepositoryType,
  type Opt,
  type Rel,
} from "@mikro-orm/core";
import { array } from "@vivalence/shared";
import { Path } from "@vivalence/typology";
import { SubjectEntity, DataRepository } from "../index.ts";
import { DataEntity, DataSchema } from "../index.ts";

// future
// import { type InferEntity, defineEntity } from "@mikro-orm/core"; const p = defineEntity.properties; export const baseProperties = {id: p.integer().primary(), createdAt: p.datetime().onCreate(() => new Date()), updatedAt: p .datetime() .onCreate(() => new Date()) .onUpdate(() => new Date()),}; export const Book = defineEntity({name: "Book", properties: (p) => ({...baseProperties, title: p.string(), author: () => p.manyToOne(Author).inversedBy("books"), publisher: () => p.oneToOne(Publisher).inversedBy("book"), tags: () => p.manyToMany(BookTag).inversedBy("books").fixedOrder(),}),}); console.log(Book);

export enum DimensionTraitsEnum {
  FREE = "FREE",
  CATEGORICAL = "CATEGORICAL",
  TOPOGRAPHICAL = "TOPOGRAPHICAL",
  ANCESTOR = "ANCESTOR",
  DESCENDANT = "DESCENDANT",
  LEARNABLE = "LEARNABLE", // domain level trait
  COMPLETABLE = "COMPLETABLE", // domain level trait
}

export class DimensionEntity extends DataEntity {
  traits: DimensionTraitsEnum[] & Opt = [];

  ancestor?: Rel<DimensionEntity>;
  descendants = new Collection<DimensionEntity>(this);
  subjects = new Collection<SubjectEntity>(this);
  [EntityRepositoryType]?: DimensionRepository;

  constructor(dimension = {}) {
    super(dimension);
    Object.assign(this, dimension);
    this.traits.map((t) => this.data[t] || (this.data[t] = {}));
  }
}

export const DimensionSchema = new EntitySchema<DimensionEntity, DataEntity>({
  class: DimensionEntity,
  name: "Dimension",
  tableName: "Dimension",
  extends: DataSchema,
  uniques: [{ properties: ["ancestor", "slug"] }],
  repository: () => DimensionRepository,

  properties: {
    traits: {
      type: types.json,
      defaultRaw: `"[]"`,
      enum: true,
      array: true,
      items: () => DimensionTraitsEnum,
      default: [],
    },
    ancestor: {
      kind: "m:1",
      entity: () => DimensionEntity,
      fieldName: "ancestor",
      inversedBy: "descendants",
      nullable: true,
    },
    descendants: {
      kind: "1:m",
      entity: () => DimensionEntity,
      mappedBy: (dimension) => dimension.ancestor,
    },
    subjects: {
      kind: "m:n",
      entity: () => SubjectEntity,
      mappedBy: "dimensions",
    },
  },
});

export class DimensionRepository extends DataRepository {
  unique(opt) {
    return { ancestor: opt.ancestor, slug: opt.slug };
  }
  async ensure(node) {
    const dimension = await super.ensure({
      ...node,
      traits: node.traits || [],
      data: node.data || {},
    });

    if (dimension.traits.includes("FREE")) {
      dimension.descendants.add(
        await this.ensure({
          slug: "*",
          ancestor: dimension,
        }),
      );
    }

    if (dimension.traits.includes("CATEGORICAL")) {
      const categories = array.unique([
        ...(node.data?.CATEGORICAL || []),
        ...(dimension.data.CATEGORICAL || []),
      ]);

      for (const category of categories) {
        dimension.descendants.add(
          await this.ensure({
            ...category,
            ancestor: dimension,
            traits: array.unique([...(category.traits || []), "DESCENDANT"]),
          }),
        );
      }
    }

    this.em.persist(dimension);
    return dimension;
  }

  byBranch(branch) {
    return this.findOne(
      branch.reduce((ancestor, slug) => ({ ancestor, slug }), null),
    );
  }
  byPath(path) {
    return this.byBranch(path.absolute.split("/"));
  }
  findByTrait(trait) {
    return this.find({ traits: { $in: [trait] } });
  }

  getTopographical() {
    return this.findByTrait(DimensionTraitsEnum.TOPOGRAPHICAL);
  }
}
export default {
  type: "dimension",
  schema: DimensionSchema,
  entity: DimensionEntity,
  repository: DimensionRepository,
};
