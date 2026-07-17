import { specimen, Url } from "@vivalence/typology";

specimen.describe("Url", () => {
  specimen.it("an endpoint assembles and branches", () => {
    const native = new Url(new URL("https://example.com/path"));
    specimen.expect(native.absolute).toBe("https://example.com/path");
    specimen.expect(native.origin).toContain("example.com");

    const leaf = new Url("https://api.io/v1").branch("/users").branch("/123");
    specimen.expect(leaf.href).toBe("https://api.io/v1/users/123");
    specimen.expect(leaf.root.origin).toBe("https://api.io");

    specimen.expect(new Url("https://api.io/p").protocol).toBe("https");
    specimen.expect(new Url("https://api.io/p").secure).toBe(true);
    specimen.expect(new Url("http://api.io/p").secure).toBe(false);
    specimen.expect(new Url("wss://api.io/p").secure).toBe(true);
    specimen.expect(new Url("ws://api.io/p").secure).toBe(false);
  });

  specimen.it("a query rides the wire", () => {
    const parsed = new Url("https://api.io/p?token=abc&lang=en");
    specimen.expect(parsed.query).toEqual({ token: "abc", lang: "en" });
    specimen.expect(parsed.search).toBe("?token=abc&lang=en");
    specimen.expect(parsed.absolute).toBe("https://api.io/p?token=abc&lang=en");
    specimen.expect(parsed.searchParams.get("token")).toBe("abc");

    const merged = new Url("https://api.io/p?a=1").with({ b: "2", skip: null, gone: undefined });
    specimen.expect(merged.query).toEqual({ a: "1", b: "2" });
    specimen.expect(new Url("https://api.io/p?a=1").query).toEqual({ a: "1" });

    const branched = new Url("https://api.io/v1?token=abc").branch("/users");
    specimen.expect(branched.query).toEqual({});
    specimen.expect(branched.absolute).toBe("https://api.io/v1/users");

    specimen.expect(new Url("https://api.io/p?token=old").hash).toBe(new Url("https://api.io/p?token=new").hash);

    specimen.expect(new Url("https://api.io/v1/users?token=abc&lang=en").json).toEqual({
      url: "https://api.io/v1/users?token=abc&lang=en",
      origin: "https://api.io",
      scheme: "https",
      path: "/v1/users",
      query: { token: "abc", lang: "en" },
      parts: ["v1", "users"],
    });

    const ws = new Url("https://api.io/p?token=abc").scheme("wss");
    specimen.expect(ws.absolute).toBe("wss://api.io/p?token=abc");
    specimen.expect(ws.nature).toBe("/p");
    specimen.expect(ws.query).toEqual({ token: "abc" });
  });
});
