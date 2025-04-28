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
export { DomainEntity, DomainSchema } from "./2_module/Domain.ts";
export { ServiceEntity, ServiceSchema } from "./2_module/Service.ts";
export { StrategyEntity, StrategySchema } from "./2_module/Strategy.ts";

// const database = ;

// export default { database };
//
//
// IMPORTS
//
//

// ENUMS
// import { ModuleInstallationEnum } from "./0_root/BaseModuleEntity.ts";

// // ENTITIES
// // import { BaseModuleEntity, BaseModuleSchema } from "./0_root/BaseModuleEntity.ts";
// import { UserEntity, UserSchema } from "./1_repo/User.ts";
// import { RuntimeEntity, RuntimeSchema } from "./1_repo/Runtime.ts";
// import { ServiceEntity, ServiceSchema } from "./2_module/Service.ts";
// import { DomainEntity, DomainSchema } from "./2_module/Domain.ts";

// // export const enums = {
//   ModuleInstallation: ModuleInstallationEnum,
// };

// export const entities = {
//   // base: BaseEntity,
//   // data: BaseDataEntity,
//   // module: BaseModuleEntity,
//   user: UserEntity,
//   runtime: RuntimeEntity,
//   domain: DomainEntity,
//   service: ServiceEntity,
//   // strategy: StrategyEntity,
// };

// // export const schemas = [
// //    BaseModuleSchema,
// //   UserSchema,
// //   RuntimeSchema,
// //   DomainSchema,
// //   ServiceSchema,
// //   // StrategySchema,
// // ];
