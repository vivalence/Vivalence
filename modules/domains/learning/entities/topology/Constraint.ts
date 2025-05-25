import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { validators } from "@vivalence/shared";
import { BaseDataEntity, BaseDataRepository } from "@vivalence/entities";

import { IssueEntity } from "../topology/Issue.ts";
import { UnitEntity } from "../data/Unit.ts";
import { TagEntity } from "../data/Tag.ts";

export enum ConstraintTraitsEnum {
  SCHEMATIC = "schematic",
  RELATIONAL = "relational",
  EXISTENTIAL = "existential",
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
  branch: string[] & Opt; // [${entity} ${togography}] || [${topology} ${dimension}]
  data: any & Opt = {};

  constructor(rule = { topology: "", traits: [], branch: [], data: {} }) {
    super();
    this.topology = rule.topology;
    this.traits = rule.traits;
    this.branch = rule.branch;
    this.data = rule.data;

    if (this.traits.length < 1)
      throw new Error("ConstraintEntity requires property trait");
  }

  async assert(entity: UnitEntity | TagEntity) {
    const issues = [];

    let entityType = "";
    if (entity instanceof UnitEntity) entityType = "unit";
    else if (entity instanceof TagEntity) entityType = "tag";

    if (this.traits.includes("SCHEMATIC")) {
      const fails = await validators.viva.entity(this.data.SCHEMATIC, entity);
      for (const issue of fails) {
        issue.context[entityType] = entity;
        issue.path.unshift(entityType);
        issues.push(new IssueEntity(issue));
      }
    }

    if (this.traits.includes("RELATIONAL")) {
      if (entity instanceof UnitEntity) {
        if (!entity.tags.isInitialized()) await entity.tags.init();

        const relations = [];
        entity.tags
          .map((tag) => tag.data.ONTOLOGICAL)
          .map((r) => relations.push(r));

        const fails = await validators.viva.relations(
          this.data.RELATIONAL,
          relations,
        );

        for (const issue of fails) {
          issue.context["unit"] = entity;
          issue.path = ["unit", "tags"];
          issues.push(new IssueEntity(issue));
        }
      }
    }

    return issues;
  }
}
