const createBaseEmitter = () => {
  const listeners = new Map();
  const middlewares = new Map();

  const executeMiddlewareChain = async (ctx, scope) => {
    const relevantMiddlewares = [
      ...(middlewares.get(null) || []),
      ...(middlewares.get(scope) || []),
    ];
    let index = 0;
    const next = async () => {
      if (index < relevantMiddlewares.length) {
        await relevantMiddlewares[index++](ctx, next);
      }
    };
    await next();
  };

  return {
    on: (event, listener) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(listener);
    },
    emit: async (event, ...args) => {
      const ctx = { event, data: args[0] || {} };
      const [scope] = event.split(":");
      await executeMiddlewareChain(ctx, scope);
      const eventListeners = listeners.get(event) || new Set();
      for (const listener of eventListeners) {
        await listener(ctx);
      }
    },
    use: (middleware, scope = null) => {
      if (!middlewares.has(scope)) middlewares.set(scope, []);
      middlewares.get(scope).push(middleware);
    },
  };
};

const createSecurityDecorator = (baseEmitter, rules) => {
  const checkSecurity = (emitterScope, listenerScope) =>
    emitterScope === listenerScope || rules[listenerScope]?.includes(emitterScope);

  const secureEmitter = {
    on: (event, listener) => {
      baseEmitter.on(event, (ctx) => {
        const [emitterScope, emitterEvent] = ctx.event.split(":");
        const [listenerScope, listenerEvent] = event.split(":");
        if (!listenerScope || checkSecurity(emitterScope, listenerScope)) {
          listener(ctx);
        }
      });
    },
    emit: (event, ...args) => baseEmitter.emit(event, ...args),
    use: (middleware, scope = null) => baseEmitter.use(middleware, scope),
    scope: (scope) => ({
      on: (event, listener) => secureEmitter.on(event, listener),
      emit: (event, ...args) => secureEmitter.emit(`${scope}:${event}`, ...args),
      use: (middleware) => secureEmitter.use(middleware, scope),
    }),
  };

  return secureEmitter;
};

const createSecureEventEmitter = () => {
  const baseEmitter = createBaseEmitter();
  const rules = {
    "@games": [],
    "@strategy": ["@ontology", "@games"],
    "@corpus": ["@ontology", "@games", "@strategy"],
    "@ontology": ["@corpus", "@games"],
  };
  return createSecurityDecorator(baseEmitter, rules);
};

export default createSecureEventEmitter;
