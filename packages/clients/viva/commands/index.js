import { Command, HelpCommand, colors } from "@vivalence/interfaces-cli";

import loadServicesCommands from "./services.js";
import loadSchemaCommands from "./schema.js";

const commands = {
  help: async (viva) => await new HelpCommand(),
  services: loadServicesCommands,
  schema: loadSchemaCommands,
};

export default async function services(viva) {
  console.log("- If the services dont match it, the daemon catch it.");

  let tree = new Command().name("viva").version("0.0.1");

  for (const [name, command] of Object.entries(commands)) {
    // why doesnt this execute twice on --watch mode???
    // also, how can i stop this from killing the entire process?
    // also, i must only handoff cli control when it matches. otherwise do OVER;
    tree = tree.command(name, await command(viva));
  }

  await tree // .noExit() .throwErrors()
    .error((error, cmd) => {
      console.error(colors.red("[UNDER services error]"));
      if (error) {
        cmd.showHelp();
      }
      console.error(error);
      Deno.exit(error ? error.exitCode : 1);
    })
    .parse(viva.input);

  // console.log(colors.white("[OVER tree ]"));

  return viva;
}
