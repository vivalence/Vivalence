export const remedyRegistry = new Map();

function createKey(path, violation) {
  return JSON.stringify([...path, violation]);
}

export function registerHandlers(module, parentPath = []) {
  function registerRemedy(path, violation, handler) {
    const key = createKey(path, violation);
    remedyRegistry.set(key, handler);
  }

  const path = [...parentPath, ...module.path];
  if (module.handlers) {
    for (const [violation, handler] of Object.entries(module.handlers)) {
      registerRemedy(path, violation, handler);
    }
  }
  if (module.children) module.children.forEach((child) => registerHandlers(child, path));
}

export async function handleValidationError(error, locals) {
  function findHandler(path, violation) {
    let handler = remedyRegistry.get(createKey(path, violation));
    if (handler) {
      return handler;
    }

    for (let i = path.length - 1; i >= 0; i--) {
      const subPath = [...path.slice(0, i), "*"];
      handler = remedyRegistry.get(createKey(subPath, violation));
      if (handler) {
        return handler;
      }
    }
    return null;
  }

  const handler = findHandler(error.path, error.violation);

  if (handler) {
    console.log(
      "remedy issue:",
      error.context.unit && error.context.unit.id,
      error.violation,
      error.path,
      // JSON.stringify(error.context.unit.data.annotation)
    );
    return await handler(error, locals);
  } else {
    throw new Error(`No handler for path: ${error.path} violation: ${error.violation}`);
  }
}
