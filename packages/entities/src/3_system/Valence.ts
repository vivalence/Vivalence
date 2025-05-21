import { type Opt, type Rel } from "@mikro-orm/core";
import { BaseDataEntity, BaseDataRepository } from "@vivalence/entities";

export enum ValenceTraitsEnum {
  FREE = "free",
}

export class ValenceRepository extends BaseDataRepository {
  constructor(data: any) {
    super();
    this["#entity"] = ValenceEntity;
  }
}

export class ValenceEntity extends BaseDataEntity {
  traits: ValenceTraitsEnum[] & Opt = [];
  literal: string & Opt = ``;
  constructor(node = {}) {
    super();
    Object.assign(this, node);
  }
}
