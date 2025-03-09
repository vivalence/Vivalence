import { colors } from "@cliffy/ansi/colors";

import loadSchemaCommands from "./schema.js";

const baseMiddleware = async (ctx, next) => {
  ctx.base = {
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  };
  await next();
};

export default async function loadCommands(viva) {
  viva.trajectory.use(baseMiddleware);

  viva.trajectory.url("/services", async () => ({ status: "Not implemented yet" }));
  viva.trajectory.url("/runtimes", async () => ({ status: "Not implemented yet" }));
  viva.trajectory.url("/help", async () => ({ status: "Help system" }));

  await loadSchemaCommands(viva);

  return viva;
}
