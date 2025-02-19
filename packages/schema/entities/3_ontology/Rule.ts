import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseEntity } from "../0_root/BaseEntity.ts";

// might be computed or defined by domain.
// export enum EntityTypeEnum {
//   UNIT = "unit",
//   TAG = "tag",
//   // DEPENDENCY = "dependency", TACTIC, GAME
// }

export enum RuleTraitsEnum {
  SCHEMATIC = "schematic",
  RELATIONAL = "relational",
}

export class RuleEntity extends BaseEntity {
  // slughash: string;
  traits: RuleTraitsEnum[] & Opt = [];
  // topology required, nullable.
  // if topology===null && trait[schematic] => is entity schema rule..
  topology: string & Opt; // or Null
  // branch of topology, ie pos:adj
  // must guarantee lack of collision between topologies and entities
  path: string[] & Opt;
  // path can be ${entity} ${togography}
  // path can be ${topology} ${annotation}

  data: any & Opt = "{}";

  constructor(rule = { topology: "", traits: [], path: [], data: {} }) {
    super();
    this.topology = rule.topology;
    this.traits = rule.traits;
    this.path = rule.path;
    this.data = rule.data;
    // this.slughash = this.hash();
  }
  // hash() {
  //   // hash: entity,traits,topology,branch,data
  //   return "123456789abcxyz";
  // }
}

// entity repository enforces uniqueness by hash.
// i love mikro.

// export const RuleSchema = new EntitySchema<RuleEntity, BaseModuleEntity>({class: RuleEntity, extends: BaseModuleSchema, tableName: "Rule", uniques: [{ properties: ["slug", "runtime"] }], properties: {runtime: {kind: "m:1", entity: () => RuntimeEntity, fieldName: "runtime", updateRule: "cascade", deleteRule: "cascade",}, entity: {enum: true, items: () => EntityTypeEnum,}, type: {enum: true, items: () => RuleTypeEnum,}, traits: {columnType: "json", defaultRaw: `"[]"`, enum: true, array: true, items: () => RuleTraitEnum, default: [],}, topology: { type: "string", nullable: true }, branch: { type: "string", nullable: true }, data: { type: "json" },},});

// const adjSchemaRule = new RuleEntity({
//   // entity: "UNIT",
//   traits: ["schematic"],
//   path: ["unit", "ajd"],
//   // topology required, nullable.
//   // if topology===null && trait[schematic] => is entity schema rule..
//   // topology: "pos",
//   // branch of topology, ie pos:adj
//   // branch: "adj",
//   data: {SCHEMATIC: {}},
// });

// console.log(adjSchemaRule);

// Relation rule for adjective
// const adjRelationRule = new RuleEntity({entity: EntityTypeEnum.UNIT, type: RuleTypeEnum.RELATION, traits: [OntologyTraitEnum.RELATIONAL], topology: 'pos', branch: 'adj', data: {RELATIONAL: [{ type: 'required', branch: 'gender' }, { type: 'unique', branch: 'number' }]}});

// combining the nodes with the rules via entity and topology is killer
// <OntologyRule>{entity: "unit" topology: "pos" branch: "adj" traits: ["schematic"] data.schema: {type: "obj", properties:{}}}
// <OntologyRule>{entity: "unit" topology: "pos" branch/path?: "adj" traits: ["relational"] data.relations: [required:'',unique:""]}
// <OntologyRule>. {entity: "unit" topology: "pos" branch: "adj" traits: ["schematic"] data.schema: {type: "obj", properties:{}}}
// [<OntologyRule>{traits: ["schematic"] entity: "unit" topology: "pos" branch: "adj" data.schema: {type: "obj", properties:{}}}]
// OntologyRules:{entity: "unit" topology: "pos" branch: "adj" traits: ["schematic"] data.schema: {type: "obj", properties:{}}
// } {entity: "unit" topology: "pos" branch/path?: "adj" traits: ["relational"] data.relations: [required:'',unique:""]
// } {entity: "tag" topology: null traits: ["schematic"] data.schema: {type: "Object" properties: {slug: {type: "string", description: "",},}
// selfcontaining memetic systems for the win.
