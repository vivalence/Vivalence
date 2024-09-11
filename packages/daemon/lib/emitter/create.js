const executeMiddlewareChain = async (ctx, middlewares) => {
  let index = 0;
  const next = async () => {
    if (index < middlewares.length) {
      await middlewares[index++](ctx, next);
    }
  };
  await next();
};

const createBaseEmitter = () => {
  const listeners = new Map();
  const middlewares = new Array();

  return {
    on: (event, listener) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(listener);
    },
    emit: async (event, body) => {
      const ctx = { event: { name: event, body } };
      await executeMiddlewareChain(ctx, middlewares);
      const eventListeners = listeners.get(event) || new Set();
      for (const listener of eventListeners) {
        await listener(ctx);
      }
    },
    use: (middleware) => {
      middlewares.push(middleware);
    },
  };
};

const createSecurityDecorator = (baseEmitter, rules) => {
  const checkSecurity = (emitterScope, listenerScope) =>
    emitterScope === listenerScope || rules[listenerScope]?.includes(emitterScope);

  const secureEmitter = {
    ...baseEmitter,
    on: (event, listener, listenerScope) => {
      const [emitterScope, emitterEvent] = event.split(":");
      if (checkSecurity(emitterScope, listenerScope)) {
        baseEmitter.on(event, listener);
      } else {
        console.warn("[INVALID EVENTBUS LISTENER] - event, listener", event, listenerScope);
      }
    },
    scope: (scope) => ({
      on: (event, listener) => secureEmitter.on(event, listener, scope),
      emit: (event, body) => secureEmitter.emit(`${scope}:${event}`, body),
    }),
  };

  return secureEmitter;
};

const createSecureEventEmitter = () => {
  const baseEmitter = createBaseEmitter();
  // this might be fairly meaningless.
  const rules = {
    // @emitter:@permitted-consumer - ontology can be consumed by corpus domain and games
    "@corpus": ["@domain", "@ontology", "@game", "@strategy", "@tactic"],
    "@ontology": ["@corpus", "@domain", "@game", "@strategy", "@tactic"],
    "@domain": ["@corpus", "@ontology", "@game", "@strategy", "@tactic"],
    "@game": [],
    "@strategy": ["@domain", "@corpus"],
    "@tactic": ["@corpus"],
  };
  return createSecurityDecorator(baseEmitter, rules);
};

export default createSecureEventEmitter;
