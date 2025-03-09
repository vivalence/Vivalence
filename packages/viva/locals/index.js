// locals/index.js - Local tools loader

// Mock implementations for local tools
const docker = {
  ps: async (all = true) => {
    return { ok: true, containers: [] };
  }
};

const compose = {
  up: async (options = {}) => {
    return { ok: true };
  },
  down: async (options = {}) => {
    return { ok: true };
  }
};

const env = {
  fromEnv: async (path, env = {}) => {
    return path.replace(".env.source", ".env");
  },
  fromExampleEnv: async (path) => {
    return path.replace(".env.example", ".env");
  }
};

export default function loadLocals(viva) {
  viva.locals = {
    env,
    docker,
    compose
  };
  
  return viva;
}
