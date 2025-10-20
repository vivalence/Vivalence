import { hash } from "@vivalence/shared";
import { type Opt } from "@mikro-orm/core";
import { VirtualEntity, VirtualRepository } from "@vivalence/entities";
import { ConstraintEntity } from "./Constraint.ts";

export enum IssueViolationEnum {
  forbidden = "forbidden",
  required = "required",
}
export enum IssueStatusEnum {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  RESOLVED = "RESOLVED",
  ERROR = "ERROR",
}

export class IssueRepository extends VirtualRepository {
  constructor(data: any) {
    super();
    this["#entity"] = IssueEntity;
  }
}

export class IssueEntity {
  violation: IssueViolationEnum & Opt = null;
  path: string[] & Opt = [];
  message: string & Opt = "";
  context: any & Opt = {};

  slug: string;
  status: IssueStatusEnum & Opt = IssueStatusEnum.PENDING;

  error: any & Opt = {};
  history: string[] & Opt = [];

  descendants: IssueEntity[] & Opt = [];
  parent: IssueEntity & Opt = {};

  constraint: ConstraintEntity & Opt = [];
  entity: any & Opt = null;

  constructor(data: any) {
    this.violation = data.violation;
    this.path = data.path || [];
    this.message = data.message;
    this.context = data.context || {};
    this.slug = hash.object(data);
  }
  onError(error: any) {
    this.error = error;
    this.status = IssueStatusEnum.ERROR;
    console.log("[ISSUE ERROR]", this);
    return this;
  }
  spawn(issues: IssueEntity | IssueEntity[]) {
    if (!Array.isArray(issues)) issues = [issues];
    for (const issue of issues) {
      issue.parent = this;
      this.descendants.push(issue);
    }
    return this;
  }
  violates(constraint: ConstraintEntity) {
    this.constraint = constraint;
    return this;
  }
  of(entity) {
    this.entity = entity;
    return this;
  }
  async resolve() {
    // Doesnt work yet, because individual constraints might spawn multiple issues and theyre resolved async.
    // const issues = await this.constraint.test(this.entity);
    // if (issues.length > 0)
    //   this.onError({ issues, message: "constraint check on resolve failed" });
    // else this.status = IssueStatusEnum.RESOLVED;
    this.status = IssueStatusEnum.RESOLVED;
    return this;
  }
  get resolved() {
    return this.status === IssueStatusEnum.RESOLVED;
  }
  get hasSpawn() {
    return this.descendants.filter((issue) => !issue.resolved).length > 0;
  }
  get hasError() {
    return this.status === IssueStatusEnum.ERROR;
  }
}

export default {
  // schema: DimensionSchema
  entity: IssueEntity,
  repository: IssueRepository,
};
