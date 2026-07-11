import { specimen, Url } from "@vivalence/typology";

let url;

specimen.describe("Url", () => {
  specimen.describe("construction", () => {
    // specimen.it("from string", () => {url = new Url("https://vivalence.com:1794/api/users");});

    specimen.it("from native URL", () => {
      const test = new URL("https://example.com/path");
      url = new Url(test);
      specimen.expect(url.absolute).toBe("https://example.com/path");
    });

    specimen.describe("gestalt", () => {
      specimen.it("preserves origin", () => {
        specimen.expect(url.origin).toContain("example.com");
      });
    });
  });
  specimen.describe("valences", () => {
    specimen.it("branches", () => {
      const root = new Url("https://api.io/v1");
      const child = root.branch("/users").branch("/123");
      specimen.expect(child.href).toBe("https://api.io/v1/users/123");
    });

    specimen.it("inherits origin through root", () => {
      const root = new Url("https://deep.io");
      const leaf = root.branch("/a").branch("/b").branch("/c");
      specimen.expect(leaf.root.origin).toBe("https://deep.io");
      specimen.expect(leaf.href).toBe("https://deep.io/a/b/c");
    });

    // specimen.it("handles relative", () => {const rel = new Url("/just/path"); specimen.expect(rel.origin).toBeNull(); specimen.expect(rel.href).toBe("/just/path");});
  });

  specimen.describe("query", () => {
    specimen.it("preserves query from string", () => {
      const parsed = new Url("https://api.io/p?token=abc&lang=en");
      specimen.expect(parsed.query).toEqual({ token: "abc", lang: "en" });
      specimen.expect(parsed.search).toBe("?token=abc&lang=en");
      specimen.expect(parsed.absolute).toBe("https://api.io/p?token=abc&lang=en");
    });

    specimen.it("searchParams returns URLSearchParams view", () => {
      const parsed = new Url("https://api.io/p?token=abc");
      specimen.expect(parsed.searchParams.get("token")).toBe("abc");
    });

    specimen.it("with() returns new Url with merged query", () => {
      const base = new Url("https://api.io/p?a=1");
      const withB = base.with({ b: "2" });
      specimen.expect(withB.query).toEqual({ a: "1", b: "2" });
      specimen.expect(base.query).toEqual({ a: "1" });
    });

    specimen.it("with() skips null/undefined values", () => {
      const base = new Url("https://api.io/p");
      const next = base.with({ token: null, lang: undefined, a: "ok" });
      specimen.expect(next.query).toEqual({ a: "ok" });
    });

    specimen.it("branch() drops query — branches are fresh paths", () => {
      const root = new Url("https://api.io/v1?token=abc");
      const child = root.branch("/users");
      specimen.expect(child.query).toEqual({});
      specimen.expect(child.absolute).toBe("https://api.io/v1/users");
    });

    specimen.it("hasher ignores query — identity survives token rotation", () => {
      const a = new Url("https://api.io/p?token=old");
      const b = new Url("https://api.io/p?token=new");
      specimen.expect(a.hash).toBe(b.hash);
    });
  });

  specimen.describe("scheme", () => {
    specimen.it("protocol getter reads scheme", () => {
      specimen.expect(new Url("https://api.io/p").protocol).toBe("https");
      specimen.expect(new Url("http://api.io/p").protocol).toBe("http");
    });

    specimen.it("secure true for https and wss", () => {
      specimen.expect(new Url("https://api.io/p").secure).toBe(true);
      specimen.expect(new Url("http://api.io/p").secure).toBe(false);
      specimen.expect(new Url("wss://api.io/p").secure).toBe(true);
      specimen.expect(new Url("ws://api.io/p").secure).toBe(false);
    });

    specimen.it("scheme() swaps protocol preserving nature and query", () => {
      const http = new Url("https://api.io/p?token=abc");
      const ws = http.scheme("wss");
      specimen.expect(ws.absolute).toBe("wss://api.io/p?token=abc");
      specimen.expect(ws.nature).toBe("/p");
      specimen.expect(ws.query).toEqual({ token: "abc" });
    });
  });
});
