import { specimen, is, FilePath } from "@vivalence/typology";

specimen.describe("FilePath", () => {
  specimen.it("an anchored path is a tree rooted at /", () => {
    const repo = new FilePath("/../../repo/./x/..");
    specimen.expect(repo.nature).toBe("/");
    specimen.expect(repo.anchored).toBeTruthy();
    specimen.expect(repo.absolute).toBe("/repo");
    specimen.expect(repo.array.map((node) => node.nature)).toEqual(["/", "repo"]);

    const head = repo.fin.branch("src").branch("../lib/mod.ts");
    specimen.expect(head.nature).toBe("..");
    specimen.expect(head.trace.nature).toBe("src");
    specimen.expect(head.root).toBe(repo);
    specimen.expect(repo.fin.nature).toBe("mod.ts");
    specimen.expect(repo.absolute).toBe("/repo/lib/mod.ts");
    specimen.expect(String(repo.fin)).toBe("/repo/lib/mod.ts");
    specimen.expect(repo.parts).toEqual(["repo", "lib", "mod.ts"]);

    specimen.expect(repo.filename).toBe("mod.ts");
    specimen.expect(repo.dirname).toBe("/repo/lib");
    specimen.expect(repo.json).toEqual({
      path: "/repo/lib/mod.ts",
      root: "/",
      dir: "/repo/lib",
      base: "mod.ts",
      name: "mod",
      ext: ".ts",
      parts: ["repo", "lib", "mod.ts"],
    });

    specimen.expect(repo.resolve("/elsewhere").absolute).toBe("/repo/lib/mod.ts");
    specimen.expect(repo.relativeTo("/repo/src/deep").absolute).toBe("../../lib/mod.ts");
    specimen.expect(new FilePath("/repo").relativeTo("/repo").absolute).toBe(".");

    specimen.expect(is.filepath(repo)).toBeTruthy();
    specimen.expect(is.path(repo)).toBeTruthy();
    specimen.expect(is.signature(repo)).toBeTruthy();
  });

  specimen.it("a relative path has no / ancestor", () => {
    const reference = new FilePath("../a/../src").yeet("mod.ts");
    specimen.expect(reference.nature).toBe("..");
    specimen.expect(reference.relative).toBeTruthy();
    specimen.expect(reference.fin.nature).toBe("mod.ts");
    specimen.expect(reference.absolute).toBe("../src/mod.ts");
    specimen.expect(reference.json.root).toBe("");

    specimen.expect(new FilePath("a/..").absolute).toBe(".");
    specimen.expect(new FilePath("a/..").nature).toBe(".");

    specimen.expect(reference.resolve("/repo/pkg").absolute).toBe("/repo/src/mod.ts");

    const grounded = new FilePath("x").resolve();
    specimen.expect(grounded.anchored).toBeTruthy();
    specimen.expect(grounded.absolute.endsWith("/x")).toBeTruthy();

    const homely = new FilePath("~/x");
    specimen.expect(homely.root.nature).toBe("/");
    specimen.expect(homely.fin.nature).toBe("x");
  });
});
