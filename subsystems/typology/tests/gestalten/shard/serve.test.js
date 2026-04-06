import { specimen, sleep, shard, shape, Aperture } from "@vivalence/typology";

const { http } = shape;

specimen.describe("serve shard", () => {
  let tmpDir;

  specimen.beforeAll(async () => {
    tmpDir = await Deno.makeTempDir();
    await Deno.writeTextFile(`${tmpDir}/index.html`, "<h1>hello</h1>");
    await Deno.writeTextFile(`${tmpDir}/app.js`, "console.log('hi')");
    await Deno.writeFile(`${tmpDir}/image.bin`, new Uint8Array([0xDE, 0xAD]));
  });

  specimen.afterAll(async () => {
    await Deno.remove(tmpDir, { recursive: true });
  });

  specimen.describe("through http shape", () => {
    let handler;

    specimen.beforeAll(() => {
      const app = new Aperture();
      app.get("assets/(.*)", shard.serve.file(tmpDir));
      handler = http(app);
    });

    specimen.it("HTML → text/html", async () => {
      const res = await handler(new Request("http://localhost/assets/index.html"));
      specimen.expect(res.status).toBe(200);
      specimen.expect(res.headers.get("content-type")).toBe("text/html");
      specimen.expect(await res.text()).toBe("<h1>hello</h1>");
    });

    specimen.it("JS → application/javascript", async () => {
      const res = await handler(new Request("http://localhost/assets/app.js"));
      specimen.expect(res.status).toBe(200);
      specimen.expect(res.headers.get("content-type")).toBe("application/javascript");
      specimen.expect(await res.text()).toBe("console.log('hi')");
    });

    specimen.it("binary → application/octet-stream", async () => {
      const res = await handler(new Request("http://localhost/assets/image.bin"));
      specimen.expect(res.status).toBe(200);
      specimen.expect(res.headers.get("content-type")).toBe("application/octet-stream");
      const buf = new Uint8Array(await res.arrayBuffer());
      specimen.expect(buf[0]).toBe(0xDE);
      specimen.expect(buf[1]).toBe(0xAD);
    });

    specimen.it("missing file → 404", async () => {
      const res = await handler(new Request("http://localhost/assets/nope.txt"));
      specimen.expect(res.status).toBe(404);
    });
  });
});
