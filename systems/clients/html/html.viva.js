import config from "@vivalence/paladin";
import { Vector } from "@vivalence/vector";

import { dirname, fromFileUrl } from "@std/path";
const __dirname = dirname(fromFileUrl(import.meta.url));

export const manifest = {
  type: "client",
  slug: "html",
  description: "sveltekit client for local, web and bundled.",
};

export const control = new Vector()
  .use(async (ctx, next) => {
    ctx.params = {
      env: { ...config.env.vars },
      cwd: __dirname,
    };
    await next();
  })
  .open("/install", async (ctx) => {
    ctx.params.cmd = "deno install --allow-scripts=npm:svelte-preprocess";
    return await ctx.tools.process.start(manifest, ctx.params);
  })
  .open("/start", async (ctx) => {
    ctx.params.cmd = "deno run -A npm:vite dev";
    return await ctx.tools.process.start(manifest, ctx.params);
  });

// .use(ctx => {
//   try {
//     await Deno.stat(`${__dirname}/node_modules`);
//   } catch (err) {
//     console.log("Installing dependencies...");
//     const npmInstall = new Deno.Command("npm", {
//       args: ["install"],
//       cwd: __dirname,
//       stdout: "inherit",
//       stderr: "inherit",
//     });
//     const { code } = await npmInstall.output();
//     console.log({ code });
//     if (code !== 0) {
//       throw new Error(`npm install failed with code ${code}`);
//     }
//   }
// }
// export const lifecycle = {
//   startup: { timeout: 30000 },
//   constraints: { env: { requires: [] } },
//   control: {
//     healthcheck: { path: "/healthcheck" },
//     status: { path: "/status" },
//   },
//   shutdown: { graceful: true, timeout: 10000 },
// };

// url: "http://localhost:5173/status",

// import { path } from "@vivalence/typology/prototypes"; // path.fromImport(import.meta.url)
// export async function control(config, vector) {
//   vector.branch("/control").open("/start", async (ctx) => {
//     // thus the client here has a standard interface of const entity = f(processmanifest)
//     // where entity consists of {status:{code,message,error}, manifest, config, ...}
//     console.log(process.pid, process.manifest, await process.status());
//     // @context: how do we facilitate process handover?
//     // ctx.client.pipe | watch | attach | observe;
//   });
// }

// // trajectories/process.js
// export default function processControl(client) {
//   const process = client.trajectory.branch('/process');

//   process
//     .open('/list', async (ctx) => {
//       const processes = await ctx.tools.process.list();
//       return { processes };
//     })

//     .open('/:slug/status', async (ctx) => {
//       const { slug } = ctx.params;
//       const processes = await ctx.tools.process.list();
//       const entity = processes.find(p => p.manifest.slug === slug);

//       if (!entity) return { error: 'Process not found', slug };

//       const status = await entity.status();
//       const healthy = await entity.isHealthy();

//       return { slug, status, healthy };
//     })

//     .open('/:slug/start', async (ctx) => {
//       const { slug } = ctx.params;
//       // This would need manifest/config lookup
//       const manifest = { slug, port: 5173 }; // Simplified
//       const config = { cmd: ['npm', 'run', 'dev'], cwd: '.' };

//       const entity = await ctx.tools.process.ensure(manifest, config);
//       return { slug, pid: entity.pid, status: 'started' };
//     })

//     .open('/:slug/stop', async (ctx) => {
//       const { slug } = ctx.params;
//       await ctx.tools.process.kill(slug);
//       return { slug, status: 'stopped' };
//     })

//     .open('/:slug/restart', async (ctx) => {
//       const { slug } = ctx.params;
//       await ctx.tools.process.kill(slug);
//       // Could add restart logic here
//       return { slug, status: 'restarting' };
//     });

//   return process;
// }
