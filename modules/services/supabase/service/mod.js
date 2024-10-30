import config from "@vivalence/config";
import { dirname, fromFileUrl, basename, join } from "$std/path/mod.ts";
import { colors } from "jsr:@cliffy/ansi@1.0.0-rc.7/colors";

// @lj: all these belong into packages/viva/
import { compose, docker } from "./lib/docker.js";
import containerTable from "./lib/table.js";
import processEnvFile from "./lib/env.js";

const dir = dirname(fromFileUrl(import.meta.url));
const composePath = join(dir, "./docker-compose.yml");
const envPath = join(dir, "./.env.example");
const newPath = envPath.replace(".env.example", ".env");

const setupEnv = async () => {
  try {
    await processEnvFile({ from: envPath, to: newPath }, config);
  } catch (e) {
    console.error("Failed to create .env file");
    console.error(e);
    throw e;
  }
};

const ps = async () => {
  await setupEnv();

  console.log(containerTable(await docker.ps()));
};

const up = async () => {
  await setupEnv();

  console.log(colors.blue("Starting Supabase services..."));
  const { ok, error } = await compose.up({ path: composePath });

  if (error) {
    console.error(colors.red("Failed to start Supabase services"));
    throw error;
  }

  console.log(containerTable(await docker.ps()));
  console.log(colors.green("✓ Supabase services started successfully"));
};

const down = async () => {
  await setupEnv();

  console.log(colors.blue("Stopping Supabase services..."));
  const { ok, error } = await compose.down({ path: composePath });

  if (error) {
    console.error(colors.red("Failed to start Supabase services"));
    throw error;
  }

  console.log(containerTable(await docker.ps()));
  console.log(colors.green("✓ Supabase services started successfully"));
};

async function server() {
  return {
    status: {
      name: "status",
      description: "Check the status of Supabase services",
      action: ps,
    },

    up: {
      name: "up",
      description: "Start Supabase services",
      action: up,
    },

    down: {
      name: "down",
      description: "Stop Supabase services",
      action: down,
    },
  };
}
export default server;
