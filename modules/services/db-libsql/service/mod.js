import { createDatabase } from "../lib/db.js";

export default function createDatabaseService(service, ctx) {
  return {
    install: {
      what: "create database according to schema",
      do: async function () {
        await (await createDatabase(service.config)).close();
      },
    },
  };
}

// return {
// key:function do(viva),
// key:{go: {key:Trajectory},what,do},
// };

// return [init].reduce((acc, fn) => {
//   const command = fn(viva);
//   acc[command.name] = {
//     ...command,
//     action: async () => {
//       // await viva.locals.env.fromExampleEnv(exampleEnvPath);
//       await command.action();
//     },
//   };
//   return acc;
// }, {});
