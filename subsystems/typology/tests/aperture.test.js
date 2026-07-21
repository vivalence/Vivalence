import { specimen, shape, Aperture } from "@vivalence/typology";

specimen.describe("Aperture", () => {
  specimen.it("a request finds its method handler", async () => {
    const application = new Aperture();
    application.get("x", () => "got");
    application.post("x", (input, context) => ({ received: input }));
    const handler = shape.http(application);

    const gotten = await handler(new Request("http://localhost/x"));
    specimen.expect(await gotten.json()).toBe("got");

    const posted = await handler(new Request("http://localhost/x", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify("payload"),
    }));
    specimen.expect((await posted.json()).received).toBe("payload");

    const readOnly = new Aperture();
    readOnly.get("only-get", () => "ok");
    const readOnlyHandler = shape.http(readOnly);
    const refusedPost = await readOnlyHandler(new Request("http://localhost/only-get", { method: "POST" }));
    specimen.expect(refusedPost.status).toBe(405);

    const writeOnly = new Aperture();
    writeOnly.post("only-post", () => "ok");
    const writeOnlyHandler = shape.http(writeOnly);
    const refusedGet = await writeOnlyHandler(new Request("http://localhost/only-post"));
    specimen.expect(refusedGet.status).toBe(405);
  });

  specimen.it("an open route catches what the methods leave", async () => {
    const application = new Aperture();
    application.open("dual", () => "fallback");
    application.get("dual", () => "explicit-get");
    const handler = shape.http(application);

    const explicit = await handler(new Request("http://localhost/dual"));
    specimen.expect(await explicit.json()).toBe("explicit-get");
    const fallback = await handler(new Request("http://localhost/dual", { method: "POST" }));
    specimen.expect(await fallback.json()).toBe("fallback");
  });

  specimen.it("a branch carries its own methods", async () => {
    const application = new Aperture();
    const api = application.branch("api");
    api.get("items", () => [1, 2, 3]);
    api.post("items", (input, context) => ({ created: input }));
    const handler = shape.http(application);

    const listed = await handler(new Request("http://localhost/api/items"));
    specimen.expect(await listed.json()).toEqual([1, 2, 3]);

    const created = await handler(new Request("http://localhost/api/items", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "new" }),
    }));
    specimen.expect((await created.json()).created.name).toBe("new");
  });

  specimen.it("middleware and parameters reach the handler", async () => {
    const guarded = new Aperture();
    guarded.use(async (context, next) => {
      context.state = context.state || {};
      context.state.mw = true;
      await next();
    });
    guarded.get("guarded", (context) => ({ mw: context.state.mw }));
    const guardedHandler = shape.http(guarded);
    const witnessed = await guardedHandler(new Request("http://localhost/guarded"));
    specimen.expect((await witnessed.json()).mw).toBe(true);

    const users = new Aperture();
    users.get("users/:id", (context) => ({ id: context.params.id, method: "GET" }));
    users.put("users/:id", (context) => ({ id: context.params.id, method: "PUT" }));
    const usersHandler = shape.http(users);

    const fetched = await (await usersHandler(new Request("http://localhost/users/42"))).json();
    specimen.expect(fetched.id).toBe("42");
    specimen.expect(fetched.method).toBe("GET");

    const replaced = await (await usersHandler(new Request("http://localhost/users/42", { method: "PUT" }))).json();
    specimen.expect(replaced.id).toBe("42");
    specimen.expect(replaced.method).toBe("PUT");
  });
});
