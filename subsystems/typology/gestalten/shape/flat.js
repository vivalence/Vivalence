import { steer } from "@vivalence/typology";

export function flat(vector, execute) {
  const result = [];
  steer.trie.survey(vector, (node) => {
    if (node.effect !== undefined) {
      result.push({
        nature: node.signature?.nature,
        signature: node.signature,
        invoke: node.invoke,
      });
    }
    return node;
  }, execute);
  return result;
}
