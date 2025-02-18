import { entities as Entities } from "@vivalence/schema";

import applySchema from "./schema/index.js";
// import methods from "./methods/boot.js";
// import curriculum from "./curriculum/index.js";

class ClassifierSystem {}

class RemedySystem {}
// remedy could be a key implemented by Rule.

// this.remedies = new Map({}); // exports a tree of handlers.
// the domain hooks these into ??? or the ontology? how does this system get managed and provided?  needs hooks. needs paths.

// i love this architecture.
async function boot(runtime) {
  // nodes are computed to tree. rules used to construct schema. and both flow into assertions and remedy.

  let ontology = {
    classifier: new ClassifierSystem(),
    remedy: new RemedySystem(), // sub-systems
    rules: new Set(), // <Entities.rule[]>
    nodes: new Map(), // <Entities.node[]>
  };

  ontology = applySchema(ontology);

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

  // ontology.rules.find({ entity: "unit", branch: "adj", traits: ["schematic"] });

  async function assertFactory({ nodes, rules }, ctx) {
    const assertions = {
      // entities: { unit: () => {}, tag: () => {} },
      topography: {}, // applies only to units. separated by topological traits, in effect by pos.
    };

    // for node<Node> of nodes.where(traits [topological ancestor])
    //     assertions.topography[node.slug] = (node, ctx) => (entity, processors =['schematic', 'relational']) =>{}

    return assertions;
    // API
    // assert.entities.unit(entity); ?? not really used i guess.
    // assert.entities.tags(entity, ['schematic']) //
    // assert.topography.definite(entity, ['schematic', 'relational']) // default is both. // relational checks
    // assert.topography.definite(entity) // checks annotation,
  }

  const assert = assertFactory(ontology, ctx);

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

// features. maybe its not topology but feature.
export { manifest, boot, curriculum };

// assert...(Unit|Tag) assert.relations.tag() // scoped implementation of assert.relations('Tag"') assert.relations.unit()
// assert.interfaces.signal()
