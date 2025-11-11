import { composePsToTable, dockerPsToTable } from "./table.js";

export const ComposeOptions = {
  defaults: {
    path: "docker-compose.yml",
    project: undefined,
    env: undefined,
    profiles: [],
    services: [],
  },
};

const cmd = async (args) => {
  try {
    const process = new Deno.Command(args[0], {
      args: args.slice(1),
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    });
    const child = process.spawn();
    const { code, ...status } = await child.status;

    return { ok: code === 0, error: null };
  } catch (error) {
    return { ok: false, error };
  }
};

const pipe = async (args) => {
  try {
    const process = new Deno.Command(args[0], {
      args: args.slice(1),
      stdout: "piped",
      stderr: "piped",
    });
    const { code, stdout, stderr } = await process.output();
    const out = new TextDecoder().decode(stdout).trim();
    const error = new TextDecoder().decode(stderr).trim();
    return { ok: true, out, error };
  } catch (error) {
    return { ok: false, out: "", error };
  }
};

const docker = {
  ps: async (all = true) => {
    const { ok, error, out } = await pipe([
      "docker",
      "ps",
      ...(all ? ["-a"] : []),
    ]);
    if (error) return { error };

    const lines = out.split("\n").slice(1); // Skip header
    const containers = lines.filter(Boolean).map((line) => {
      const [id, image, command, created, status, ports, name] =
        line.split(/\s{2,}/);
      return { id, image, command, created, status, ports, name };
    });

    console.log(dockerPsToTable(containers));

    return { ok, containers };
  },
};

const buildComposeCmd = (command, options = {}) => {
  const opts = { ...ComposeOptions.defaults, ...options };
  const args = ["docker", "compose"];

  if (opts.path) args.push("-f", opts.path);
  if (opts.project) args.push("-p", opts.project);
  if (opts.env) args.push("--env-file", opts.env);
  if (opts.profiles.length) {
    opts.profiles.forEach((profile) => args.push("--profile", profile));
  }

  args.push(command);

  if (opts.services.length) {
    args.push(...opts.services);
  }

  return args;
};

const compose = {
  build: async (options = {}) => {
    const args = buildComposeCmd("build", options);
    return await cmd(args);
  },

  up: async (options = {}) => {
    const args = buildComposeCmd("up", options);
    args.push("-d");
    return await cmd(args);
  },
  down: async (options = {}) => {
    const args = buildComposeCmd("down", options);
    return await cmd(args);
  },
  logs: async (options = {}) => {
    const { service, tail = "all", follow = false, ...rest } = options;
    const args = buildComposeCmd("logs", rest);

    if (follow) args.push("-f");
    if (tail) args.push(`--tail=${tail}`);
    if (service) args.push(service);

    return await cmd(args);
  },

  ps: async (options = {}) => {
    const args = buildComposeCmd("ps", options);
    const { ok, error, out } = await pipe(args);
    if (error) return { error };

    const lines = out.split("\n").slice(1);
    const containers = lines.filter(Boolean).map((line) => {
      const [
        nameContainer,
        image,
        command,
        nameService,
        created,
        status,
        ports,
      ] = line.split(/\s{2,}/);
      return {
        nameContainer,
        image,
        command,
        nameService,
        created,
        status,
        ports,
      };
    });

    console.log(composePsToTable(containers));

    return { ok, containers };
  },
};

export default { docker, compose };
