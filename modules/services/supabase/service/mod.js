import { dirname, fromFileUrl, basename, join } from "$std/path/mod.ts";
import { colors } from "@vivalence/interfaces-cli";

const dir = dirname(fromFileUrl(import.meta.url));
const composePath = join(dir, "./docker-compose.yml");
const exampleEnvPath = join(dir, "./.env.example");

const service = { path: composePath };

const status = (viva) => ({
  name: "status",
  description: "Check the status of Supabase services",
  action: async () => {
    console.log(colors.blue("Checking the status of Supabase services..."));
    await viva.locals.compose.ps(service);
  },
});

const up = (viva) => ({
  name: "up",
  description: "Start Supabase services",
  action: async () => {
    console.log(colors.blue("Starting Supabase services..."));

    const { ok, error } = await viva.locals.compose.up(service);

    if (!ok || error) {
      console.error(colors.red("Failed to start Supabase services"));
      console.error(error);
      return;
    }

    await viva.locals.compose.ps(service);

    console.log(colors.green("✓ Supabase services started successfully"));
  },
});

const down = (viva) => ({
  name: "down",
  description: "Stop Supabase services",
  action: async () => {
    console.log(colors.blue("Stopping Supabase services..."));

    const { ok, error } = await viva.locals.compose.down(service);

    if (!ok || error) {
      console.error(colors.red("Failed to start Supabase services"));
      console.error(error);
      return;
    }

    await viva.locals.compose.ps(service);

    console.log(colors.green("✓ Supabase services started successfully"));
  },
});

export default async function (viva) {
  return [status, up, down].reduce((acc, fn) => {
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
