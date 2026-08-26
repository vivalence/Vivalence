import { specimen, Path, Url, Signature } from "@vivalence/typology";

// The two derivations under comparison, computed EXPLICITLY (implementation-independent):
// chain = heritage + heir-walk (Signature.array semantics, the pre-fix Path.absolute)
// heritage = root→self only (the fs law)
const chain = (path) => path.array.map((segment) => segment.nature).join("") || "/";
const heritage = (path) => {
  let nature = "";
  for (let position = path; position; position = position.trace) nature = position.nature + nature;
  return nature || "/";
};

specimen.describe("Path.absolute — system-wide agreement set (every live LEAF pattern)", () => {
  specimen.it("scope.repository.branch(segment) — populate.js / bundler imports", () => {
    const repository = new Path("/Users/finn/vivalence/code/vivalence");
    const registry = repository.branch("registry");
    const barrel = repository.branch("subsystems/typology/mod.client.js");

    for (const leaf of [registry, barrel]) {
      specimen.expect(leaf.absolute).toBe(chain(leaf));
      specimen.expect(leaf.absolute).toBe(heritage(leaf));
    }
    specimen.expect(barrel.absolute).toBe("/Users/finn/vivalence/code/vivalence/subsystems/typology/mod.client.js");
  });

  specimen.it("datamap.mount.branch(db) + .branch(migrations) — libsql.viva.js", () => {
    const mount = new Path("/testament/instance/mountpoint").branch("/daemon_spanish");
    const db = mount.branch("test-language-spanish.viva.db");
    const migrations = mount.branch("migrations");

    specimen.expect(db.absolute).toBe(chain(db));
    specimen.expect(db.absolute).toBe("/testament/instance/mountpoint/daemon_spanish/test-language-spanish.viva.db");
    specimen.expect(migrations.absolute).toBe(chain(migrations));
    specimen.expect(migrations.absolute).toBe("/testament/instance/mountpoint/daemon_spanish/migrations");
  });

  specimen.it("freight.path.branch(entry) per request — resolve.js cargo, repeat serves", () => {
    const freight = new Path("/repo/topographies/english-to-spanish/freight/audio");
    const first = freight.branch("/hola.mp3");
    const second = freight.branch("/adios.mp3");

    specimen.expect(first.absolute).toBe(heritage(first));
    specimen.expect(second.absolute).toBe(heritage(second));
    specimen.expect(second.absolute).toBe("/repo/topographies/english-to-spanish/freight/audio/adios.mp3");
  });

  specimen.it("mode.mount = good.mount.clone().branch(…) — population.js", () => {
    const good = new Path("/daemon/playground");
    const mount = good.clone().branch("/mode/chaosmonkey/reader");

    specimen.expect(mount.absolute).toBe(chain(mount));
    specimen.expect(mount.absolute).toBe("/daemon/playground/mode/chaosmonkey/reader");
    specimen.expect(good.absolute).toBe("/daemon/playground");
  });

  specimen.it("string interpolation — Symbol.toPrimitive rides absolute", () => {
    const leaf = new Path("/a").branch("/b").branch("/c");
    specimen.expect(`${leaf}`).toBe("/a/b/c");
    specimen.expect(String(leaf)).toBe(chain(leaf));
  });
});

specimen.describe("Path.absolute — divergence set (branched PARENTS: heritage wins)", () => {
  specimen.it("the daemon-mount crash: heir-walk poisons the parent, heritage does not", () => {
    const mount = new Path("/testament/instance/mountpoint").branch("/daemon_spanish");
    mount.branch("test-language-spanish.viva.db");
    mount.branch("migrations");

    specimen.expect(chain(mount)).toBe("/testament/instance/mountpoint/daemon_spanish/test-language-spanish.viva.db");
    specimen.expect(heritage(mount)).toBe("/testament/instance/mountpoint/daemon_spanish");
    specimen.expect(mount.absolute).toBe(heritage(mount));

    const store = `${mount.absolute}/homepage/aprende/bundle`;
    specimen.expect(store.includes(".viva.db")).toBe(false);
  });

  specimen.it("freight.path stays true after serving cargo", () => {
    const freight = new Path("/repo/freight/audio");
    freight.branch("/hola.mp3");
    freight.branch("/adios.mp3");

    specimen.expect(chain(freight)).toBe("/repo/freight/audio/hola.mp3");
    specimen.expect(freight.absolute).toBe("/repo/freight/audio");
  });

  specimen.it("a held repository ref survives repeated import branching", () => {
    const repository = new Path("/repo");
    repository.branch("subsystems/typology/mod.client.js");
    repository.branch("subsystems/drapes/mod.js");

    specimen.expect(repository.absolute).toBe("/repo");
    specimen.expect(repository.branch("registry").absolute).toBe("/repo/registry");
  });

  specimen.it("derived getters ride the pure absolute on a branched parent", () => {
    const mount = new Path("/base/daemon_x");
    mount.branch("x.viva.db");

    specimen.expect(mount.dirname).toBe("/base");
    specimen.expect(mount.filename).toBe(null);
    specimen.expect(mount.json.path).toBe("/base/daemon_x");
    specimen.expect(`${mount}`).toBe("/base/daemon_x");
  });
});

specimen.describe("the flip is Path-scoped — neighbors keep their semantics", () => {
  specimen.it("Signature.absolute keeps the heir walk (signal/vector semantics)", () => {
    const root = new Signature("/turn");
    const child = root.branch("/open");

    specimen.expect(root.absolute).toEqual(["/turn", "/open"]);
    specimen.expect(child.absolute).toEqual(["/turn", "/open"]);
    specimen.expect(root.heir).toBe(child);
  });

  specimen.it("Url owns branch + absolute — untouched", () => {
    const attach = new Url("http://localhost:2501/attached");
    const bundle = attach.branch("/bundle").branch("/daemon/playground/mode/chaosmonkey/reader");

    specimen.expect(bundle.absolute).toBe("http://localhost:2501/attached/bundle/daemon/playground/mode/chaosmonkey/reader");
    specimen.expect(attach.absolute).toBe("http://localhost:2501/attached");
  });

  specimen.it("ctor re-wrap still drops the trace — compose strings across ctors", () => {
    const rebased = new Path("/abs/dir").branch("/freight/audio");
    specimen.expect(new Path(rebased).absolute).toBe("/freight/audio");
    specimen.expect(new Path("/abs/dir" + "/freight/audio").absolute).toBe("/abs/dir/freight/audio");
  });
});
