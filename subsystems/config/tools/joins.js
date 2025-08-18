import { join } from "@std/path";

export default function joins(config) {
  const createJoiner = (baseDirKey) => (path) =>
    join(config.env.get(baseDirKey), path);

  const nest = (parentJoiner, subPath) => (path) =>
    parentJoiner(join(subPath, path));

  const configroot = createJoiner("VIVA_CONFIG_DIR");
  const repository = createJoiner("VIVA_REPOSITORY_DIR");
  const register = createJoiner("VIVA_REGISTER_DIR");

  config.joins = {
    repository,
    register,

    config: {
      env: nest(configroot, "/env"),
      system: nest(configroot, "/system"),
      runtimes: nest(configroot, "/runtimes"),
      services: nest(configroot, "/services"),
    },

    data: {
      runtime: (runtime, service = null) => {
        const path = service
          ? `data/runtime_${runtime}_service_${service}`
          : `data/runtime_${runtime}`;
        return configroot(path);
      },

      service: (service, runtime = null) => {
        const path = runtime
          ? `data/runtime_${runtime}_service_${service}`
          : `data/service_${service}`;
        return configroot(path);
      },
    },
  };
}
