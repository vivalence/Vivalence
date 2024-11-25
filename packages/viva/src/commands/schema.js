import registry from "@vivalence/registry";
import config from "@vivalence/config";
import { Command } from "jsr:@cliffy/command@1.0.0-rc.7";
import { colors } from "jsr:@cliffy/ansi@1.0.0-rc.7/colors";

export default async function loadServices(viva) {
  const Compile = new Command()
    .name("compile")
    .description("Compile the schema.")
    .action(async () => {
      const process = new Deno.Command("deno", {
        args: ["task", "schema:compile"],
        stdin: "inherit",
        stdout: "inherit",
        stderr: "inherit",
      });

      const child = process.spawn();
      const status = await child.status;
      console.log("");
      console.log(colors.green("Schema compiled successfully!"));
      console.log(colors.green(`REMINDER: (temporary)`));
      console.log(colors.green(`EXEC "./packages/schema/sql/dist/compiled.sql" in the database.`));

      return { code: status.code };
    });

  const Deploy = new Command()
    .name("deploy")
    .description("Deploy the schema to the database.")
    .action(async () => {
      const process = new Deno.Command("deno", {
        args: ["task", "schema:deploy"],
        stdin: "inherit",
        stdout: "inherit",
        stderr: "inherit",
      });

      const child = process.spawn();
      const status = await child.status;

      return { code: status.code };
    });

  const Commands = new Command()
    .description("[TODO] manage db schema")
    .command("compile", Compile)
    .command("deploy", Deploy);

  return Commands;
}
