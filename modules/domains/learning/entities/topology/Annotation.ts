import { type Opt, type Rel } from "@mikro-orm/core";
import { BaseDataEntity, BaseDataRepository } from "@vivalence/entities";

export enum AnnotationTraitsEnum {
  FREE = "free",
  CATEGORICAL = "categorical",
  // Only categorical (&@root) can be TOPOLOGICAL
  TOPOLOGICAL = "topological",
  ANCESTOR = "ancestor",
}

export class AnnotationRepository extends BaseDataRepository {
  constructor(data: any) {
    super();
    this["#entity"] = AnnotationEntity;
  }
}

export class AnnotationEntity extends BaseDataEntity {
  // slug
  traits: AnnotationTraitsEnum[] & Opt = [];
  data: any & Opt = {};
  topology: string & Opt = "";

  constructor(node = {}) {
    super();
    Object.assign(this, node);

    // assert traits
    // if topological, then must be categorical
  }
}
