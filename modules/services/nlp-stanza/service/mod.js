import { dirname, fromFileUrl, basename, join } from "$std/path/mod.ts";
import { colors } from "jsr:@cliffy/ansi@1.0.0-rc.7/colors";

const dir = dirname(fromFileUrl(import.meta.url));
const composePath = join(dir, "./docker-compose.yml");
const exampleEnvPath = join(dir, "./.env.example");

const service = { path: composePath };

const status = (viva) => ({
  name: "status",
  description: "Check the status of Stanza Nlp services",
  action: async () => {
    console.log(colors.blue("Checking the status of Stanza Nlp services..."));
    await viva.locals.compose.ps(service);
  },
});

const build = (viva) => ({
  name: "build",
  description: "Build the Stanza Nlp services",
  action: async () => {
    console.log(colors.blue("Building Stanza Nlp services..."));
    await viva.locals.compose.build(service);
  },
});

const up = (viva) => ({
  name: "up",
  description: "Start Stanza Nlp services",
  action: async () => {
    console.log(colors.blue("Starting Stanza Nlp services..."));

    const { ok, error } = await viva.locals.compose.up(service);

    if (!ok || error) {
      console.error(colors.red("Failed to start Stanza Nlp services"));
      console.error(error);
      return;
    }

    await viva.locals.compose.ps(service);

    console.log(colors.green("✓ Stanza Nlp services started successfully"));
  },
});

const down = (viva) => ({
  name: "down",
  description: "Stop Stanza Nlp services",
  action: async () => {
    console.log(colors.blue("Stopping Stanza Nlp services..."));

    const { ok, error } = await viva.locals.compose.down(service);

    if (!ok || error) {
      console.error(colors.red("Failed to start Stanza Nlp services"));
      console.error(error);
      return;
    }

    await viva.locals.compose.ps(service);

    console.log(colors.green("✓ Stanza Nlp services started successfully"));
  },
});

export default async function (viva) {
  return [status, build, up, down].reduce((acc, fn) => {
    const command = fn(viva);
    acc[command.name] = {
      ...command,
      action: async () => {
        await viva.locals.env.fromExampleEnv(exampleEnvPath);
        await command.action();
      },
    };
    return acc;
  }, {});
}
