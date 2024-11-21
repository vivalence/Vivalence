import { Command } from "jsr:@cliffy/command@1.0.0-rc.7";
import { HelpCommand } from "jsr:@cliffy/command@1.0.0-rc.7/help";
import { colors } from "jsr:@cliffy/ansi@1.0.0-rc.7/colors";

import registry from "@vivalence/registry";
import config from "@vivalence/config";

import docker from "./lib/docker/docker.js";
import env from "./lib/env/env.js";
import loadServicesCommands from "./commands/services.js";
import loadSchemaCommands from "./commands/schema.js";

(async (viva) =>
  await [
    docker,
    env,
    async function (viva) {
      await new Command()
        .name("viva")
        .version("0.0.1")
        .description(`Viva la Vivalence!`)
        .command("help", new HelpCommand().global())
        .command("services", await loadServicesCommands(viva))
        .command("schema", await loadSchemaCommands(viva))
        .error(handleError)
        .parse(Deno.args);
    },
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(viva)))({ locals: {}, commands: {} });

const handleError = (error) => {
  console.error(colors.red(error.message));
  Deno.exit(1);
};
