// import { colors } from "@cliffy/ansi/colors";

import services from "./services/index.js";
// import schema from "./schema/index.js";

export default async function (viva) {
  await services({ ...viva, trajectory: viva.trajectory.branch((p) => p.path("services")) });
  return viva;

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
