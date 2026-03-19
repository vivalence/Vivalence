import { specimen, shape } from "@vivalence/typology";
import { Aperture } from "@vivalence/typology/aperture";

const { http } = shape;

specimen.describe("Aperture", () => {
  specimen.describe("method dispatch", () => {
    const app = new Aperture();
    app.get("x", () => "got");
    app.post("x", (input, ctx) => ({ received: input }));

    const handler = http(app);

    specimen.it("GET dispatches to .get() handler", async () => {
      const res = await handler(new Request("http://localhost/x"));
      specimen.expect(await res.json()).toBe("got");
    });

    specimen.it("POST dispatches to .post() handler", async () => {
      const res = await handler(new Request("http://localhost/x", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify("payload"),
      }));
      const body = await res.json();
      specimen.expect(body.received).toBe("payload");
    });

    specimen.it("POST to GET-only route returns 405", async () => {
      const app2 = new Aperture();
      app2.get("only-get", () => "ok");
      const h = http(app2);
      const res = await h(new Request("http://localhost/only-get", { method: "POST" }));
      specimen.expect(res.status).toBe(405);
    });

    specimen.it("GET to POST-only route returns 405", async () => {
      const app2 = new Aperture();
      app2.post("only-post", () => "ok");
      const h = http(app2);
      const res = await h(new Request("http://localhost/only-post"));
      specimen.expect(res.status).toBe(405);
    });
  });

  specimen.describe("open + method on same path", () => {
    const app = new Aperture();
    app.open("dual", () => "fallback");
    app.get("dual", () => "explicit-get");

    const handler = http(app);

    specimen.it("GET dispatches to explicit handler", async () => {
      const res = await handler(new Request("http://localhost/dual"));
      specimen.expect(await res.json()).toBe("explicit-get");
    });

    specimen.it("POST falls back to open handler via wildcard", async () => {
      const res = await handler(new Request("http://localhost/dual", { method: "POST" }));
      specimen.expect(await res.json()).toBe("fallback");
    });
  });

  specimen.describe("branching with methods", () => {
    const app = new Aperture();
    const api = app.branch("api");
    api.get("items", () => [1, 2, 3]);
    api.post("items", (input, ctx) => ({ created: input }));

    const handler = http(app);

    specimen.it("GET through branch", async () => {
      const res = await handler(new Request("http://localhost/api/items"));
      specimen.expect(await res.json()).toEqual([1, 2, 3]);
    });

    specimen.it("POST through branch", async () => {
      const res = await handler(new Request("http://localhost/api/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "new" }),
      }));
      const body = await res.json();
      specimen.expect(body.created.name).toBe("new");
    });
  });

  specimen.describe("middleware with method dispatch", () => {
    const app = new Aperture();
    app.use(async (ctx, next) => {
      ctx.state = ctx.state || {};
      ctx.state.mw = true;
      await next();
    });
    app.get("guarded", (ctx) => ({ mw: ctx.state.mw }));

    const handler = http(app);

    specimen.it("middleware runs before method handler", async () => {
      const res = await handler(new Request("http://localhost/guarded"));
      const body = await res.json();
      specimen.expect(body.mw).toBe(true);
    });
  });

  specimen.describe("params with methods", () => {
    const app = new Aperture();
    app.get("users/:id", (ctx) => ({ id: ctx.params.id, method: "GET" }));
    app.put("users/:id", (ctx) => ({ id: ctx.params.id, method: "PUT" }));

    const handler = http(app);

    specimen.it("GET with params", async () => {
      const res = await handler(new Request("http://localhost/users/42"));
      const body = await res.json();
      specimen.expect(body.id).toBe("42");
      specimen.expect(body.method).toBe("GET");
    });

    specimen.it("PUT with params", async () => {
      const res = await handler(new Request("http://localhost/users/42", { method: "PUT" }));
      const body = await res.json();
      specimen.expect(body.id).toBe("42");
      specimen.expect(body.method).toBe("PUT");
    });
  });
});
