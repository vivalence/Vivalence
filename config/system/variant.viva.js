export const manifest = {
  type: "variant",
  slug: "localhost",
};

export default function variant(config) {
  // lighthouse!
  const daemon = {
    module: "@vivalence/daemon",
    config: {
      serve: {
        domain: "localhost",
        port: "5175",
      },
    },
  };

  const web = {
    module: "@vivalence/client/web",
    config: {
      serve: {
        domain: "localhost",
        port: "5174",
      },
    },
  };

  return {
    // lighthouse: {},
    daemon,
    clients: { web },
    // remote: {},
    // services: {},
  };
}
// export const manifest = {
//   type: "variant",
//   slug: "localhost",
// };

// export default function variant(config) {
//   console.log(config.env);
//   return {
//     remote: {},
//     // lighthouse:{},

//     daemon: {
//       serve: {
//         domain: "localhost",
//         port: "5175",
//       },
//     },
//     clients: {
//       web: {
//         // env:new Env(),
//         serve: {
//           domain: "localhost",
//           port: "5174",
//         },
//       },
//     },
//     services: {},
//     // processes: [],
//   };
// }
