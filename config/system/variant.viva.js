export const manifest = {
  type: "variant",
  slug: "localhost",
};

export default function variant(config) {
  // lighthouse!
  const daemon = {
    // module: "@vivalence/daemon",
    config: {
      serve: {
        domain: "localhost",
        port: "1729",
      },
    },
  };

  const html = {
    // module: "@vivalence/html",
    config: {
      serve: {
        domain: "localhost",
        port: "1794",
      },
    },
  };

  return {
    daemon,
    lighthouse: {
      // module: "@vivalence/html",
      // config: {serve: {domain: "localhost", port: "1794",}, }, // attached
    },
    clients: { html },
    // remotes: {},
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
