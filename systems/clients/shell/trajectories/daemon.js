// import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
// import { colors } from "@vivalence/interface/shell";

// const dir = dirname(fromFileUrl(import.meta.url));
// const composePath = join(dir, "./docker-compose.yml");
// const exampleEnvPath = join(dir, "./.env.source");
// const servicePath = { path: composePath };

// async function status(_, ctx) {
//   console.log(colors.blue("Checking the status of Stanza NLP services..."));
//   await ctx.locals.compose.ps(servicePath);
// }

// async function build(_, ctx) {
//   console.log(colors.blue("Building Stanza NLP services..."));
//   await ctx.tools.compose.build(servicePath);
// }

// async function up(_, ctx) {
//   console.log(colors.blue("Starting Stanza NLP services..."));
//   const { ok, error } = await ctx.tools.compose.up(servicePath);
//   if (!ok || error) {
//     console.error(colors.red("Failed to start Stanza NLP services"));
//     console.error(error);
//     return;
//   }
//   await ctx.tools.compose.ps(servicePath);
//   console.log(colors.green("✓ Stanza NLP services started successfully"));
// }

// async function down(_, ctx) {
//   console.log(colors.blue("Stopping Stanza NLP services..."));
//   const { ok, error } = await ctx.tools.compose.down(servicePath);
//   if (!ok || error) {
//     console.error(colors.red("Failed to stop Stanza NLP services"));
//     console.error(error);
//     return;
//   }
//   await ctx.tools.compose.ps(servicePath);
//   console.log(colors.green("✓ Stanza NLP services stopped successfully"));
// }

// export default function control(service, host) {
//   host.trajectory.use(async (input, ctx, next) => {
//     await ctx.tools.env.fromEnv(exampleEnvPath, service.config.env);
//     return await next();
//   });
//   host.trajectory.open((p) => p.sig("/status"), status);
//   host.trajectory.open((p) => p.sig("/start"), up);
//   host.trajectory.open((p) => p.sig("/up"), up);
//   host.trajectory.open((p) => p.sig("/down"), down);
//   host.trajectory.open((p) => p.sig("/build"), build);
// }
