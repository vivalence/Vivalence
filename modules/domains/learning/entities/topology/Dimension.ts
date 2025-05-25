import { type Opt, type Rel } from "@mikro-orm/core";
import { BaseDataEntity, BaseDataRepository } from "@vivalence/entities";

export enum DimensionTraitsEnum {
  FREE = "free",
  CATEGORICAL = "categorical",
  // Only categorical (&@root) can be TOPOLOGICAL
  TOPOLOGICAL = "topological",
  ANCESTOR = "ancestor",
}

export class DimensionRepository extends BaseDataRepository {
  constructor(data: any) {
    super();
    this["#entity"] = DimensionEntity;
  }
}

export class DimensionEntity extends BaseDataEntity {
  // slug
  traits: DimensionTraitsEnum[] & Opt = [];
  data: any & Opt = {};
  topology: string & Opt = "";

  constructor(node = {}) {
    super();
    Object.assign(this, node);

    // assert traits
    // if topological, then must be categorical
  }
}
