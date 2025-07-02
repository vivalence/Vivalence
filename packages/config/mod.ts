import * as dotenv from "@std/dotenv";
import fs from "@std/fs";
import { join } from "@std/path";
import { parse } from "@std/jsonc";
// import { findVivaFiles } from "@vivalence/shared/repository";

import Env from "./lib/env.js";

const ROOT_OFFSET = "../../.env";

let initialized = false;

const config = {
  role: Deno.env.get("VIVA_ROLE"),
  env: new Env(),
  joins: {},
  find: {},
  daemon: null,
  runtimes: {},
  services: {},
  secrets: null,
};

if (!initialized) {
  await [
    environment,
    // repository,
    directories,
    joins,
    find,
    sudo,
    // registry,
    services,
    daemon,
    runtimes,
    clients,
    unsudo,
    publish,
    validate,
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(config));

  config.isDev = config.env.DENO_ENV === "DEVELOPMENT";
  config.isProd = config.env.DENO_ENV === "PRODUCTION";

  initialized = true;
}

export default config;

async function environment(config) {
  const envPath = new URL(ROOT_OFFSET, import.meta.url).pathname;
  const env = await dotenv.load({ envPath });

  config.env.add(env);

  return config;
}

// async function repository(config) {const rootDir = config.env.get("VIVA_REPOSITORY_DIR"); const importmap = JSON.parse(await Deno.readTextFile(rootDir + "/import_map.json"),); config.repo = {root: rootDir, importmap: importmap.imports,}; return config;}

function directories(config) {
  const {
    VIVA_REGISTRY_DIR,
    VIVA_USER_DIR, //
  } = config.env.vars;

  config.env.add({
    VIVA_DATA_DIR: `${VIVA_USER_DIR}/data`,
    VIVA_CONFIG_DIR: `${VIVA_USER_DIR}/config`,
    VIVA_MODULES_DIR: `${VIVA_REGISTRY_DIR}/modules`,
    VIVA_SERVICES_DIR: `${VIVA_REGISTRY_DIR}/services`,
  });

  return config;
}

function joins(config) {
  config.joins = {
    config: (path) => join(config.env.get("VIVA_CONFIG_DIR"), path),
    data: (path) => join(config.env.get("VIVA_DATA_DIR"), path),
    registry: {
      modules: (p) => join(config.env.get("VIVA_REGISTRY_DIR"), "modules", p),
      services: (p) => join(config.env.get("VIVA_REGISTRY_DIR"), "services", p),
    },
    daemon: {
      data: (path) => join(config.env.get("VIVA_DATA_DIR"), "daemon", path),
    },
    runtimes: {
      data: (path) => join(config.env.get("VIVA_DATA_DIR"), "runtimes", path),
    },
  };
  return config;
}

function find(config) {
  async function findVivaFiles(directory) {
    const files = [];

    const items = await fs.readdir(directory);

    for (const item of items) {
      const fullPath = join(directory, item);
      const stats = await fs.stat(fullPath);

      if (stats.isDirectory()) {
        const nestedFiles = await findVivaFiles(fullPath);
        files.push(...nestedFiles);
      } else if (item.endsWith(".viva.js")) {
        files.push(fullPath);
      }
    }

    return files;
  }

  config.find = {
    files: { viva: findVivaFiles },
    // config: (path) => join(config.env.get("VIVA_CONFIG_DIR"), path),
  };
  return config;
}

async function sudo(config) {
  if (["SUDO", "DAEMON"].includes(config.role)) {
    config.env.secrets = new Env() //
      .add(parse(await fs.readFile(config.joins.config("secrets.jsonc"))));

    config.env.services = new Env() //
      .add(parse(await fs.readFile(config.joins.config("services.jsonc"))));
  }

  return config;
}

async function daemon(config) {
  const file = config.joins.config("daemon.viva.js");
  const { server } = await (await import(file)).default(config);

  config.daemon = { server };

  config.env.add({
    VIVA_DAEMON_DOMAIN: server.domain,
    VIVA_DAEMON_PORT: server.port,
    VIVA_DAEMON_URL: `http://${server.domain}:${server.port}`,
  });

  return config;
}

async function runtimes(config) {
  const path = config.joins.config("runtimes/");
  const vivaFiles = await config.find.files.viva(path);
  for (const file of vivaFiles) {
    const runtime = await (await import(file)).default(config);
    if (!runtime) continue;
    config.runtimes[runtime.manifest.slug] = runtime;
  }

  return config;
}

async function services(config) {
  const file = config.joins.config("services.viva.js");
  const services = await (await import(file)).default(config);

  for (const [slug, service] of Object.entries(services)) {
    config.services[slug] = service;
  }

  return config;
}

async function clients(config) {
  const clients = await import(config.joins.config("clients.viva.js"));
  const { web } = await clients.default(config);

  config.env.add({
    VIVA_CLIENTS_WEB_DOMAIN: web.domain,
    VIVA_CLIENTS_WEB_PORT: web.port,
    VIVA_CLIENTS_WEB_URL: `http://${web.domain}:${web.port}`,
  });

  return config;
}

async function unsudo(config) {
  delete config.env.secrets;
  return config;
}

async function publish(config) {
  const publish = parse(await fs.readFile(config.joins.config("public.jsonc")));
  for (const key of publish) {
    const value = config.env.get(key) || config.secrets.get(key);
    if (value === null) continue;
    Deno.env.set(`PUBLIC_${key}`, value.toString());
  }

  return config;
}

async function validate(config) {
  const env = config.env.vars;

  [
    "VIVA_IDENTITY_MODE",
    "VIVA_REPOSITORY_DIR",
    "VIVA_REGISTRY_DIR",
    "VIVA_USER_DIR",
  ].map((key) => {
    if (!env[key]) throw new Error(`[config] Missing ${key}`);
  });

  [
    "VIVA_REPOSITORY_DIR",
    "VIVA_REGISTRY_DIR",
    "VIVA_USER_DIR", //
    "VIVA_DATA_DIR", //
    "VIVA_CONFIG_DIR", //
    "VIVA_MODULES_DIR", //
    "VIVA_SERVICES_DIR", //
  ].map((key) => {
    const value = env[key];
    if (!fs.existsSync(value)) {
      fs.ensureDirSync(value, { recursive: true });
    }
  });

  return config;
}
