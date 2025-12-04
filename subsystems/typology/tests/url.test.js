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

    specimen.it("inherits origin through tilde", () => {
      const root = new Url("https://deep.io");
      const leaf = root.branch("/a").branch("/b").branch("/c");
      specimen.expect(leaf.tilde.origin).toBe("https://deep.io");
      specimen.expect(leaf.href).toBe("https://deep.io/a/b/c");
    });

    // specimen.it("handles relative", () => {const rel = new Url("/just/path"); specimen.expect(rel.origin).toBeNull(); specimen.expect(rel.href).toBe("/just/path");});
  });
});
