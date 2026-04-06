import { specimen, shard } from "@vivalence/typology";

const { wrap } = shard.cors;

const echo = async (req) => {
  const body = await req.json().catch(() => null);
  return new Response(JSON.stringify({ method: req.method, body }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};

const handler = wrap(echo);

specimen.describe("cors wrapper", () => {
  specimen.it("OPTIONS preflight returns 204", async () => {
    const res = await handler(new Request("http://localhost/api", {
      method: "OPTIONS",
      headers: { origin: "http://localhost:5173" },
    }));
    specimen.expect(res.status).toBe(204);
    specimen.expect(res.headers.get("access-control-allow-origin")).toBe("http://localhost:5173");
    specimen.expect(res.headers.get("access-control-allow-credentials")).toBe("true");
  });

  specimen.it("preflight reflects request method and headers", async () => {
    const res = await handler(new Request("http://localhost/api", {
      method: "OPTIONS",
      headers: {
        origin: "http://localhost:3000",
        "access-control-request-method": "POST",
        "access-control-request-headers": "content-type, authorization",
      },
    }));
    specimen.expect(res.headers.get("access-control-allow-methods")).toBe("POST");
    specimen.expect(res.headers.get("access-control-allow-headers")).toBe("content-type, authorization");
  });

  specimen.it("non-preflight passes through with CORS headers", async () => {
    const res = await handler(new Request("http://localhost/api", {
      method: "POST",
      headers: { origin: "http://localhost:5173", "content-type": "application/json" },
      body: JSON.stringify({ hello: "world" }),
    }));
    specimen.expect(res.status).toBe(200);
    specimen.expect(res.headers.get("access-control-allow-origin")).toBe("http://localhost:5173");
    const body = await res.json();
    specimen.expect(body.body.hello).toBe("world");
  });

  specimen.it("no origin → wildcard", async () => {
    const res = await handler(new Request("http://localhost/api"));
    specimen.expect(res.headers.get("access-control-allow-origin")).toBe("*");
  });

  specimen.it("disallowed origin → no CORS headers", async () => {
    const res = await handler(new Request("http://localhost/api", {
      headers: { origin: "http://evil.example.com" },
    }));
    specimen.expect(res.headers.get("access-control-allow-origin")).toBe(null);
  });

  specimen.it("vivalence.com origin allowed", async () => {
    const res = await handler(new Request("http://localhost/api", {
      headers: { origin: "https://app.vivalence.com" },
    }));
    specimen.expect(res.headers.get("access-control-allow-origin")).toBe("https://app.vivalence.com");
  });
});
