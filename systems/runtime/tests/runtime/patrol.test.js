import { join } from "@std/path";
import { belt, mime, specimen, v } from "@vivalence/typology";
import { FileEntity } from "@vivalence/runtime";
import { seed } from "../scenarios/datamap.js";

// FileRepository.sweep — the patrol beat's file census — over Files on :memory: — a census: HOME is empty, every mount lives in a temp dir of this test's own

let scenario;
let directory;

const reload = (id) => scenario.em.fork().findOneOrFail(FileEntity, { id });

specimen.describe("entities.file.sweep — the patrol over Files claims MISSING and withdraws it", () => {
  specimen.beforeAll(async () => {
    scenario = await seed();
    directory = await Deno.makeTempDir({ prefix: "patrol-" });
    await Deno.writeTextFile(join(directory, "present.md"), "# here");
  });
  specimen.afterAll(async () => {
    await scenario.orm.close();
    await Deno.remove(directory, { recursive: true });
  });

  specimen.it("a mount that is gone gains MISSING with a since; a present one stays bare; the claim reads through v.file.trait", async () => {
    const { em, repos, fixtures } = scenario;
    const present = await repos.file.create({ mode: fixtures.mode, path: "present.md", mount: join(directory, "present.md"), mime: mime.markdown, hash: "a1", integrity: "sha256-a1" });
    const gone = await repos.file.create({ mode: fixtures.mode, path: "gone.md", mount: join(directory, "gone.md"), mime: mime.markdown, hash: "b2", integrity: "sha256-b2" });
    await em.flush();

    const report = await scenario.repos.file.sweep(() => "2026-10-21T09:00:00Z");
    specimen.expect(report).toEqual({ missing: [gone.id], returned: [] });

    const missing = await reload(gone.id);
    specimen.expect(missing.traits).toEqual(["MISSING"]);
    specimen.expect(belt.traits.cast(missing, v.file.traits).MISSING).toEqual({ since: "2026-10-21T09:00:00Z" });
    const held = await reload(present.id);
    specimen.expect(held.traits).toEqual([]);
    specimen.expect(belt.traits.cast(held, v.file.traits).MISSING).toEqual({});
    specimen.expect(() => belt.traits.cast({ id: held.id, traits: ["LOST"], trait: held.trait }, v.file.traits)).toThrow(/no trait LOST/);
  });

  specimen.it("a second sweep is idempotent; bytes returning withdraw the claim, bytes leaving raise it", async () => {
    const { repos } = scenario;
    specimen.expect(await scenario.repos.file.sweep()).toEqual({ missing: [], returned: [] });

    await Deno.writeTextFile(join(directory, "gone.md"), "# back");
    await Deno.remove(join(directory, "present.md"));
    const gone = await repos.file.findOneOrFail({ path: "gone.md" });
    const present = await repos.file.findOneOrFail({ path: "present.md" });
    const report = await scenario.repos.file.sweep();
    specimen.expect(report).toEqual({ missing: [present.id], returned: [gone.id] });
    specimen.expect((await reload(gone.id)).traits).toEqual([]);
    specimen.expect((await reload(gone.id)).trait).toEqual({});
    specimen.expect(belt.traits.cast(await reload(present.id), v.file.traits).MISSING.since).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
