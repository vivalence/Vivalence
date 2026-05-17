export default function resolve(trajectory, positional) {
  if (positional[0]?.includes("/")) {
    return { signal: positional[0], argv: positional.slice(1) }
  }

  const segments = []
  let position = trajectory
  const argv = [...positional]

  while (argv.length > 0) {
    const candidate = argv[0]
    const matchedEffect = lookupEffect(position, candidate)

    if (matchedEffect) {
      segments.push(argv.shift())
      break
    }

    const matchedTrajectory = lookupTrajectory(position, candidate)
    if (!matchedTrajectory) break

    segments.push(argv.shift())
    position = matchedTrajectory
  }

  return { signal: segments.join("/"), argv }
}

function lookupEffect(vector, segment) {
  for (const pattern of vector.effects.keys()) {
    if (matches(pattern, segment)) return true
  }
  return false
}

function lookupTrajectory(vector, segment) {
  for (const [pattern, child] of vector.trajectories) {
    if (matches(pattern, segment)) return child
  }
  return null
}

function matches(pattern, segment) {
  if (!pattern?.nature) return false
  const literal = pattern.nature.startsWith("/") ? pattern.nature.slice(1) : pattern.nature
  return literal === segment
}
