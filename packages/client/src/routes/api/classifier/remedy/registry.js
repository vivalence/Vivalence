export const remedyRegistry = new Map();

function createKey(path, type) {
    return JSON.stringify({ path, type });
}

export function registerRemedy(path, type, handler) {
    const key = createKey(path, type);
    remedyRegistry.set(key, handler);
}

function registerHandlers(module, parentPath = []) {
    const path = [...parentPath, ...module.path];

    for (const [type, handler] of Object.entries(module.handlers)) {
        registerRemedy(path, type, handler);
    }

    module.children.forEach((child) => registerHandlers(child, path));
}

export async function handleValidationError(error) {
    const key = createKey(error.path, error.type);

    const handler = remedyRegistry.get(key);

    if (handler) {
        await handler(error);
    } else {
        throw new Error(`No handler registered for ${key}`);
    }
}

export default registerHandlers;
