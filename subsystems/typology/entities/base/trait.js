export function defineTrait(name, spec = {}) {
  const { methods = {}, hooks = {}, defaults = {}, properties = {} } = spec;
  return { name, defaults, methods, hooks, properties };
}

export function applyTraits(EntityClass, traits) {
  for (const trait of traits) {
    const descriptors = Object.getOwnPropertyDescriptors(trait.methods);
    for (const [key, descriptor] of Object.entries(descriptors)) {
      Object.defineProperty(EntityClass.prototype, key, descriptor);
    }
  }
}

export function mergeProperties(traits) {
  const merged = {};
  for (const trait of traits) {
    Object.assign(merged, trait.properties);
  }
  return merged;
}

export function composeSubscriber(EntityClass, traits) {
  const hookMap = {};
  for (const trait of traits) {
    for (const [hookName, handler] of Object.entries(trait.hooks)) {
      if (!hookMap[hookName]) hookMap[hookName] = [];
      hookMap[hookName].push(handler);
    }
  }
  return class ComposedSubscriber {
    getSubscribedEntities() {
      return [EntityClass];
    }
    constructor() {
      for (const [hookName, handlers] of Object.entries(hookMap)) {
        this[hookName] = ({ entity }) => {
          for (const handler of handlers) handler(entity);
        };
      }
    }
  };
}

export const trait = {
  define: defineTrait,
  apply: applyTraits,
  properties: mergeProperties,
  subscribe: composeSubscriber,
};
