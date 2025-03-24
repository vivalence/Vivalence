// import { colors } from "@cliffy/ansi/colors";

import schema from "./schema/index.js";

export default async function (viva) {
  return await schema(viva);
  // viva.trajectory.use(async (ctx, next) => {
  //   ctx.base = {
  //     version: "0.1.0",
  //     timestamp: new Date().toISOString(),
  //   };
  //   await next();
  // });

  // viva.trajectory.path("/services", async () => ({ status: "Not implemented yet" }));
  // viva.trajectory.path("/runtimes", async () => ({ status: "Not implemented yet" }));
  // viva.trajectory.path("/help", async () => ({ status: "Help system" }));
  //
}
