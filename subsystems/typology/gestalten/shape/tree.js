import { steer } from "@vivalence/typology";

export function tree(vector, execute) {
  const root = steer.trie.survey(vector, (node) => {
    const shaped = { nature: node.signature?.nature, signature: node.signature, path: node.path };
    if (node.trajectories.length) shaped.children = node.trajectories;
    if (node.invoke !== undefined) shaped.invoke = node.invoke;
    return shaped;
  }, execute);
  return root.children ?? [];
}
