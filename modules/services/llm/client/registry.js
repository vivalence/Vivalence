export default class LLMRegistry {
  constructor() {
    this.providers = {};
    this.profiles = {};
  }

  registerProvider(name, clientFn) {
    this.providers[name] = clientFn;
    return this;
  }

  registerProfile(name, config) {
    this.profiles[name] = {
      provider: config.provider,
      model: config.model,
      dimensions: config.dimensions || {},
      params: config.params || {},
    };
    return this;
  }

  getProvider(name) {
    const provider = this.providers[name];
    if (!provider) throw new Error(`Provider not found: ${name}`);
    return provider;
  }

  getProfile(name) {
    const profile = this.profiles[name];
    if (!profile) throw new Error(`Profile not found: ${name}`);
    return { name, ...profile };
  }

  getAllProfiles() {
    return Object.entries(this.profiles).map(([name, profile]) => ({
      name,
      ...profile,
    }));
  }

  getProfilesByDimension(dimension, minValue = 0) {
    return this.getAllProfiles()
      .filter((profile) => (profile.dimensions[dimension] || 0) >= minValue)
      .sort(
        (a, b) =>
          (b.dimensions[dimension] || 0) - (a.dimensions[dimension] || 0),
      );
  }

  findProfileByDimensions(dimensions) {
    let bestMatch = null;
    let bestScore = -Infinity;

    Object.entries(this.profiles).forEach(([name, profile]) => {
      const score = this.calculateSimilarity(dimensions, profile.dimensions);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { name, ...profile };
      }
    });

    if (!bestMatch) throw new Error("No matching profile found for dimensions");
    return bestMatch;
  }

  calculateSimilarity(target, profileDims) {
    let dotProduct = 0;
    let targetMagnitude = 0;
    let profileMagnitude = 0;

    const allDimensions = new Set([
      ...Object.keys(target),
      ...Object.keys(profileDims),
    ]);

    for (const dim of allDimensions) {
      const targetVal = target[dim] || 0;
      const profileVal = profileDims[dim] || 0;

      dotProduct += targetVal * profileVal;
      targetMagnitude += targetVal * targetVal;
      profileMagnitude += profileVal * profileVal;
    }

    if (targetMagnitude === 0 || profileMagnitude === 0) return 0;

    return (
      dotProduct / (Math.sqrt(targetMagnitude) * Math.sqrt(profileMagnitude))
    );
  }

  resolveSelection({ profile, dimensions, provider, model }) {
    if (profile) {
      return this.getProfile(profile);
    }

    if (dimensions) {
      return this.findProfileByDimensions(dimensions);
    }

    if (provider && model) {
      return { provider, model, params: {} };
    }

    throw new Error("Must specify profile, dimensions, or provider+model");
  }
}
