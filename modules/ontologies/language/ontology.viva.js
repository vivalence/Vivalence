import schema from "./schema/index.js";
import methods from "./methods/boot.js";
import curriculum from "./curriculum/index.js";

// i love this architecture.
async function boot(runtime) {
  // nodes are computed to tree. rules used to construct schema. and both flow into assertions and remedy.
  // runtime.ontology = {classifier:{}, remedy:{},} // sub-systems
  // runtime.ontology = {rules:[], nodes:[],}; // Entities <Both Roles and Nodes recieve special handlers.
  // ie both rules and nodes are entity types. and thus can be extended in type and as a group through mikro repositories.
  // are stored in the database and on the ontology in parallel..

  // runtime.schema = {interfaces:{}, signals:{}, entities:{}, units:{}, topology:{},}, };
  // runtime.schema.entities: {}, // must be mapable to domain.entities[MikroEntity]
  // runtime.schema.entities = {unit={}, tag={}, dependency={},}  //
  // runtime.schema.units: {}, // can be computed on module boot
  // runtime.schema.units = { adj={}, noun={}, verb={}, adv={} } // children of topological parents.

  // runtime.assert = {unit: () => {}, tag: () => {}, signal: ()=>{}, interface: () => {},};
  // assert.entity.unit();
  // assert.interface.signal()
  // assert.units.definite()
  // assert.topology.definite()
  // assert.relations(Unit|Tag)
  // assert.relations.tag() // scoped implementation of assert.relations('Tag"')
  // assert.relations.unit()

  // combining the nodes with the rules via entity and topology is killer
  // <OntologyRule>{entity: "unit" topology: "pos" branch: "adj" traits: ["schematic"] data.schema: {type: "obj", properties:{}}}
  // <OntologyRule>{entity: "unit" topology: "pos" branch/path?: "adj" traits: ["relational"] data.relations: [required:'',unique:""]}
  //  <OntologyRule>. {entity: "unit" topology: "pos" branch: "adj" traits: ["schematic"] data.schema: {type: "obj", properties:{}}}
  // [<OntologyRule>{traits: ["schematic"] entity: "unit" topology: "pos" branch: "adj" data.schema: {type: "obj", properties:{}}}]
  // OntologyRules:{entity: "unit" topology: "pos" branch: "adj" traits: ["schematic"] data.schema: {type: "obj", properties:{}}
  // } {entity: "unit" topology: "pos" branch/path?: "adj" traits: ["relational"] data.relations: [required:'',unique:""]
  // } {entity: "tag" topology: null traits: ["schematic"] data.schema: {type: "Object" properties: {slug: {type: "string", description: "",},}
  // selfcontaining memetic systems for the win.
  // runtime.ontology.rules.find({ entity: "unit", branch: "adj", traits: ["schematic"] });
  // making rules into an extendable database-aesque type is very very interesting.
  // {<OntologyNode>trait:"ancestor", "branch", "leaf", "descendent", slug: "definite", children: [{ enum: "def", title: "Definite", description: "" }, { enum: "ind", title: "Indefinite", description: "" },],}
  // [<OntologyNode>{slug: "definite", traits:["ancestor"], // implicit categorical trait. could be numeric. categoric guarantees the child prop. children: [{ slug: "def", name: "Definite", description: "" }, { slug: "ind", name: "Indefinite", description: "" },],}]
  // [<OntologyNode>{slug: "pos", traits:["topological"], children: [{ slug: "def", name: "Definite", description: "" }, { slug: "ind", name: "Indefinite", description: "" },],}]

  runtime.remedy = {}; // exports a tree of handlers.
  // the domain hooks these into ??? or the ontology? how does this system get managed and provided?  needs hooks. needs paths.

  return runtime;
}

const manifest = {
  type: "ontology",
  slug: "language",
  name: "Langauge after Universal Dependencies",
  version: "0.0.8",
};

// features. maybe its not topology but feature.
export { manifest, schema, boot, curriculum };
