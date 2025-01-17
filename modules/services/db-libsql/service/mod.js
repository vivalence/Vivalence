import config from "@vivalence/config";
import * as schema from "@vivalence/schema";
import { createDatabase } from "../lib/db.js";

function valid(service) {
  let { filePath } = service.config;
  if (!filePath.startsWith("file:")) {
    filePath = `file:` + config.env["VIVA_DATABASE_PATH"];
  }
  if (!filePath) {
    throw new Error("[libsql] no database service defined");
  }
  return { filePath };
}

export default function createDatabaseService(service, viva) {
  return {
    install: {
      what: "create database according to schema",
      do: async function () {
        let { filePath } = valid(service);
        await (await createDatabase(filePath)).close();
        await schema.deploy({ database: { filePath } });
      },
    },
  };

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
}
