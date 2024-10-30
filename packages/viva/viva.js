import registry from "@vivalence/registry";
import config from "@vivalence/config";

import { Command } from "jsr:@cliffy/command@1.0.0-rc.7";
import { HelpCommand } from "jsr:@cliffy/command@1.0.0-rc.7/help";
import { colors } from "jsr:@cliffy/ansi@1.0.0-rc.7/colors";

import loadServicesCommands from "./src/services.js";
import loadSchemaCommands from "./src/schema.js";

await new Command()
  .name("viva")
  .version("0.0.1")
  .description(`Viva la Vivalence!`)
  .command("help", new HelpCommand().global())
  .command("services", await loadServicesCommands())
  .command("schema", await loadSchemaCommands())
  .error((error) => {
    console.error(colors.red("Error:"), error.message);
    Deno.exit(1);
  })
  .parse(Deno.args);
