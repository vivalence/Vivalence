// @beef suboptimal, uninspired
export function strip(vector) {
  const leaves = [];
  const branches = {};
  for (const [pattern] of vector.effects) {
    const leaf = { nature: pattern.nature };
    if (pattern.input  !== undefined) leaf.input  = pattern.input;
    if (pattern.output !== undefined) leaf.output = pattern.output;
    leaves.push(leaf);
  }
  for (const [pattern, sub] of vector.trajectories) {
    branches[pattern.nature] = strip(sub);
  }
  return { leaves, branches };
}
