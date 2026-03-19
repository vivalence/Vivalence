import { specimen, Url, Connection, shard, Path, shards, shape, Aperture } from "@vivalence/typology";
import { create } from "./daemon.js";

specimen.describe("runtime composition (scenario)", () => {
  let scenario;
  let runtimeHandler;
  let runtimeConn;

  specimen.beforeAll(async () => {
    scenario = await create();

    const runtime = new Aperture();
    runtime.open("/status", () => ({ code: "ALIVE" }));
    runtime.open("/manifest", () => ({ slug: "test-runtime" }));

    runtime
      .branch(scenario.daemon.mount.nature)
      .open("/status", () => ({ code: "ALIVE" }))
      .open("/manifest", () => scenario.daemon.manifest)
      .slurp(scenario.daemon.aperture);

    runtimeHandler = shape.http(runtime);
    runtimeConn = new Connection(
      new Url("http://test"),
      shard.transport.inline(runtimeHandler),
    );
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.describe("runtime-level routes", () => {
    specimen.it("runtime status", async () => {
      const result = await runtimeConn.call("/status");
      specimen.expect(result.code).toBe("ALIVE");
    });

    specimen.it("runtime manifest", async () => {
      const result = await runtimeConn.call("/manifest");
      specimen.expect(result.slug).toBe("test-runtime");
    });
  });

  specimen.describe("daemon mounted under runtime", () => {
    specimen.it("daemon status via runtime path", async () => {
      const result = await runtimeConn.call("/daemon/test-daemon/status");
      specimen.expect(result.code).toBe("ALIVE");
    });

    specimen.it("daemon cargo via runtime path", async () => {
      const result = await runtimeConn.call("/daemon/test-daemon/cargo");
      specimen.expect(result.test).toBe(true);
    });

    specimen.it("daemon datamap via runtime path", async () => {
      const result = await runtimeConn.call(
        "/daemon/test-daemon/entities/literal/find",
        { where: {}, options: { limit: 10 } },
      );
      specimen.expect(result.length).toBe(2);
    });
  });

  specimen.describe("remainder patterns", () => {
    specimen.it("unmatched route returns 404", async () => {
      const response = await runtimeConn.fetch("/nonexistent/deep/path");
      specimen.expect(response.status).toBe(404);
    });
  });
});
