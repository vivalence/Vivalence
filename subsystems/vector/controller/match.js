export function match(vector, signal) {
  for (const [pattern, effect] of vector.effects.entries()) {
    const match = pattern.match(signal);
    if (match) return [match, null, effect];
  }

  for (const [pattern, trajectory] of vector.trajectories.entries()) {
    const match = pattern.match(signal);
    if (match) return [match, trajectory, null];
  }

  return [null];
}
