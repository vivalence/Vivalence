import {
  types,
  Collection,
  EntitySchema,
  EntityRepository,
  EntityRepositoryType,
  type Opt,
  type Rel,
} from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "../base/BaseEntity.ts";

export enum DimensionTraitsEnum {
  FREE = "FREE",
  CATEGORICAL = "CATEGORICAL",
  TOPOGRAPHICAL = "TOPOGRAPHICAL",
  ANCESTOR = "ANCESTOR",
  DESCENDANT = "DESCENDANT",
  LEARNABLE = "LEARNABLE",
  COMPLETABLE = "COMPLETABLE",
}

export class DimensionRepository extends EntityRepository<DimensionEntity> {
  byTrait(trait: DimensionTraitsEnum) {
    return this.find({ traits: { $like: `%"${trait}"%` } });
    //     return this.filter((dim) => dim.traits.includes(trait));
  }
  async topographical() {
    const dimensions = await this.byTrait(DimensionTraitsEnum.TOPOGRAPHICAL);
    return dimensions.map((dim) => dim.data.CATEGORICAL || []).flat();
  }
}

export class DimensionEntity extends BaseEntity {
  [EntityRepositoryType]?: DimensionRepository;

  slug!: string;
  name?: string & Opt;
  description?: string & Opt;

  traits: DimensionTraitsEnum[] & Opt = [];
  data: any & Opt = {};

  ancestor?: Rel<DimensionEntity>;
  descendants = new Collection<DimensionEntity>(this);

  constructor() {
    super();
  }

  //   constructor() { // not possible rn
  //     if (this.traits.includes("CATEGORICAL")) {
  //       for (const descendant of this.data.CATEGORICAL) {
  //         const dimension = new DimensionEntity(descendant);
  //         dimension.ancestor = this;
  //         this.descendants.push(dimension);
  //       }
  //     }
  //   }
}

export const DimensionSchema = new EntitySchema<DimensionEntity, BaseEntity>({
  class: DimensionEntity,
  repository: () => DimensionRepository,
  extends: BaseSchema,
  tableName: "Dimension",

  properties: {
    slug: {
      type: types.string,
      unique: true,
    },
    name: {
      type: types.string,
      nullable: true,
    },
    description: {
      type: types.string,
      nullable: true,
    },

    traits: {
      enum: true,
      array: true,
      items: () => DimensionTraitsEnum,
      default: [],
      type: types.enum,
    },

    data: {
      type: types.json,
    },

    ancestor: {
      kind: "m:1",
      entity: () => DimensionEntity,
      fieldName: "ancestor",
      nullable: true,
    },

    descendants: {
      kind: "1:m",
      entity: () => DimensionEntity,
      mappedBy: (dimension) => dimension.ancestor,
    },
  },
});

// import { type Opt, type Rel } from "@mikro-orm/core";
// // old: import { BaseDataEntity, BaseDataRepository } from "@vivalence/entities";
// import { BaseEntity, BaseRepository } from "@vivalence/entities"; // new

// // const example = {
// //   slug: "gender",
// //   name: "gender",
// //   description: "The grammatical gender of a noun or pronoun.",
// //   traits: ["CATEGORICAL", "LEARNABLE"],
// //   data: {
// //     LEARNABLE: { driver: "BOOLEAN", type: "INDIVIDUAL" },
// //     CATEGORICAL: [
// //       {
// //         slug: "fem",
// //         name: "Feminine",
// //         description: "Female gender",
// //         traits: ["LEARNABLE"],
// //         data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
// //       },
// //       {
// //         slug: "masc",
// //         name: "Masculine",
// //         description: "Male gender",
// //         traits: ["LEARNABLE"],
// //         data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
// //       },
// //       {
// //         slug: "neut",
// //         name: "Neutral",
// //         description: "Neutral gender",
// //         traits: ["LEARNABLE"],
// //         data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
// //       },
// //     ],
// //   },
// // };

// export enum DimensionTraitsEnum {
//   // Only categorical (&@root) can be TOPOLOGICAL
//   FREE = "free",
//   CATEGORICAL = "categorical",
//   TOPOGRAPHICAL = "topographical",
//   ANCESTOR = "ancestor",
//   DESCENDANT = "descendant",
//   LEARNABLE = "learnable",
//   COMPLETABLE = "completable",
// }

// export class DimensionEntity extends BaseDataEntity {
//   traits: DimensionTraitsEnum[] & Opt = [];
//   data: any & Opt = {};

//   ancestor?: DimensionEntity & Opt = null;
//   descendants: DimensionEntity[] & Opt = [];

//   constructor(node = {}) {
//     super();
//     Object.assign(this, node);

//     if (this.traits.includes("CATEGORICAL")) {
//       for (const descendant of this.data.CATEGORICAL) {
//         const dimension = new DimensionEntity(descendant);
//         dimension.ancestor = this;
//         this.descendants.push(dimension);
//       }
//     }
//   }
// }

// // this must implement the mikro base repository.

// export class DimensionRepository extends BaseDataRepository {
//   constructor(data: any) {
//     super();
//     this["#entity"] = DimensionEntity;
//   }
//   // findOne(query) {// can be omitted in rewrite.
//   //   return this.find((dimension) => {
//   //     return (
//   //       Object.entries(query).filter(([key, value]) => {
//   //         // if (key)
//   //         return dimension[key] === value;
//   //       }).length > 0
//   //     );
//   //   });
//   // }
// }
