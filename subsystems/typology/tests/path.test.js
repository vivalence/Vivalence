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
    specimen.expect(layered.absolute).toBe("/a");
    specimen.expect(layered.fin.absolute).toBe("/a/b/c");
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

specimen.describe("Path.absolute is heritage-only — a filesystem path is root→self", () => {
  specimen.it("branching a child never grows the parent (the daemon-mount crash)", () => {
    const mount = new Path("/testament/variant/mountpoint").branch("/daemon_spanish");
    const db = mount.branch("/test-language-spanish.viva.db");

    specimen.expect(db.absolute).toBe("/testament/variant/mountpoint/daemon_spanish/test-language-spanish.viva.db");
    specimen.expect(mount.absolute).toBe("/testament/variant/mountpoint/daemon_spanish");

    const store = `${mount.absolute}/homepage/aprende/bundle`;
    specimen.expect(store.includes(".viva.db")).toBe(false);
  });

  specimen.it("a reused parent serves many branches; every read stays true", () => {
    const mount = new Path("/daemon_spanish");
    const db = mount.branch("/spanish.viva.db");
    const migrations = mount.branch("/migrations");

    specimen.expect(db.absolute).toBe("/daemon_spanish/spanish.viva.db");
    specimen.expect(migrations.absolute).toBe("/daemon_spanish/migrations");
    specimen.expect(mount.absolute).toBe("/daemon_spanish");
    specimen.expect(mount.heir).toBe(db);
  });

  specimen.it("re-wrapping a branched path drops its trace — compose strings across ctors", () => {
    const rebased = new Path("/abs/dir").branch("/freight/audio");
    specimen.expect(rebased.absolute).toBe("/abs/dir/freight/audio");

    specimen.expect(new Path(rebased).absolute).toBe("/freight/audio");
    specimen.expect(new Path("/abs/dir" + "/freight/audio").absolute).toBe("/abs/dir/freight/audio");
  });
});
