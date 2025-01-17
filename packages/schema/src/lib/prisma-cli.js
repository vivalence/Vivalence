import config from "@vivalence/config";
import { colors } from "@vivalence/interfaces-cli";

import { prismaPath, prismaRootDir } from "../statics.js";

export async function migrate({ database, sourcePath }) {
  config.env.set("PRISMA_DATABASE_SOURCE_TOKEN", database.filePath);

  const PRISMA = config.repo.importmap.prisma;

  const command = new Deno.Command("deno", {
    args: ["run", "-A", PRISMA, "migrate", "dev", `--schema=${prismaPath}`, `--name=${Date.now()}`],
    stdout: "inherit",
  });

  const output = await command.output();
  return processOutput(output, { prisma: PRISMA, cmd: "migrate" });
}

export async function format() {
  const PRISMA = config.repo.importmap.prisma;

  const command = new Deno.Command("deno", {
    args: ["run", "-A", PRISMA, "format", `--schema=${prismaPath}`],
  });

  const output = await command.output();
  return processOutput(output, { prisma: PRISMA, cmd: "format" });
}

function processOutput(output, { cmd, prisma }) {
  return {
    prisma,
    cmd,
    // stdout: new TextDecoder().decode(output.stdout),
    stderr: new TextDecoder().decode(output.stderr),
  };
}

export default { format, migrate };
