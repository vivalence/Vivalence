// TODO rename to BaseRuntimeEntity
import { EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseSchema, BaseEntity } from "../0_root/BaseEntity.ts";

export class BaseModuleRepository extends Array {
  "#entity": any; // "#entity": AnnotationEntity;
  public async add(entity: any) {
    super.push(entity);
  }
  public async create(data: any) {
    super.push(new this["#entity"](data));
    // if (data.id) return await em.findOne(this.entityName, data.id);
    // if (!data.slug) data.slug = hash([data.scope, data.assertion]);
    // const entity = await em.findOne(this.entityName, { slug: data.slug, runtime: data.runtime });
    // if (entity) return entity;
    // return em.create(this.entityName, data);
  }
  public delete(entity: any) {
    //
  }
  // public async find(data: any) {}
  // public async findOne(data: any) {}
}

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
  config: any & Opt = {};
  installation: ModuleInstallationEnum & Opt = ModuleInstallationEnum.PENDING;
  get installed() {
    return this.installation === ModuleInstallationEnum.INSTALLED;
  }
  // install: Function
  // boot?: Function
  // traits
  //
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
