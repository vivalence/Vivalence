import { join } from "@std/path";
import * as hello from "/Users/finn/vivalence/code/vivalence/systems/runtime/tests/scenarios/hello.js";

const mode = (slug) => `import { Vector } from "@vivalence/typology";

export const manifest = { type: "probe", slug: "${slug}", version: "0.0.1", traits: ["EXPOSED"] };
export const aperture = new Vector().open("/providers", (ctx) => ({
  keys: Object.keys(ctx.providers).sort(),
  reader: typeof ctx.providers.reader?.open,
  page: typeof ctx.providers.page?.open,
}));
`;

const reader = { module: "@commons/service/reader" };
const recipe = (home) => ({
  ...hello.RECIPE,
  daemons: [
    {
      manifest: { type: "daemon", slug: "hello", version: "0.0.1" },
      consume: { page: reader },
      modes: [
        { module: join(home, "peek.viva.js"), consume: { reader } },
        "./quiet.viva.js",
      ],
    },
  ],
});

let world;
try {
  world = await hello.launch({
    prefix: "viva-mode-consume-",
    ledger: hello.LEDGER,
    environment: hello.ENVIRONMENT,
    home: async (home) => {
      await Deno.writeTextFile(join(home, "instance.viva.json"), JSON.stringify(recipe(home), null, 2));
      await Deno.writeTextFile(join(home, "peek.viva.js"), mode("peek"));
      await Deno.writeTextFile(join(home, "quiet.viva.js"), mode("quiet"));
    },
  });
} catch (error) {
  console.log("BOOT REFUSED");
  console.log(error.message);
  Deno.exit(1);
}

try {
  console.log("ready     ", world.ready, world.origin);
  await world.post("/lighthouse/signup", { username: "probe", password: "hunter22" }).then((response) => response.json());
  const login = await (await world.post("/lighthouse/login", { username: "probe", password: "hunter22" })).json();
  const token = login.authority.access;
  const handshake = await world.post("/daemon/hello/userspace/handshake", {}, token);
  console.log("handshake ", handshake.status);
  await handshake.body?.cancel();
  for (const slug of ["peek", "quiet"]) {
    const response = await world.post(`/daemon/hello/mode/probe/${slug}/providers`, {}, token);
    console.log(slug.padEnd(10), response.status, JSON.stringify(await response.json()));
  }
} finally {
  await world.stop();
}
