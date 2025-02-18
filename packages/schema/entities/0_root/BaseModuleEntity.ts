import { EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseSchema, BaseEntity } from "../0_root/BaseEntity.ts";

export enum ModuleInstallationEnum {
  PENDING = "PENDING",
  INSTALLED = "INSTALLED",
  FAULTY = "FAULTY",
}

export class BaseModuleEntity extends BaseEntity {
  slug: string & Opt = "";
  version: string & Opt = "0.0.0";
  name?: string;
  description?: string;
  config: any & Opt = "{}";
  installation: ModuleInstallationEnum & Opt = ModuleInstallationEnum.PENDING;
  get installed() {
    return this.installation === ModuleInstallationEnum.INSTALLED;
  }
}

export const BaseModuleSchema = new EntitySchema<BaseModuleEntity, BaseEntity>({
  class: BaseModuleEntity,
  extends: BaseSchema,
  name: "BaseModuleEntity",
  abstract: true,
  properties: {
    slug: { type: String },
    version: {
      type: String,
      default: "0.0.0",
      // lazy: true
    },
    name: { type: String, nullable: true },
    description: { type: String, nullable: true },
    config: {
      type: "json",
      onCreate: () => ({}),
      defaultRaw: `"{}"`,
    },

    installation: {
      enum: true,
      items: () => ModuleInstallationEnum,
      default: ModuleInstallationEnum.PENDING,
      defaultRaw: `${ModuleInstallationEnum.PENDING}`,
      onCreate: () => ModuleInstallationEnum.PENDING,
    },

    installed: { type: "method", persist: false, getter: true, getterName: "installed" },
  },
});
