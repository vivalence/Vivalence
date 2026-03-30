import { specimen, Request, Response, Url } from "@vivalence/typology";

specimen.describe("Context", () => {
  specimen.describe("construction", () => {
    specimen.it("from plain object", async () => {
      const { Context } = await import("@vivalence/typology");
      const ctx = new Context({ request: { body: { x: 1 }, url: "http://localhost/test", method: "POST" } });
      specimen.expect(ctx.request).toBeInstanceOf(Request);
      specimen.expect(ctx.response).toBeInstanceOf(Response);
      specimen.expect(ctx.state).toEqual({});
      specimen.expect(ctx.params).toEqual({});
    });

    specimen.it("from Request instance", async () => {
      const { Context } = await import("@vivalence/typology");
      const req = new Request({ body: { x: 1 }, url: "http://localhost/test" });
      const ctx = new Context({ request: req });
      specimen.expect(ctx.request).toBe(req);
    });
  });

  specimen.describe("input alias", () => {
    specimen.it("reads from request.body", async () => {
      const { Context } = await import("@vivalence/typology");
      const ctx = new Context({ request: { body: { n: 42 }, url: "http://x" } });
      specimen.expect(ctx.input).toEqual({ n: 42 });
    });

    specimen.it("writes to request.body", async () => {
      const { Context } = await import("@vivalence/typology");
      const ctx = new Context({ request: { body: {}, url: "http://x" } });
      ctx.input = { replaced: true };
      specimen.expect(ctx.request.body).toEqual({ replaced: true });
    });

    specimen.it("mutation visible on both sides", async () => {
      const { Context } = await import("@vivalence/typology");
      const ctx = new Context({ request: { body: { a: 1 }, url: "http://x" } });
      ctx.input.b = 2;
      specimen.expect(ctx.request.body.b).toBe(2);
    });
  });

  specimen.describe("output alias", () => {
    specimen.it("reads from response.body", async () => {
      const { Context } = await import("@vivalence/typology");
      const ctx = new Context({ request: { url: "http://x" } });
      ctx.response.body = { result: true };
      specimen.expect(ctx.output).toEqual({ result: true });
    });

    specimen.it("writes to response.body", async () => {
      const { Context } = await import("@vivalence/typology");
      const ctx = new Context({ request: { url: "http://x" } });
      ctx.output = "hello";
      specimen.expect(ctx.response.body).toBe("hello");
    });
  });
});
