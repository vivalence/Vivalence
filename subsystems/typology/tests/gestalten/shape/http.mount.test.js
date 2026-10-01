import { specimen, shape, Vector } from "@vivalence/typology";

const get = async (handler, path) => {
  const response = await handler(new Request(`http://localhost${path}`));
  return [response.status, response.status === 200 ? await response.json() : null];
};

specimen.describe("http shape: mounted vectors", () => {
  specimen.it("a new top-level branch on a mounted service reaches the served root", async () => {
    const service = new Vector().open("/find", () => "find");
    const root = new Vector();
    root.branch("/svc", service);
    const handler = shape.http(root);

    specimen.expect(await get(handler, "/svc/find")).toEqual([200, "find"]);
    specimen.expect((await get(handler, "/svc/count"))[0]).toBe(404);

    service.open("/count", () => "count");
    specimen.expect(await get(handler, "/svc/count")).toEqual([200, "count"]);
  });

  specimen.it("middleware added to the source after mounting runs on served requests", async () => {
    const service = new Vector().open("/who", (ctx) => ctx.state?.tag ?? "none");
    const root = new Vector();
    root.branch("/svc", service);
    const handler = shape.http(root);

    specimen.expect(await get(handler, "/svc/who")).toEqual([200, "none"]);
    service.use(async (ctx, next) => { ctx.state = { tag: "late" }; await next(); });
    specimen.expect(await get(handler, "/svc/who")).toEqual([200, "late"]);
  });

  specimen.it("a mode mounted under a daemon mounted under the runtime is live three levels down", async () => {
    const mode = new Vector().open("/a", () => "a");
    const daemon = new Vector();
    daemon.branch("/mode", mode);
    const runtime = new Vector();
    runtime.branch("/daemon", daemon);
    const handler = shape.http(runtime);

    specimen.expect(await get(handler, "/daemon/mode/a")).toEqual([200, "a"]);
    mode.open("/b", () => "b");
    daemon.open("/manifest", () => "m");
    specimen.expect(await get(handler, "/daemon/mode/b")).toEqual([200, "b"]);
    specimen.expect(await get(handler, "/daemon/manifest")).toEqual([200, "m"]);
  });

  specimen.it("sibling routes opened on the mounted node serve beside the source's own", async () => {
    const daemon = new Vector().open("/own", () => "own");
    const runtime = new Vector();
    const branch = runtime.branch("/d", daemon);
    branch.branch("/status", new Vector().open("/", () => "status"));
    branch.open("/manifest", () => "manifest").open("/batch", () => "batch");
    const handler = shape.http(runtime);

    specimen.expect(await get(handler, "/d/own")).toEqual([200, "own"]);
    specimen.expect(await get(handler, "/d/status")).toEqual([200, "status"]);
    specimen.expect(await get(handler, "/d/manifest")).toEqual([200, "manifest"]);
    specimen.expect(await get(handler, "/d/batch")).toEqual([200, "batch"]);
  });

  specimen.it("grafted vectors are frozen at graft time at every depth", async () => {
    const source = new Vector().open("/a", () => "a");
    source.branch("deep").open("x", () => "x");
    const root = new Vector();
    root.branch("/g").graft(source);
    const handler = shape.http(root);

    specimen.expect(await get(handler, "/g/a")).toEqual([200, "a"]);
    specimen.expect(await get(handler, "/g/deep/x")).toEqual([200, "x"]);

    source.open("/b", () => "b");
    source.branch("deep").open("y", () => "y");
    specimen.expect((await get(handler, "/g/b"))[0]).toBe(404);
    specimen.expect((await get(handler, "/g/deep/y"))[0]).toBe(404);
  });

  specimen.it("attach onto an occupied edge serves both the existing and the grafted routes", async () => {
    const root = new Vector();
    root.branch("/svc").open("/own", () => "own");
    root.branch("/svc", new Vector().open("/find", () => "find"));
    const handler = shape.http(root);

    specimen.expect(await get(handler, "/svc/own")).toEqual([200, "own"]);
    specimen.expect(await get(handler, "/svc/find")).toEqual([200, "find"]);
  });

  specimen.it("concurrent requests survive a source mutating mid-flight", async () => {
    const service = new Vector().open("/ping", () => "pong");
    const root = new Vector();
    root.branch("/svc", service);
    const handler = shape.http(root);

    const burst = Array.from({ length: 200 }, (_, i) => {
      if (i % 20 === 0) service.open(`/r${i}`, () => i);
      if (i % 30 === 0) service.trie.delete(`r${i - 30}`);
      return get(handler, "/svc/ping");
    });
    const results = await Promise.all(burst);
    specimen.expect(results.every(([status, body]) => status === 200 && body === "pong")).toBe(true);
  });
});
