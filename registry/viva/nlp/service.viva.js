import config from "@vivalence/paladin";
import { Path, Vector } from "@vivalence/typology";

import provider from "./provider/index.js";
import { tools } from "./tools/index.js";

const manifest = {
  type: "service",
  slug: "nlp-stanza",
  name: "Stanza NLP service",
  traits: ["SERVER", "DOCKER", "COMPOSE", "TOOLED"],
};

// const path = as.path.url(import.meta.url);
const path = new Path().from(new Path(import.meta.url));

const dir = path.trace.branch("/server");

const compose = dir.branch("/docker-compose.yml");
const env = dir.branch("/.env");
const source = dir.branch("/.env.source");

const control = new Vector()
  .use(async (ctx, next) => {
    ctx.service.config.env.key = ctx.service.secret.env.key;
    ctx.service.config.env.data = ctx.service.data;
    await ctx.tools.env.cast(
      source.absolute,
      env.absolute,
      ctx.service.config.env,
    );
    return await next();
  })
  .open("/status", async (ctx) => {
    console.log("Checking the status of Stanza NLP services...");
    await ctx.tools.compose.ps({ path: compose.absolute });
  })
  .open("/build", async (ctx) => {
    console.log("Building Stanza NLP services...");
    await ctx.tools.compose.build({ path: compose.absolute });
  })
  .open("/start", async (ctx) => {
    console.log("Starting Stanza NLP services...");

    const { ok, error } = await ctx.tools.compose.up({
      path: compose.absolute,
    });

    if (!ok || error) {
      console.error("Failed to start Stanza NLP services");
      console.error(error);
      return;
    }
    await ctx.tools.compose.ps({ path: compose.absolute });
    console.log("✓ Stanza NLP services started successfully");
  })
  .open("/up", async (ctx) => {
    console.log("Starting Stanza NLP services...");
    const { ok, error } = await ctx.tools.compose.up({
      path: compose.absolute,
    });
    if (!ok || error) {
      console.error("Failed to start Stanza NLP services");
      console.error(error);
      return;
    }
    await ctx.tools.compose.ps({ path: compose.absolute });
    console.log("✓ Stanza NLP services started successfully");
  })
  .open("/down", async (ctx) => {
    console.log("Stopping Stanza NLP services...");
    const { ok, error } = await ctx.tools.compose.down({
      path: compose.absolute,
    });
    if (!ok || error) {
      console.error("Failed to stop Stanza NLP services");
      console.error(error);
      return;
    }
    await ctx.tools.compose.ps({ path: compose.absolute });
    console.log("✓ Stanza NLP services stopped successfully");
  });

export { manifest, control, provider, tools };
