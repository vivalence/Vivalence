import { EntityRepositoryType, EntityRepository } from "@mikro-orm/core";
import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseOntologyEntity, BaseOntologyRepository } from "../0_root/BaseOntologyEntity.ts";

// import { BaseOntologyEntity } from "../0_root/BaseOntologyEntity.ts";
// export class TopographyEntity extends BaseOntologyEntity {

export class TopographyRepository extends BaseOntologyRepository {
  constructor(data: any) {
    super();
    this["#entity"] = TopographyEntity;
  }
}

export enum TopographyTraitsEnum {
  _ = "_",
}

export class TopographyEntity extends BaseOntologyEntity {
  // [EntityRepositoryType]?: TopographyRepository;
  // slug from hash.
  traits: TopographyTraitsEnum[] & Opt = [];
  annotations: any & Opt = "[]";
  // TODO:once using MikroRepository
  // annotations: new Collection<Annotation>(this)
  topology: string & Opt = "";
  data: any & Opt = "{}";

  constructor(node = {}) {
    super();
    Object.assign(this, node);
  }
}
