//
//
// EXPORTS
//
//

export { BaseEntity, BaseSchema } from "./0_root/BaseEntity.ts";
export { BaseDataEntity, BaseDataSchema, BaseDataRepository } from "./0_root/BaseDataEntity.ts";
export { BaseModuleEntity, BaseModuleSchema } from "./0_root/BaseModuleEntity.ts";
export { ModuleInstallationEnum } from "./0_root/BaseModuleEntity.ts";

export { UserEntity, UserSchema } from "./1_repo/User.ts";
export { RuntimeEntity, RuntimeSchema } from "./1_repo/Runtime.ts";
export { ModuleEntity, ModuleSchema } from "./2_module/Module.ts";
export { DomainEntity, DomainSchema } from "./2_module/Domain.ts";
export { ServiceEntity, ServiceSchema } from "./2_module/Service.ts";
export { StrategyEntity, StrategySchema } from "./2_module/Strategy.ts";

//
//
// IMPORTS
//
//

// ENUMS
import { ModuleInstallationEnum } from "./0_root/BaseModuleEntity.ts";

// ENTITIES
import { RuntimeEntity, RuntimeSchema } from "./1_repo/Runtime.ts";
import { ModuleEntity, ModuleSchema } from "./2_module/Module.ts";
// import { UserEntity, UserSchema } from "./1_repo/User.ts";
// import { ServiceEntity, ServiceSchema } from "./2_module/Service.ts";
// import { DomainEntity, DomainSchema } from "./2_module/Domain.ts";

export const enums = {
  installation: ModuleInstallationEnum,
};

export const entities = {
  runtime: RuntimeEntity,
  module: ModuleEntity,
  //   user: UserEntity,
  //   domain: DomainEntity,
  //   service: ServiceEntity,
  //   strategy: StrategyEntity,
};

export const database = [RuntimeSchema, ModuleSchema];

export const repositories = {};

export default { enums, entities, database, repositories };
