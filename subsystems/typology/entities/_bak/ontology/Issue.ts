import {
  types,
  Collection,
  EntitySchema,
  EntityRepository,
  EntityRepositoryType,
  type Opt,
  type Rel,
} from "@mikro-orm/core";
import { hash } from "@vivalence/shared";

import { BaseEntity, BaseSchema } from "../base/BaseEntity.ts";
import { ConstraintEntity } from "./Constraint.ts";

export enum IssueViolationEnum {
  FORBIDDEN = "FORBIDDEN",
  REQUIRED = "REQUIRED",
}

export enum IssueStatusEnum {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  RESOLVED = "RESOLVED",
  ERROR = "ERROR",
}

export class IssueRepository extends EntityRepository<IssueEntity> {
  async byStatus(status: IssueStatusEnum) {
    return this.find({ status });
  }

  async byViolation(violation: IssueViolationEnum) {
    return this.find({ violation });
  }

  async pending() {
    return this.byStatus(IssueStatusEnum.PENDING);
  }

  async resolved() {
    return this.byStatus(IssueStatusEnum.RESOLVED);
  }
}

export class IssueEntity extends BaseEntity {
  [EntityRepositoryType]?: IssueRepository;

  slug!: string;
  violation: IssueViolationEnum & Opt = null;
  path: string[] & Opt = [];
  message: string & Opt = "";
  context: any & Opt = {};
  status: IssueStatusEnum & Opt = IssueStatusEnum.PENDING;

  error: any & Opt = {};
  history: string[] & Opt = [];

  parent?: Rel<IssueEntity>;
  descendants = new Collection<IssueEntity>(this);

  constraint?: Rel<ConstraintEntity>;
  entityData: any & Opt = null; // Store entity data as JSON since we can't have generic relations

  constructor() {
    super();
  }

  // Custom methods
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
      this.descendants.add(issue);
    }
    return this;
  }

  violates(constraint: ConstraintEntity) {
    this.constraint = constraint;
    return this;
  }

  of(entity: any) {
    this.entityData = entity;
    return this;
  }

  async resolve() {
    // Note: Original comment about constraint check still applies
    this.status = IssueStatusEnum.RESOLVED;
    return this;
  }

  get resolved() {
    return this.status === IssueStatusEnum.RESOLVED;
  }

  get hasSpawn() {
    if (!this.descendants.isInitialized()) return false;
    return (
      this.descendants.getItems().filter((issue) => !issue.resolved).length > 0
    );
  }

  get hasError() {
    return this.status === IssueStatusEnum.ERROR;
  }

  // Hook to generate slug before persist
  generateSlug(data?: any) {
    if (!this.slug) {
      const hashData = data || {
        violation: this.violation,
        path: this.path,
        message: this.message,
        context: this.context,
      };
      this.slug = hash.object(hashData);
    }
    return this.slug;
  }
}

export const IssueSchema = new EntitySchema<IssueEntity, BaseEntity>({
  class: IssueEntity,
  repository: () => IssueRepository,
  extends: BaseSchema,
  tableName: "Issue",

  hooks: {
    beforeCreate: [
      (args) => {
        args.entity.generateSlug();
      },
    ],
  },

  properties: {
    slug: {
      type: types.string,
      unique: true,
    },

    violation: {
      enum: true,
      items: () => IssueViolationEnum,
      nullable: true,
    },

    path: {
      type: types.json,
      default: [],
    },

    message: {
      type: types.string,
      default: "",
    },

    context: {
      type: types.json,
      default: {},
    },

    status: {
      enum: true,
      items: () => IssueStatusEnum,
      default: IssueStatusEnum.PENDING,
      onCreate: () => IssueStatusEnum.PENDING,
    },

    error: {
      type: types.json,
      default: {},
    },

    history: {
      type: types.json,
      default: [],
    },

    parent: {
      kind: "m:1",
      entity: () => IssueEntity,
      fieldName: "parent",
      nullable: true,
    },

    descendants: {
      kind: "1:m",
      entity: () => IssueEntity,
      mappedBy: (issue) => issue.parent,
    },

    constraint: {
      kind: "m:1",
      entity: () => ConstraintEntity,
      fieldName: "constraint",
      nullable: true,
    },

    entityData: {
      type: types.json,
      nullable: true,
    },
  },
});

// import { hash } from "@vivalence/shared";
// import { type Opt } from "@mikro-orm/core";
// import { BaseDataEntity, BaseDataRepository } from "@vivalence/entities";
// import { ConstraintEntity } from "./Constraint.ts";

// export enum IssueViolationEnum {
//   forbidden = "forbidden",
//   required = "required",
// }
// export enum IssueStatusEnum {
//   PENDING = "PENDING",
//   PROCESSING = "PROCESSING",
//   RESOLVED = "RESOLVED",
//   ERROR = "ERROR",
// }

// export class IssueRepository extends BaseDataRepository {
//   constructor(data: any) {
//     super();
//     this["#entity"] = IssueEntity;
//   }
// }

// export class IssueEntity {
//   violation: IssueViolationEnum & Opt = null;
//   path: string[] & Opt = [];
//   message: string & Opt = "";
//   context: any & Opt = {};

//   slug: string;
//   status: IssueStatusEnum & Opt = IssueStatusEnum.PENDING;

//   error: any & Opt = {};
//   history: string[] & Opt = [];

//   descendants: IssueEntity[] & Opt = [];
//   parent: IssueEntity & Opt = {};

//   constraint: ConstraintEntity & Opt = [];
//   entity: any & Opt = null;

//   constructor(data: any) {
//     this.violation = data.violation;
//     this.path = data.path || [];
//     this.message = data.message;
//     this.context = data.context || {};
//     this.slug = hash.object(data);
//   }
//   onError(error: any) {
//     this.error = error;
//     this.status = IssueStatusEnum.ERROR;
//     console.log("[ISSUE ERROR]", this);
//     return this;
//   }
//   spawn(issues: IssueEntity | IssueEntity[]) {
//     if (!Array.isArray(issues)) issues = [issues];
//     for (const issue of issues) {
//       issue.parent = this;
//       this.descendants.push(issue);
//     }
//     return this;
//   }
//   violates(constraint: ConstraintEntity) {
//     this.constraint = constraint;
//     return this;
//   }
//   of(entity) {
//     this.entity = entity;
//     return this;
//   }
//   async resolve() {
//     // Doesnt work yet, because individual constraints might spawn multiple issues and theyre resolved async.
//     // const issues = await this.constraint.test(this.entity);
//     // if (issues.length > 0)
//     //   this.onError({ issues, message: "constraint check on resolve failed" });
//     // else this.status = IssueStatusEnum.RESOLVED;
//     this.status = IssueStatusEnum.RESOLVED;
//     return this;
//   }
//   get resolved() {
//     return this.status === IssueStatusEnum.RESOLVED;
//   }
//   get hasSpawn() {
//     return this.descendants.filter((issue) => !issue.resolved).length > 0;
//   }
//   get hasError() {
//     return this.status === IssueStatusEnum.ERROR;
//   }
// }
