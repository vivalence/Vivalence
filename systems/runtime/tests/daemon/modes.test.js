import { Value } from "@sinclair/typebox/value";
import paladin from "@vivalence/paladin";
import { shards, sleep, specimen, Url, Connection } from "@vivalence/typology";
import { scalars, primitives, bodies, types } from "@vivalence/typology";

await paladin.ikiro;

const BASE = paladin.env.get("PUBLIC_VIVA_RUNTIME_REMOTE");
const LIGHTHOUSE = paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE");

const lighthouse = new Connection(new Url(LIGHTHOUSE));
const runtime = new Connection(new Url(BASE));
// .use(async (ctx, next) => {console.log("@runtime authorized", { auth }); ctx.request.headers.Authorization = `Bearer ${auth.access}`; await next();});

let auth;

specimen.describe("daemon modes", () => {
  specimen.it("authenticates", async () => {
    await sleep.seconds(2);

    const response = await lighthouse.call("/auth/login", {
      username: "beef",
      password: "biggusdickus",
    });

    auth = response.authority;
    specimen.expect(auth.access).toBeDefined();
  });

  //

  specimen.describe("agent/eva", () => {
    const variant = paladin.variant.daemons[0];
    const daemon = runtime.branch(`/daemon/${variant.slug}`);

    // daemon.use(shards.request.authorize(auth));
    // console.log({ daemon });
    // return;

    specimen.it("/mode/agent/eva/manifest", async () => {
      daemon.use(shards.request.authorize({ ...auth })); //

      const manifest = await daemon.call("/mode/agent/eva/manifest");

      console.log({ manifest });
      specimen.expect(manifest.type).toBe("agent");
      specimen.expect(manifest.slug).toBe("eva");
    });

    specimen.it("/mode/agent/eva/status", async () => {
      const status = await daemon.call("/mode/agent/eva/status");
      console.log({ status });

      specimen.expect(status).toBeDefined();
    });
  });
  // TODO: valences load
  // TODO: dataset loads
  // TODO: viewable
});

// specimen.describe("System", () => {
//   specimen.it("authenticates", async () => {
//     const lighthouse = new Connection(
//       new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
//     );

//     const testauth = { username: "beef", password: "biggusdickus" };
//     const result = await lighthouse.call("/auth/login", testauth);

//     specimen.expect(Value.Check(bodies.AuthResponse, result)).toBe(true);

//     auth = result.authority;
//   });
// });

// specimen.describe("Modes", () => {
//   specimen.it("loads", async () => {
//     const lighthouse = new Connection(
//       new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
//     );

//     const testauth = { username: "beef", password: "biggusdickus" };
//     const result = await lighthouse.call("/auth/login", testauth);

//     specimen.expect(Value.Check(bodies.AuthResponse, result)).toBe(true);

//     auth = result.authority;
//   });
// });
