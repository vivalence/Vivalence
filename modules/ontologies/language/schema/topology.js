import topology from "./topology/index.js";

export default (ontology) => {
  ontology = Object.entries(topology).reduce((ontology, [key, value]) => {
    // nodes is Map // rules is set.

    const nodeEntity = new NodeEntity(preprocessNode(value.meta));
    ontology.nodes.set(key, nodeEntity);

    const ruleEntity = new RuleEntity(preprocessNode(value[key]));
    ontology.rules.push(ruleEntity);

    return acc;
  }, ontology);

  return schema;
};
// meta key name missmatch is technical debt. ought be ontology.rules.
// if (value.meta) acc.ontology[key] = value.meta;

// required because i am too lazy to reformat files.
async function preprocessRule(rule) {
  // extract slug from $id
  // can read schema.entities.unit
  // outputs valid json schema.
  // add a hash and symbol
}

async function preprocessNode(node) {
  // barely anything required, besides missing keys and defaults.
  // add a hash and symbol
}
