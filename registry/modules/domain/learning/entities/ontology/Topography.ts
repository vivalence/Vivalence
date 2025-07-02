import { EntityRepositoryType, EntityRepository } from "@mikro-orm/core";
import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseDataEntity, BaseDataRepository } from "@vivalence/entities";

export class TopographyEntity extends BaseDataEntity {
  // slug, name, descr from DataEntity
  topology: string & Opt = "";
  dimensions: any & Opt = [];
  relations: any & Opt = [];
  // [any]: any;

  constructor(node = {}) {
    super();
    Object.assign(this, node);
    // @beef i think i could start to remove the relations as a required input and start to compute some defaults if none given.
  }
}

export class TopographyRepository extends BaseDataRepository {
  constructor(data: any) {
    super();
    this["#entity"] = TopographyEntity;
  }
  findOne(query) {
    return this.find((topography) => {
      return (
        Object.entries(query).filter(
          ([key, value]) => topography[key] === value,
        ).length > 0
      );
    });
  }
}
