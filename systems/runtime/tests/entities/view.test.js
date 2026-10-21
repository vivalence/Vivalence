import { mime, specimen } from "@vivalence/typology";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { BufferEntity, FileEntity, IntentEntity, ModeEntity, NoteEntity, ThreadEntity, TurnEntity, ViewEntity } from "@vivalence/runtime";
import { seed } from "../scenarios/datamap.js";

// the entities on :memory: — View · File · Buffer · Turn · Note · Mode wired as m87 rulings 36 · 38 · 39 · F name it

let scenario;

const reload = (em, Entity, id, populate) => em.fork().findOneOrFail(Entity, { id }, { populate });

specimen.describe("entities — View · File · Buffer · Turn · Note", () => {
  specimen.beforeAll(async () => {
    scenario = await seed();
  });
  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("a View is one row per (mode, slug, mime); the repository's unique() names the triple", async () => {
    const { em, repos, fixtures } = scenario;
    const tty = await repos.view.create({ mode: fixtures.mode, slug: "play", mime: mime.tty.solid, entry: "board.js" });
    const dom = await repos.view.create({ mode: fixtures.mode, slug: "play", mime: mime.dom.solid, entry: "board.js" });
    await em.flush();

    specimen.expect(repos.view.unique({ mode: "m", slug: "play", mime: mime.tty.solid, entry: "x" })).toEqual({ mode: "m", slug: "play", mime: mime.tty.solid });
    specimen.expect(tty.id).not.toBe(dom.id);
    specimen.expect((await reload(em, ViewEntity, tty.id)).traits).toEqual([]);

    em.create(ViewEntity, { mode: fixtures.mode, slug: "play", mime: mime.tty.solid, entry: "again.js" });
    await specimen.expect(em.flush()).rejects.toThrow(UniqueConstraintViolationException);
    em.clear();
  });

  specimen.it("a View owns its Files (file.view, mappedBy); entry names the one the client imports", async () => {
    const { em, repos, fixtures } = scenario;
    const view = await repos.view.findOneOrFail({ slug: "play", mime: mime.tty.solid });
    const source = await repos.file.create({ mode: fixtures.mode, view, path: "board.jsx", mount: "/tmp/play/board.jsx", mime: mime.javascript, hash: "a1", integrity: "sha256-a1" });
    const built = await repos.file.create({ mode: fixtures.mode, view, path: "board.js", mount: "/tmp/play/board.js", mime: mime.javascript, hash: "b2", integrity: "sha256-b2", bytes: 4096 });
    await em.flush();

    const stored = await reload(em, ViewEntity, view.id, ["files"]);
    specimen.expect(stored.files.getItems().map((file) => file.path).sort()).toEqual(["board.js", "board.jsx"]);
    specimen.expect(stored.files.getItems().find((file) => file.path === stored.entry).id).toBe(built.id);
    specimen.expect((await reload(em, FileEntity, source.id)).view.id).toBe(view.id);
    specimen.expect((await reload(em, FileEntity, source.id)).traits).toEqual([]);
  });

  specimen.it("a File without a view is content; a Buffer loads Files (buffer_files) and pins Views (buffer_views)", async () => {
    const { em, repos, fixtures } = scenario;
    const thread = em.create(ThreadEntity, { user: fixtures.user, mode: fixtures.mode, traits: [] });
    await em.flush();
    const page = await repos.file.create({ mode: fixtures.mode, path: "notes.md", mount: "/tmp/play/notes.md", mime: mime.markdown, hash: "c3", integrity: "sha256-c3" });
    const view = await repos.view.findOneOrFail({ slug: "play", mime: mime.tty.solid });
    const buffer = await repos.buffer.create({ mode: fixtures.mode.id, thread: thread.id, data: { fen: "start" } });
    buffer.files.add(page);
    buffer.views.add(view);
    await em.flush();

    const stored = await reload(em, BufferEntity, buffer.id, ["files", "views"]);
    specimen.expect(stored.mime).toBe(mime.json);
    specimen.expect(stored.files.getItems().map((file) => file.id)).toEqual([page.id]);
    specimen.expect(stored.views.getItems().map((held) => held.id)).toEqual([view.id]);
    specimen.expect((await reload(em, FileEntity, page.id)).view).toBe(null);
    specimen.expect((await reload(em, FileEntity, page.id, ["buffers"])).buffers.getItems().map((held) => held.id)).toEqual([buffer.id]);
    specimen.expect((await reload(em, ViewEntity, view.id, ["buffers"])).buffers.getItems().map((held) => held.id)).toEqual([buffer.id]);
  });

  specimen.it("the mime is the owner's: a mode's mint overrides the json kind", async () => {
    const { em, repos, fixtures } = scenario;
    const kind = "application/vnd.viva.daemon.test.mode.test.test+json";
    const thread = em.create(ThreadEntity, { user: fixtures.user, mode: fixtures.mode, traits: [] });
    await em.flush();
    const buffer = await repos.buffer.create({ mode: fixtures.mode.id, thread: thread.id, mime: kind, data: {} });
    await em.flush();
    specimen.expect((await reload(em, BufferEntity, buffer.id)).mime).toBe(kind);
  });

  specimen.it("a Turn surfaces Buffers (buffer_turns, the buffer owns); the thread is taken from the first turn", async () => {
    const { em, repos, fixtures } = scenario;
    const thread = em.create(ThreadEntity, { user: fixtures.user, mode: fixtures.mode, traits: [] });
    await em.flush();
    const turn = await repos.turn.chain({ thread: thread.id, role: "assistant", parts: [] });
    const buffer = await repos.buffer.create({ mode: fixtures.mode.id, turns: [turn.id], data: {} });
    buffer.turns.add(turn);
    await em.flush();

    const stored = await reload(em, BufferEntity, buffer.id, ["turns"]);
    specimen.expect(stored.thread.id).toBe(thread.id);
    specimen.expect(stored.turns.getItems().map((held) => held.id)).toEqual([turn.id]);
    specimen.expect((await reload(em, TurnEntity, turn.id, ["buffers"])).buffers.getItems().map((held) => held.id)).toEqual([buffer.id]);
  });

  specimen.it("a Note hangs on a buffer or a turn, never both required; the scope index admits one slug per carrier", async () => {
    const { em, repos, fixtures } = scenario;
    const buffer = await repos.buffer.findOneOrFail({ data: { fen: "start" } });
    const turn = await repos.turn.findOneOrFail({ role: "assistant" });
    const onBuffer = await repos.note.create({ slug: "margin", buffer });
    const onTurn = await repos.note.create({ slug: "margin", turn });
    await em.flush();

    specimen.expect((await reload(em, BufferEntity, buffer.id, ["notes"])).notes.getItems().map((held) => held.id)).toEqual([onBuffer.id]);
    specimen.expect((await reload(em, TurnEntity, turn.id, ["notes"])).notes.getItems().map((held) => held.id)).toEqual([onTurn.id]);
    specimen.expect((await reload(em, NoteEntity, onBuffer.id)).turn).toBe(null);

    await repos.note.create({ slug: "margin", buffer });
    await specimen.expect(em.flush()).rejects.toThrow(UniqueConstraintViolationException);
    em.clear();
  });

  specimen.it("a Mode owns its Views: removing the mode removes them, and their Files with them", async () => {
    const { em, repos } = scenario;
    const doomed = repos.mode.create({ slug: "doomed", type: "test", traits: [], installed: "installed" });
    await em.flush();
    const view = await repos.view.create({ mode: doomed, slug: "gone", mime: mime.tty.solid, entry: "gone.js" });
    await repos.file.create({ mode: doomed, view, path: "gone.js", mount: "/tmp/doomed/gone.js", mime: mime.javascript, hash: "d4", integrity: "sha256-d4" });
    await em.flush();
    specimen.expect((await reload(em, ModeEntity, doomed.id, ["views"])).views.getItems().map((held) => held.slug)).toEqual(["gone"]);

    em.remove(await em.findOneOrFail(ModeEntity, doomed.id, { populate: ["views"] }));
    await em.flush();
    specimen.expect(await em.fork().count(ViewEntity, { slug: "gone" })).toBe(0);
    specimen.expect(await em.fork().count(FileEntity, { path: "gone.js" })).toBe(0);
  });

  specimen.it("the traits column is json on Buffer · Intent · File · View — a claim the table validates, never the schema", async () => {
    const { orm } = scenario;
    const columns = Object.fromEntries(
      [BufferEntity, IntentEntity, FileEntity, ViewEntity].map((Entity) => [Entity.name, orm.getMetadata().get(Entity).properties.traits]),
    );
    for (const held of Object.values(columns)) {
      specimen.expect(held.columnTypes).toEqual(["json"]);
      specimen.expect(held.enum).toBeFalsy();
    }
    const rebuilt = [...(await orm.schema.getUpdateSchemaSQL()).matchAll(/create table `(\w+)__temp_alter`/g)].map((match) => match[1]);
    specimen.expect(rebuilt).toEqual([]);
  });
});
