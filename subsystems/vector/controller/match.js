export function greedy(vector, signal) {
  for (const [pattern, effect] of vector.effects.entries()) {
    const match = pattern.apply(signal);
    if (match) return [[match, null, effect]];
  }

  for (const [pattern, trajectory] of vector.trajectories.entries()) {
    const match = pattern.apply(signal);
    if (match) return [[match, trajectory, null]];
  }

  return [];
}

export function scope(vector, signal) {
  let scope = [];

  for (const [pattern, trajectory] of vector.trajectories.entries()) {
    const match = pattern.apply(signal);
    if (match) scope.push([match, trajectory, null]);
  }

  for (const [pattern, effect] of vector.effects.entries()) {
    const match = pattern.apply(signal);
    if (match) scope.push([match, null, effect]);
  }

  return scope;
}
