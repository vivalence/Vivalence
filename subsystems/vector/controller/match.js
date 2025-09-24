export function match(vector, signal) {
  let position = [null, null, null];

  for (const [pattern, trajectory] of vector.trajectories.entries()) {
    const match = pattern.match(signal);
    if (match) position = [match, trajectory, null];
  }

  for (const [pattern, effect] of vector.effects.entries()) {
    const match = pattern.match(signal);
    if (match && position)
      position = [{ ...position[0], ...match }, position[1], effect];
    else if (match) position = [match, null, effect];
  }

  return position;
}
