import { type Opt, type Rel } from "@mikro-orm/core";
import { BaseDataEntity, BaseDataRepository } from "@vivalence/entities";

export enum DimensionTraitsEnum {
  // Only categorical (&@root) can be TOPOLOGICAL
  FREE = "free",
  CATEGORICAL = "categorical",
  TOPOGRAPHICAL = "topographical",
  ANCESTOR = "ancestor",
  DESCENDANT = "descendant",
  LEARNABLE = "learnable",
  COMPLETABLE = "completable",
}

export class DimensionEntity extends BaseDataEntity {
  traits: DimensionTraitsEnum[] & Opt = [];
  data: any & Opt = {};
  topology: string & Opt = "";

  ancestor?: DimensionEntity & Opt = null;
  descendants: DimensionEntity[] & Opt = [];

  constructor(node = {}) {
    super();
    Object.assign(this, node);

    if (this.traits.includes("CATEGORICAL")) {
      for (const descendant of this.data.CATEGORICAL) {
        const dimension = new DimensionEntity(descendant);
        dimension.ancestor = this;
        this.descendants.push(dimension);
      }
    }
  }
}

export class DimensionRepository extends BaseDataRepository {
  constructor(data: any) {
    super();
    this["#entity"] = DimensionEntity;
  }
  findOne(query) {
    return this.find((dimension) => {
      return (
        Object.entries(query).filter(([key, value]) => {
          // if (key)
          return dimension[key] === value;
        }).length > 0
      );
    });
  }
  byTrait(trait) {
    return this.filter((dim) => dim.traits.includes(trait));
  }
  get topographical() {
    return this.byTrait("TOPOGRAPHICAL")
      .map((dim) => dim.data.CATEGORICAL)
      .flat();
  }
}
