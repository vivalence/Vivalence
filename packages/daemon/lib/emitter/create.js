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
        await listener(ctx.event.body, ctx);
      }
    },
    use: (middleware) => {
      middlewares.push(middleware);
    },
  };
};

const createInSecurityDecorator = (baseEmitter) => {
  const secureEmitter = {
    ...baseEmitter,
    on: (event, listener, listenerScope) => {
      const [emitterScope, emitterEvent] = event.split(":");
      baseEmitter.on(event, listener);
    },
    scope: () => ({
      on: (event, listener) => secureEmitter.on(event, listener),
      emit: (event, body) => secureEmitter.emit(event, body),
    }),
  };

  return secureEmitter;
};

// this used to be something. i lobotomized it. might rebuild later. keeping scope.
const createSecureEventEmitter = () => {
  const baseEmitter = createBaseEmitter();
  return createInSecurityDecorator(baseEmitter);
};

export default createSecureEventEmitter;
