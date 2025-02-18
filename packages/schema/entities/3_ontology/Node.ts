import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseModuleEntity, BaseModuleSchema } from "../0_root/BaseModuleEntity.ts";

export enum NodeTraitEnum {
  ANCESTOR = "ancestor",
  TOPOLOGICAL = "topological",
  CATEGORICAL = "categorical",

  // FUTURETENSE CONTINUOUS = "continuous", DISCRETE = "discrete",
}

export class NodeEntity extends BaseModuleEntity {
  // slug
  traits: NodeTraitEnum[] & Opt = [];
  data: any & Opt = "{}";

  constructor(rule = {}) {
    super();
    Object.assign(this, rule);
  }
}

// export const NodeSchema = new EntitySchema<NodeEntity, BaseModuleEntity>({class: NodeEntity, extends: BaseModuleSchema, tableName: "Node", uniques: [{ properties: ["slug", "runtime"] }], properties: {runtime: {kind: "m:1", entity: () => RuntimeEntity, fieldName: "runtime", updateRule: "cascade", deleteRule: "cascade",}, parent: {kind: "m:1", entity: () => NodeEntity, fieldName: "parent", inversedBy: "children", nullable: true,}, children: {kind: "1:m", entity: () => NodeEntity, mappedBy: (node) => node.parent,}, traits: {columnType: "json", defaultRaw: `"[]"`, enum: true, array: true, items: () => NodeTraitEnum, default: [],}, data: { type: "json" },},});
const posNode = new NodeEntity({
  slug: "pos",
  name: "Part of Speech",
  description: "High level grammatical grouping. Used for annotation.",
  traits: [NodeTraitEnum.ANCESTOR, NodeTraitEnum.TOPOLOGICAL],
  data: {
    ANCESTOR: [
      { slug: "pos:noun", title: "Nouns, xxx" },
      { slug: "pos:verb", title: "Verbs zyz." },
    ],
  },
});

const definitenessNode = new NodeEntity({
  slug: "definite",
  title: "Definiteness",
  description: "Indicates whether a noun is definite or indefinite",
  traits: [NodeTraitEnum.ANCESTOR, NodeTraitEnum.CATEGORICAL],
  data: {
    ANCESTOR: [
      { slug: "def", title: "Definite" },
      { slug: "ind", title: "Indefinite" },
    ],
  },
});
// console.log(definitenessNode, posNode);

// making rules into an extendable database-aesque type is very very interesting.
// {<OntologyNode>trait:"ancestor", "branch", "leaf", "descendent", slug: "definite", children: [{ enum: "def", title: "Definite", description: "" }, { enum: "ind", title: "Indefinite", description: "" },],}
// [<OntologyNode>{slug: "definite", traits:["ancestor"], // implicit categorical trait. could be numeric. categoric guarantees the child prop. children: [{ slug: "def", name: "Definite", description: "" }, { slug: "ind", name: "Indefinite", description: "" },],}]
// [<OntologyNode>{slug: "pos", traits:["topological"], children: [{ slug: "def", name: "Definite", description: "" }, { slug: "ind", name: "Indefinite", description: "" },],}]
