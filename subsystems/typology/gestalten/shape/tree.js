import { steer } from "@vivalence/typology";

export function tree(vector, execute) {
  const root = steer.trie.survey(vector, (node) => {
    if (node.effects !== undefined) {
      return {
        nature: node.signature.nature,
        signature: node.signature,
        children: [...node.effects, ...node.trajectories],
        path: node.path,
      };
    }
    return {
      nature: node.signature.nature,
      signature: node.signature,
      invoke: node.invoke,
      path: node.path,
    };
  }, execute);
  return [...root.effects, ...root.trajectories];
}
