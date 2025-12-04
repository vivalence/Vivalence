import { Url, Connection, Request, Response } from "@vivalence/typology";
import { shards, specimen, Path } from "@vivalence/typology";
import { Runtime, Die } from "@vivalence/runtime";

specimen.describe("runtime aperture", () => {
  specimen.describe("valence", () => {
    specimen.it("/status", async () => {
      const connection = new Connection(new Url("http://localhost:1729"));
      const status = await connection.call("/status");
      specimen.expect(status.code).toBe("ALIVE");
    });
  });
});
