import { colors } from "jsr:@cliffy/ansi@1.0.0-rc.7/colors";
import { Command } from "jsr:@cliffy/command@1.0.0-rc.7";

export default async function loadServices(viva) {
  const List = new Command()
    .name("list")
    .description("list runtimes")
    .action(async () => {
      // viva.runtimes
      console.log(`Runtimes found in viva repository:`);
      for (const runtime of Object.values(viva.runtimes)) {
        console.log(
          `  ${colors.bold(runtime.manifest.slug)}: ${colors.italic(runtime.manifest.name)}`,
        );
      }
    });

  const Commands = new Command()
    .description("do things with and to runtimes")
    .command("list", List);

  return Commands;
}
