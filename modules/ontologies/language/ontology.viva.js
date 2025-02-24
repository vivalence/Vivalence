// import methods from "./methods/boot.js";
// import curriculum from "./curriculum/index.js";
import {
  AnnotationRepository,
  TopographyRepository,
  ConstraintRepository,
} from "@vivalence/schema";

// classifier:
// remedy:
// issues:

import asserter from "./lib/asserter.js";
import topology from "./topology/index.js";

async function boot(runtime) {
  let ontology = {
    // classifier: new ClassifierSystem(),
    // remedy: new RemedySystem(), // sub-systems
    annotations: new AnnotationRepository(),
    topographies: new TopographyRepository(),
    constraints: new ConstraintsRepository(),
    issues: new IssueRepository(),
  };

  ontology = topology(ontology);

  for (const Curriculum of runtime.Modules.Curricula) {
    ontology = Curriculum.topology(ontology);
  }

  const assertions = { topography: {} };
  const assert = asserter(ontology, assertions);

  runtime.assert = assert;
  runtime.ontology = ontology;

  return runtime;
}

const manifest = {
  type: "ontology",
  slug: "language",
  name: "Langauge after Universal Dependencies",
  version: "0.0.8",
  // traits:['memetic']
};

const curriculum = {};

export { manifest, boot, curriculum };

// ontology.schema.get = (path, required) => {
//   const requestedSchema = Array.from(ontology.rules)
//     .filter((rule) => rule.traits.includes("SCHEMATIC"))
//     .find((rule) => rule.path.join() === path.join());
//   return requestedSchema.data.SCHEMATIC.json;
// };

// // returns Issue[]
// const tree = new Map();
// nodes are computed to tree. rules used to construct schema. and both flow into assertions and remedy.
// tree = buildTree(tree, ontology);
// // 4. Using multiple data types as keys
// const map4 = new Map([
//     ["pos", NodeEntity({slug:"pos"})],
//     ["", NodeEntity({slug:"pos"})],
//     [NodeEntity({slug: "pos"}), [
// 	Node(pos:noun),
// 	Node(pos:verb),
//     ]],
// ]);

// assert factory API
// assert.entities.unit(entity); ?? not really used i guess.
// assert.entities.tags(entity, ['schematic']) //
// assert.topography.definite(entity, ['schematic', 'relational']) // default is both. // relational checks
// assert.topography.definite(entity) // checks annotation,

// assert...(Unit|Tag) assert.relations.tag() // scoped implementation of assert.relations('Tag"') assert.relations.unit()
// assert.interfaces.signal()

// runtime.schema = {
//   entities: {
//     // unit: {}, tag: {}
//   },
//   topography: {
//     // must be mapable to domain.entities[MikroEntity]
//     // computed children of topological parents: // adj={}, noun={}, verb={}, adv={}
//     // for child<Node> of nodes.ANCESTOR.where(trait topological) do schema.topography[child.] = {}
//   },
//   // interfaces: {
//   //   // signal: {}, // used by classifier.
//   //   // games and memory will nee to make their own types.
//   // },
// };
// now i need to construct the schema.
// no kinda dont.
// assert can be constructed from a query engine and factories.
// schema.entities&topography is the critical one. if i can solve that with query, all the better.
// but i think that would require the schema rules for unit to be applied as the base for typography.
// and i dont know if i can compute that at methodtime or if that requires preconstruction on boot.
// i will try either

class ClassifierSystem {}

class RemedySystem {} // this.remedies = new Map({}); // exports a tree of handlers.
// the domain hooks these into ??? or the ontology?
// how does this system get managed and provided?  needs hooks. needs paths.
