import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { validators } from "@vivalence/shared";
import { BaseDataEntity, BaseDataRepository } from "../0_root/BaseDataEntity.ts";

import { IssueEntity } from "../3_topology/Issue.ts";
import { UnitEntity } from "../4_data/Unit.ts";
import { TagEntity } from "../4_data/Tag.ts";

export enum ConstraintTraitsEnum {
  SCHEMATIC = "schematic",
  RELATIONAL = "relational",
}

export class ConstraintRepository extends BaseDataRepository {
  constructor(data: any) {
    super();
    this["#entity"] = ConstraintEntity;
  }
}

export class ConstraintEntity extends BaseDataEntity {
  traits: ConstraintTraitsEnum[] & Opt = [];
  topology: string & Opt = "";
  branch: string[] & Opt; // [${entity} ${togography}] || [${topology} ${annotation}]
  data: any & Opt = "{}";

  constructor(rule = { topology: "", traits: [], branch: [], data: {} }) {
    super();
    this.topology = rule.topology;
    this.traits = rule.traits;
    this.branch = rule.branch;
    this.data = rule.data;

    if (this.traits.length < 1) throw new Error("ConstraintEntity requires property trait");
  }

  async assert(entity: UnitEntity | TagEntity) {
    const issues = [];

    if (this.traits.includes("SCHEMATIC")) {
      const fails = await validators.viva.entity(this.data.SCHEMATIC, entity);
      for (const issue of fails) {
        issue.context.entity = entity;
        issue.path.unshift("unit"); // @lj temporary hardcode
        issues.push(issue);
      }
    }

    if (this.traits.includes("RELATIONAL")) {
      const relations = [];
      if (entity instanceof UnitEntity && entity.tags.isInitialized()) {
        entity.tags.map((tag) => tag.data.ONTOLOGICAL).map((r) => relations.push(r));
      }
      if (entity instanceof TagEntity) {
        // TODO
      }

      const fails = await validators.viva.relations(this.data.RELATIONAL, relations);

      for (const issue of fails) {
        issue.context.entity = entity;
        issue.path = ["unit", "tags"]; // @lj temporary hardcode
        issues.push(issue);
      }
    }

    return issues.map((data) => new IssueEntity({ data }));
  }
}
