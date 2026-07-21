import { specimen, cast } from "@vivalence/typology";

specimen.describe("Lookup", () => {
  specimen.it("an identifier parses into owner, type, slug and version", () => {
    specimen.expect(cast.lookup("@vivalence/module/moduleA")).toEqual({
      owner: "@vivalence",
      type: "module",
      slug: "moduleA",
      version: undefined,
    });

    const versioned = cast.lookup("@vivalence/module/moduleA@1.0.0");
    specimen.expect(versioned.version).toBe("1.0.0");
    specimen.expect(versioned.slug).toBe("moduleA");
  });
});
