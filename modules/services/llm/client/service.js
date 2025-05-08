import LLMRegistry from "./registry.js";
import { withRetry } from "./lib.js";

function createLLMService(config = {}) {
  const registry = new LLMRegistry();
  const retryDefaults = {
    maxRetries: config.maxRetries || 3,
    initialDelay: config.initialDelay || 1000,
    maxDelay: config.maxDelay || 10000,
  };

  return {
    registerProvider(name, clientFn) {
      registry.registerProvider(name, clientFn);
      return this;
    },

    registerProfile(name, config) {
      registry.registerProfile(name, config);
      return this;
    },

    getProfile(name) {
      return registry.getProfile(name);
    },

    getAllProfiles() {
      return registry.getAllProfiles();
    },

    getProfilesByDimension(dimension, minValue) {
      return registry.getProfilesByDimension(dimension, minValue);
    },

    findProfileByDimensions(dimensions) {
      return registry.findProfileByDimensions(dimensions);
    },

    prompt({
      prompt,
      schema,
      profile,
      dimensions,
      provider,
      model,
      params = {},
      retry = {},
    }) {
      const selection = registry.resolveSelection({
        profile,
        dimensions,
        provider,
        model,
      });
      const providerFn = registry.getProvider(selection.provider);

      return withRetry(
        async () => {
          return await providerFn({
            prompt,
            schema,
            provider: {
              model: selection.model,
              ...selection.params,
              ...params,
            },
          });
        },
        { ...retryDefaults, ...retry },
      );
    },

    getModel(selection) {
      const resolved = registry.resolveSelection(selection);

      return {
        name: resolved.provider,
        // apiKey: `$${resolved.provider.toUpperCase()}_API_KEY`,
        config: {
          model: resolved.model,
          ...resolved.params,
        },
      };
    },
  };
}

export default createLLMService;
