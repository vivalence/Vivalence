import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import { colors } from "jsr:@cliffy/ansi@1.0.0-rc.7/colors";

const dir = dirname(fromFileUrl(import.meta.url));
const composePath = join(dir, "./docker-compose.yml");
const exampleEnvPath = join(dir, "./.env.source");
const servicePath = { path: composePath };

async function status(ctx) {
  console.log(colors.blue("Checking the status of Stanza NLP services..."));
  await ctx.locals.compose.ps(servicePath);
}

async function build(host) {
  console.log(colors.blue("Building Stanza NLP services..."));
  await host.locals.compose.build(servicePath);
}

async function up(host) {
  console.log(colors.blue("Starting Stanza NLP services..."));
  const { ok, error } = await host.locals.compose.up(servicePath);
  if (!ok || error) {
    console.error(colors.red("Failed to start Stanza NLP services"));
    console.error(error);
    return;
  }
  await host.locals.compose.ps(servicePath);
  console.log(colors.green("✓ Stanza NLP services started successfully"));
}

async function down(host) {
  console.log(colors.blue("Stopping Stanza NLP services..."));
  const { ok, error } = await host.locals.compose.down(servicePath);
  if (!ok || error) {
    console.error(colors.red("Failed to stop Stanza NLP services"));
    console.error(error);
    return;
  }
  await host.locals.compose.ps(servicePath);
  console.log(colors.green("✓ Stanza NLP services stopped successfully"));
}
export default function boot(host, service) {
  host.trajectory.use(async (ctx, next) => {
    await ctx.locals.env.fromEnv(exampleEnvPath, service.config.env);
    await next();
  });
  host.trajectory.path("/status", status);
  host.trajectory.path("/up", up);
  host.trajectory.path("/down", down);
  host.trajectory.path("/build", build);
}

// const commands = {
//   status: status(service, viva),
//   build: build(service, viva),
//   up: up(service, viva),
//   // down: down(service, viva),
// };

// // Add environment loading to each command
// for (const key in commands) {
//   const originalDo = commands[key].do;
//   commands[key].do = async function () {
//     await viva.locals.env.fromEnv(exampleEnvPath, service.config.env);
//     await originalDo();
//   };
// }

// return commands;
// import { dirname, fromFileUrl, basename, join } from "$std/path/mod.ts";
// import { colors } from "jsr:@cliffy/ansi@1.0.0-rc.7/colors";

// const dir = dirname(fromFileUrl(import.meta.url));
// const composePath = join(dir, "./docker-compose.yml");
// const exampleEnvPath = join(dir, "./.env.source");

// const servicePath = { path: composePath };

// const status = (service, viva) => ({
//   what: "Check the status of Stanza Nlp services",
//   do: async () => {
//     console.log(colors.blue("Checking the status of Stanza Nlp services..."));
//     await viva.locals.compose.ps(servicePath);
//   },
// });

// const build = (viva) => ({
//   what: "Build the Stanza Nlp services",
//   do: async () => {
//     console.log(colors.blue("Building Stanza Nlp services..."));
//     await viva.locals.compose.build(service);
//   },
// });

// const up = (viva) => ({
//   what: "Start Stanza Nlp services",
//   do: async () => {
//     console.log(colors.blue("Starting Stanza Nlp services..."));

//     const { ok, error } = await viva.locals.compose.up(service);

//     if (!ok || error) {
//       console.error(colors.red("Failed to start Stanza Nlp services"));
//       console.error(error);
//       return;
//     }

//     await viva.locals.compose.ps(service);

//     console.log(colors.green("✓ Stanza Nlp services started successfully"));
//   },
// });

// const down = (viva) => ({
//   what: "Stop Stanza Nlp services",
//   do: async () => {
//     console.log(colors.blue("Stopping Stanza Nlp services..."));

//     const { ok, error } = await viva.locals.compose.down(service);

//     if (!ok || error) {
//       console.error(colors.red("Failed to start Stanza Nlp services"));
//       console.error(error);
//       return;
//     }

//     await viva.locals.compose.ps(service);

//     console.log(colors.green("✓ Stanza Nlp services started successfully"));
//   },
// });

// export default async function (service, viva) {
//     const commands = {
//     status: status(service, viva),
//     build: build(service, viva),
//     up: up(service, viva),
//     down: down(service, viva),
//   };

//   // Add environment loading to each command
//   for (const key in commands) {
//     const originalDo = commands[key].do;
//     commands[key].do = async function() {
//       await viva.locals.env.fromEnv(exampleEnvPath, service.config.env);
//       await originalDo();
//     };
//   }

// }

//   // return [status, build, up, down].reduce((acc, fn) => {
//   //   const command = fn(service, viva);
//   //   acc[command.name] = {
//   //     what: command.description,
//   //     do: async () => {
//   //       await viva.locals.env.fromEnv(exampleEnvPath, service.config.env);
//   //       await command.action();
//   //     },
//   //   };
//   //   return acc;
//   // }, {});
