import { hash } from "@vivalence/shared";
import { type Opt } from "@mikro-orm/core";
import { BaseDataEntity, BaseDataRepository } from "@vivalence/schema";

export enum IssueStatusEnum {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  RESOLVED = "RESOLVED",
  ERROR = "ERROR",
}

export class IssueRepository extends BaseDataRepository {
  constructor(data: any) {
    super();
    this["#entity"] = IssueEntity;
  }
}

export class IssueEntity {
  slug: string;
  index: number & Opt = 0;
  status: IssueStatusEnum & Opt = IssueStatusEnum.PENDING;
  data: any & Opt = {};
  error: any & Opt = {};
  history: string[] & Opt = [];
  constructor(data: any) {
    Object.assign(this, data);
    this.slug = hash.object(this.data);
  }
  markError(error: any) {
    this.error = error;
    this.status = IssueStatusEnum.ERROR;
    return this;
  }
  resolve() {
    this.status = IssueStatusEnum.RESOLVED;
    return this;
  }
  get resolved() {
    return this.status === IssueStatusEnum.RESOLVED;
  }
}

// export const IssueSchema = new EntitySchema<IssueEntity, BaseEntity>({class: IssueEntity, extends: BaseSchema, tableName: "Issue", properties: {user: {kind: "m:1", entity: () => User, fieldName: "user", updateRule: "cascade", deleteRule: "cascade",}, runtime: {kind: "m:1", entity: () => RuntimeEntity, fieldName: "runtime", updateRule: "cascade", deleteRule: "cascade",}, game: {kind: "m:1", entity: () => GameEntity, fieldName: "game", updateRule: "cascade", deleteRule: "cascade", nullable: true,}, tactic: {kind: "m:1", entity: () => TacticEntity, fieldName: "tactic", updateRule: "cascade", deleteRule: "cascade", nullable: true,}, dependency: {kind: "m:1", entity: () => DependencyEntity, fieldName: "dependency", updateRule: "cascade", deleteRule: "cascade", nullable: true,}, index: { type: Number }, data: { type: "json" }, status: {enum: true, items: () => IssueStatusEnum, default: IssueStatusEnum.PENDING, onCreate: () => IssueStatusEnum.PENDING,},},});
