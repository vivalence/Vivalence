import { type Opt, type Rel } from "@mikro-orm/core";
import { BaseOntologyEntity, BaseOntologyRepository } from "../0_root/BaseOntologyEntity.ts";

export enum AnnotationTraitsEnum {
  FREE = "free",
  CATEGORICAL = "categorical",
  // Only categorical (&@root) can be TOPOLOGICAL
  TOPOLOGICAL = "topological",
  ANCESTOR = "ancestor",
}

export class AnnotationRepository extends BaseOntologyRepository {
  constructor(data: any) {
    super();
    this["#entity"] = AnnotationEntity;
  }
}

export class AnnotationEntity extends BaseOntologyEntity {
  // slug
  traits: AnnotationTraitsEnum[] & Opt = [];
  data: any & Opt = "{}";
  topology: string & Opt = "";

  constructor(node = {}) {
    super();
    Object.assign(this, node);

    // assert traits
    // if topological, then must be categorical
  }
}
