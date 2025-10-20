import { Path } from "@vivalence/typology";

export default function joins(config) {
  const createBrancher = (envKey) => (path) =>
    new Path(config.env.get(envKey)).branch(path);

  const tilde = createBrancher("VIVA_TILDE_MOUNT");
  const registry = createBrancher("VIVA_REGISTRY_MOUNT");
  const system = createBrancher("VIVA_SYSTEM_MOUNT");

  config.join = {
    tilde: (f) => tilde(f),
    registry: (f) => registry(f),
    system: (f) => system(f),
    variant: {
      env: () => tilde("variant/environment"),
      runtimes: () => tilde("variant/runtimes"),
    },
    mountpoint: {
      runtime: (runtime, service) =>
        service
          ? tilde(`mountpoint/runtime_${runtime}_service_${service}`)
          : tilde(`mountpoint/runtime_${runtime}`), // @beef ought not exist really.
      service: (service, runtime) =>
        runtime
          ? tilde(`mountpoint/runtime_${runtime}_service_${service}`)
          : tilde(`mountpoint/service_${service}`),
    },
  };
}

// import { join } from "@std/path";

// export default function joins(config) {
//   const createJoiner = (baseDirKey) => (path) =>
//     join(config.env.get(baseDirKey), path);

//   const nest = (parentJoiner, subPath) => (path) =>
//     parentJoiner(join(subPath, path));

//   const tilderoot = createJoiner("VIVA_TILDE_MOUNT");
//   const system = createJoiner("VIVA_SYSTEM_MOUNT");
//   const register = createJoiner("VIVA_REGISTER_MOUNT");

//   config.join = {
//     system,
//     register,

//     // tilde:
//     // tilde: {
//     //   variant: nest(tilderoot, "/variant"),
//     //   files: nest(tilderoot, "/files"),
//     //   assets: nest(tilderoot, "/assets"),
//     // },

//     variant: {
//       env: nest(tilderoot, "/variant/environment"),
//       runtimes: nest(tilderoot, "/variant/runtimes"),
//       // services: nest(tilderoot, "/variant/services"),
//     },

//     data: {
//       runtime: (runtime, service = null) => {
//         const path = service
//           ? `data/runtime_${runtime}_service_${service}`
//           : `data/runtime_${runtime}`;
//         return tilderoot(path);
//       },
//       service: (service, runtime = null) => {
//         const path = runtime
//           ? `data/runtime_${runtime}_service_${service}`
//           : `data/service_${service}`;
//         return tilderoot(path);
//       },
//     },
//   };
// }
