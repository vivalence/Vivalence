import paladin from "@vivalence/paladin";
import { Url, Connection, specimen, sleep } from "@vivalence/typology";

await paladin.ikiro;

// console.log(paladin);
// console.log(paladin.variant);

const BASE = paladin.env.get("PUBLIC_VIVA_RUNTIME_REMOTE");
const runtime = new Connection(new Url(BASE));

specimen.describe("runtime aperture", () => {
  specimen.describe("gestalt", () => {
    specimen.it("/status", async () => {
      await sleep.seconds(2);
      const status = await runtime.call("/status");
      specimen.expect(status.code).toBe("ALIVE");
    });

    specimen.it("/manifest", async () => {
      const manifest = await runtime.call("/manifest");
      specimen.expect(manifest).toBeDefined();
    });
  });

  specimen.describe("daemon mount", () => {
    const slug = paladin.variant.daemons[0].slug;
    const daemon = runtime.branch(`/daemon/${slug}`);

    specimen.it("/manifest", async () => {
      const manifest = await daemon.call("/manifest");
      // console.log({ manifest });
      specimen.expect(manifest.slug).toBe(slug);
    });

    specimen.it("/status", async () => {
      const status = await daemon.call("/status");
      // console.log({ status });
      specimen.expect(status).toBeDefined();
    });
  });
});

// import paladin from "@vivalence/paladin";
// import { Url, Connection, Request, Path, Response } from "@vivalence/typology";
// import { shards, specimen, sleep } from "@vivalence/typology/belt";
// import { Runtime, Die } from "@vivalence/runtime";

// const BASE = paladin.env.get("PUBLIC_VIVA_RUNTIME_REMOTE");
// const runtime = new Connection(new Url(BASE));

// specimen.describe("runtime aperture", () => {
//   specimen.describe("gestalt", () => {
//     specimen.it("/status", async () => {
//       const connection = new Connection(new Url("http://localhost:1729"));
//       const status = await connection.call("/status");
//       const manifest = await connection.call("/manifest");
//       console.log({ status, manifest });
//       specimen.expect(status.code).toBe("ALIVE");
//     });
//   });
// });
