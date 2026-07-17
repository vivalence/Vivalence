import { specimen, is, Path } from "@vivalence/typology";

specimen.describe("Path", () => {
  specimen.it("a path assembles from anything", () => {
    specimen.expect(new Path("//users///profile//").nature).toBe("/users/profile");
    specimen.expect(new Path("users/profile").nature).toBe("/users/profile");
    specimen.expect(new Path("/").nature).toBe("/");
    specimen.expect(new Path("").nature).toBe("/");
    specimen.expect(new Path(new Path("/original")).nature).toBe("/original");
    specimen.expect(new Path({ nature: "/from/object" }).nature).toBe("/from/object");

    const layered = new Path([{ nature: "/a" }, { nature: "/b" }, { nature: "/c" }]);
    specimen.expect(layered.nature).toBe("/a");
    specimen.expect(layered.absolute).toBe("/a/b/c");
    specimen.expect(layered.depth).toBe(2);

    const path = new Path("/users/profile");
    specimen.expect(is.path(path)).toBeTruthy();
    specimen.expect(is.signature(path)).toBeTruthy();
    specimen.expect(String(path)).toBe("/users/profile");
    specimen.expect(is.string(path + "")).toBeTruthy();
    specimen.expect(path.segment).toBe("/users/profile");
  });

  specimen.it("a path tree navigates itself", () => {
    const root = new Path("/root");
    const child = root.branch("/child");
    const leaf = child.branch("/leaf");

    specimen.expect(child.trace).toBe(root);
    specimen.expect(root.gauges).toContain(child);
    specimen.expect(root.heir).toBe(child);
    specimen.expect(root.root).toBe(root);
    specimen.expect(leaf.root).toBe(root);
    specimen.expect(root.fin).toBe(leaf);

    specimen.expect(leaf.absolute).toBe("/root/child/leaf");
    specimen.expect(new Path("/a").branch("/b").branch("/c").absolute).toBe("/a/b/c");

    specimen.expect([root.index, child.index, leaf.index]).toEqual([0, 1, 2]);
    specimen.expect([root.depth, child.depth, leaf.depth]).toEqual([2, 1, 0]);

    specimen.expect(new Path("/mode/game/nyan.viva.js").json).toEqual({
      path: "/mode/game/nyan.viva.js",
      root: "/",
      dir: "/mode/game",
      base: "nyan.viva.js",
      name: "nyan.viva",
      ext: ".js",
      parts: ["mode", "game", "nyan.viva.js"],
    });
  });
});
