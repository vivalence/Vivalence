import { Value } from "@sinclair/typebox/value";
import paladin from "@vivalence/paladin";
import { shards, sleep, specimen, Url, Connection } from "@vivalence/typology";
import { scalars, primitives, bodies, types } from "@vivalence/typology";

await paladin.ikiro;

const BASE = paladin.env.get("PUBLIC_VIVA_RUNTIME_REMOTE");
const LIGHTHOUSE = paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE");

const lighthouse = new Connection(new Url(LIGHTHOUSE));
const runtime = new Connection(new Url(BASE));

let auth = {};

specimen.describe("daemon aperture", () => {
  specimen.it("authenticates", async () => {
    await sleep.seconds(2);
    const result = await lighthouse.call("/auth/login", {
      username: "beef",
      password: "biggusdickus",
    });
    auth = result.authority;
    specimen.expect(auth.access).toBeDefined();
    runtime.use(shards.request.authorize(auth));
  });

  specimen.describe("x", () => {
    const variant = paladin.variant.daemons[0];
    console.log({ variant });

    const daemon = runtime.branch(`/daemon/${variant.slug}`);

    specimen.it("y", async () => {
      const manifest = await daemon.call("/manifest");
      const status = await daemon.call("/status");
      console.log({ status, manifest });
    });
  });

  // TODO: /entities repos exposed and populated
  // TODO: /userspace expose
  // TODO: /modes repos are expose
});
