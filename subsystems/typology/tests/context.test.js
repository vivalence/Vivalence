import { specimen, Context, Request, Response } from "@vivalence/typology";

specimen.describe("Context", () => {
  specimen.it("a context assembles around a request", () => {
    const context = new Context({ request: { body: { x: 1 }, url: "http://localhost/test", method: "POST" } });
    specimen.expect(context.request).toBeInstanceOf(Request);
    specimen.expect(context.response).toBeInstanceOf(Response);
    specimen.expect(context.state).toEqual({});
    specimen.expect(context.params).toEqual({});

    const request = new Request({ body: { x: 1 }, url: "http://localhost/test" });
    specimen.expect(new Context({ request }).request).toBe(request);
  });

  specimen.it("input and output alias the two bodies", () => {
    const context = new Context({ request: { body: { n: 42 }, url: "http://x" } });
    specimen.expect(context.input).toEqual({ n: 42 });
    context.input.b = 2;
    specimen.expect(context.request.body.b).toBe(2);
    context.input = { replaced: true };
    specimen.expect(context.request.body).toEqual({ replaced: true });

    context.response.body = { result: true };
    specimen.expect(context.output).toEqual({ result: true });
    context.output = "hello";
    specimen.expect(context.response.body).toBe("hello");
  });
});
