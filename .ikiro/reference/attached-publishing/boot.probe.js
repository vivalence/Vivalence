// boot.probe.js — a REAL runtime process, a REAL registry module wearing ATTACHED · TWITCHY, a stranger's GET over the socket.
//
//     deno run -A --no-check --config <clone>/deno.jsonc .ikiro/reference/attached-publishing/boot.probe.js <clone> <traits> <twitch>
//
// <traits> the module's manifest traits, comma-joined (ATTACHED · ATTACHED,TWITCHY); <twitch> its twitch export: absent · Vector · Twitch · Heard
// (Heard = a Vector with one route on /after/mode/boot that prints: one row per seat of the module).
// <clone> is a COPY of the tree, never the tree: the probe writes its module into <clone>/commons (the rig's @commons mount).
// The module rides the runtime (`/runtime/house`) AND the daemon (`/daemon/hello`): both mount rows of `resolution.expose`.
import { join } from "@std/path";

const root = Deno.args[0];
const { boot, RECIPE } = await import(join(root, "systems/runtime/tests/scenarios/hello.js"));

const traits = Deno.args[1].split(",");
const twitch = {
  absent: "",
  Vector: "export const twitch = new Vector();\n",
  Twitch: "export const twitch = new Twitch();\n",
  Heard: `export const twitch = new Vector().open("/after/mode/boot", (ctx) =>
  console.log(\`TWITCHY heard /after/mode/boot as \${ctx.mode.reference.absolute} under \${ctx.mode.daemon}\`),
);\n`,
};

const MODULE = `import { fromm, Twitch, Vector } from "@vivalence/typology";

export const manifest = { type: "publish", slug: "attached", version: "0.0.1", traits: ${JSON.stringify(traits)} };
export const attachment = new Vector().open("/(.*)", (ctx) =>
  new Response(\`<h1>\${ctx.mode.manifest.slug} \${fromm.params(ctx.params).path.absolute}</h1>\`, {
    headers: { "content-type": "text/html; charset=utf-8" },
  }),
);
${twitch[Deno.args[2]]}`;

const home = join(root, "commons/fixtures/testing/attached");
await Deno.mkdir(home, { recursive: true });
await Deno.writeTextFile(join(home, "attached.viva.js"), MODULE);

const recipe = {
  ...RECIPE,
  daemons: [{ ...RECIPE.daemons[0], modes: [...RECIPE.daemons[0].modes, "@commons/publish/attached"] }],
};

const world = await boot({ recipe, modes: ["@commons/publish/attached"], prefix: "viva-attached-" });
try {
  console.log("ready  ", world.ready);
  for (const path of [
    "/attached/daemon/hello/mode/publish/attached/article/hello.html",
    "/attached/runtime/house/mode/publish/attached/index.html",
    "/attached/daemon/hello/mode/demo/hello-world/index.html",
    "/daemon/hello/mode/publish/attached/metadata/manifest",
    "/attached/file/nope",
  ]) {
    const response = await world.get(path);
    console.log(`\nGET ${path}`);
    console.log(response.status, response.headers.get("content-type"));
    console.log(await response.text());
  }
  console.log("\n--- the runtime's own output, every row naming the module or a fault");
  for (const row of world.log.filter((row) => /publish|fault|ATTACHED|TWITCHY/.test(row))) console.log(row);
} finally {
  await world.stop();
}
