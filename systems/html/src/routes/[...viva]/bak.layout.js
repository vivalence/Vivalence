// import { redirect } from "@sveltejs/kit";
// import { Connection } from "@vivalence/typology";
// import { lighthouse } from "$client";

// // must handle default / empty

// export const load = async () => {
//   if (!lighthouse.$isIdentified.get()) {
//     console.log("auth throw");
//     return;
//     console.log("THROW");
//     throw redirect(307, "/");
//   }
// };

// //await loadDaemons(lighthouse);
// // async function loadDaemons(lighthouse) {
// //   const daemons = await lighthouse.connection.call("/entities/daemon/find");
// //   for (const remote of daemons) {
// //     const exists = await remotes.daemon //
// //       .findOne((d) => d.connection.url === remote.url);

// //     if (exists) continue;

// //     const connection = new Connection(remote.url) //
// //       .use(shards.connection.authorize(lighthouse.$authority));

// //     await dataspace.daemon.spawn(connection);

// //     //         const connection = new Connection(remote.url) //
// //     //           .use(authorize(lighthouse.$authority));
// //     //         await remotes.daemon.spawn(connection);
// //   }
// // }
