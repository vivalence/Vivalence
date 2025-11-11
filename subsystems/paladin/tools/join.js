import { Path } from "@vivalence/typology";

export default function joins(config) {
  const createBrancher = (envKey) => (path) => {
    return new Path(config.env.get(envKey)).branch(path);
  };

  const tilde = createBrancher("VIVA_TILDE_MOUNT");
  const registry = createBrancher("VIVA_REGISTRY_MOUNT");
  const system = createBrancher("VIVA_SYSTEM_MOUNT");
  // const mount = createBrancher("VIVA_TILDE_MOUNT");

  config.join = {
    tilde: (f) => tilde(f),
    registry: (f) => registry(f),
    system: (f) => system(f),

    // variant: () => tilde("variant"),
    // environment: () => tilde("environment"),
    // files: () => tilde("files"), assets: () => tilde("assets"),
    mountpoint: {
      daemon: (daemon, service) =>
        service
          ? tilde(`mountpoint/runtime_${daemon}_process_${service}`)
          : tilde(`mountpoint/runtime_${daemon}`), // @beef ought not exist really.
      service: (service, daemon) =>
        daemon
          ? tilde(`mountpoint/runtime_${daemon}_process_${service}`)
          : tilde(`mountpoint/process_${service}`),
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
//       daemons: nest(tilderoot, "/variant/daemons"),
//       // services: nest(tilderoot, "/variant/services"),
//     },

//     data: {
//       daemon: (daemon, service = null) => {
//         const path = service
//           ? `data/daemon_${daemon}_service_${service}`
//           : `data/daemon_${daemon}`;
//         return tilderoot(path);
//       },
//       service: (service, daemon = null) => {
//         const path = daemon
//           ? `data/daemon_${daemon}_service_${service}`
//           : `data/service_${service}`;
//         return tilderoot(path);
//       },
//     },
//   };
// }
