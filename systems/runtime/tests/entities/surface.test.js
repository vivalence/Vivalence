import { mime, specimen } from "@vivalence/typology";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { BufferEntity, FileEntity, IntentEntity, ModeEntity, NoteEntity, ThreadEntity, TurnEntity, SurfaceEntity } from "@vivalence/runtime";
import { seed } from "../scenarios/datamap.js";

// the entities on :memory: — View · File · Buffer · Turn · Note · Mode wired as m87 rulings 36 · 38 · 39 · F name it

let scenario;

const reload = (em, Entity, id, populate) => em.fork().findOneOrFail(Entity, { id }, { populate });

specimen.describe("entities — Surface · File · Buffer · Turn · Note", () => {
  specimen.beforeAll(async () => {
    scenario = await seed();
  });
  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("a Surface is one row per (mode, slug, mime); the repository's unique() names the triple", async () => {
    const { em, repos, fixtures } = scenario;
    const tty = await repos.surface.create({ mode: fixtures.mode, slug: "play", mime: mime.tty.solid, entry: "board.js" });
    const dom = await repos.surface.create({ mode: fixtures.mode, slug: "play", mime: mime.dom.solid, entry: "board.js" });
    await em.flush();

    specimen.expect(repos.surface.unique({ mode: "m", slug: "play", mime: mime.tty.solid, entry: "x" })).toEqual({ mode: "m", slug: "play", mime: mime.tty.solid });
    specimen.expect(tty.id).not.toBe(dom.id);
    specimen.expect((await reload(em, SurfaceEntity, tty.id)).traits).toEqual([]);

    em.create(SurfaceEntity, { mode: fixtures.mode, slug: "play", mime: mime.tty.solid, entry: "again.js" });
    await specimen.expect(em.flush()).rejects.toThrow(UniqueConstraintViolationException);
    em.clear();
  });

  specimen.it("a Surface owns its Files (file.surface, mappedBy); entry names the one the client imports", async () => {
    const { em, repos, fixtures } = scenario;
    const surface = await repos.surface.findOneOrFail({ slug: "play", mime: mime.tty.solid });
    const source = await repos.file.create({ mode: fixtures.mode, surface, path: "board.jsx", mount: "/tmp/play/board.jsx", mime: mime.javascript, hash: "a1", integrity: "sha256-a1" });
    const built = await repos.file.create({ mode: fixtures.mode, surface, path: "board.js", mount: "/tmp/play/board.js", mime: mime.javascript, hash: "b2", integrity: "sha256-b2", bytes: 4096 });
    await em.flush();

    const stored = await reload(em, SurfaceEntity, surface.id, ["files"]);
    specimen.expect(stored.files.getItems().map((file) => file.path).sort()).toEqual(["board.js", "board.jsx"]);
    specimen.expect(stored.files.getItems().find((file) => file.path === stored.entry).id).toBe(built.id);
    specimen.expect((await reload(em, FileEntity, source.id)).surface.id).toBe(surface.id);
    specimen.expect((await reload(em, FileEntity, source.id)).traits).toEqual([]);
  });

  specimen.it("a File without a surface is content; a Buffer loads Files (buffer_files) and pins Surfaces (buffer_surfaces)", async () => {
    const { em, repos, fixtures } = scenario;
    const thread = em.create(ThreadEntity, { user: fixtures.user, mode: fixtures.mode, traits: [] });
    await em.flush();
    const page = await repos.file.create({ mode: fixtures.mode, path: "notes.md", mount: "/tmp/play/notes.md", mime: mime.markdown, hash: "c3", integrity: "sha256-c3" });
    const surface = await repos.surface.findOneOrFail({ slug: "play", mime: mime.tty.solid });
    const buffer = await repos.buffer.create({ mode: fixtures.mode.id, thread: thread.id, data: { fen: "start" } });
    buffer.files.add(page);
    buffer.surfaces.add(surface);
    await em.flush();

    const stored = await reload(em, BufferEntity, buffer.id, ["files", "surfaces"]);
    specimen.expect(stored.mime).toBe(mime.json);
    specimen.expect(stored.files.getItems().map((file) => file.id)).toEqual([page.id]);
    specimen.expect(stored.surfaces.getItems().map((held) => held.id)).toEqual([surface.id]);
    specimen.expect((await reload(em, FileEntity, page.id)).surface).toBe(null);
    specimen.expect((await reload(em, FileEntity, page.id, ["buffers"])).buffers.getItems().map((held) => held.id)).toEqual([buffer.id]);
    specimen.expect((await reload(em, SurfaceEntity, surface.id, ["buffers"])).buffers.getItems().map((held) => held.id)).toEqual([buffer.id]);
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

  specimen.it("a relation-only edit fires no afterUpdate: buffer.turns.add flushes a collection update, zero change sets — the reactive push stays silent", async () => {
    const { em, repos, fixtures } = scenario;
    const thread = em.create(ThreadEntity, { user: fixtures.user, mode: fixtures.mode, traits: [] });
    await em.flush();
    const turn = await repos.turn.chain({ thread: thread.id, role: "assistant", parts: [] });
    const buffer = await repos.buffer.create({ mode: fixtures.mode.id, thread: thread.id, data: {} });
    await em.flush();

    const heard = [];
    const fork = em.fork();
    fork.getEventManager().registerSubscriber({
      getSubscribedEntities: () => [BufferEntity],
      afterUpdate: (args) => heard.push({ hook: "afterUpdate", entity: args.entity.id }),
      afterFlush: (args) =>
        heard.push({
          hook: "afterFlush",
          changeSets: args.uow.getChangeSets().map((set) => `${set.name}:${set.type}`),
          collections: args.uow.getCollectionUpdates().map((collection) => collection.property.name),
        }),
    });
    (await fork.findOneOrFail(BufferEntity, buffer.id)).turns.add(fork.getReference(TurnEntity, turn.id));
    await fork.flush();

    specimen.expect(heard).toEqual([{ hook: "afterFlush", changeSets: [], collections: ["turns"] }]);
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

  specimen.it("a Mode owns its Surfaces: removing the mode removes them, and their Files with them", async () => {
    const { em, repos } = scenario;
    const doomed = repos.mode.create({ slug: "doomed", type: "test", traits: [], installed: "installed" });
    await em.flush();
    const surface = await repos.surface.create({ mode: doomed, slug: "gone", mime: mime.tty.solid, entry: "gone.js" });
    await repos.file.create({ mode: doomed, surface, path: "gone.js", mount: "/tmp/doomed/gone.js", mime: mime.javascript, hash: "d4", integrity: "sha256-d4" });
    await em.flush();
    specimen.expect((await reload(em, ModeEntity, doomed.id, ["surfaces"])).surfaces.getItems().map((held) => held.slug)).toEqual(["gone"]);

    em.remove(await em.findOneOrFail(ModeEntity, doomed.id, { populate: ["surfaces"] }));
    await em.flush();
    specimen.expect(await em.fork().count(SurfaceEntity, { slug: "gone" })).toBe(0);
    specimen.expect(await em.fork().count(FileEntity, { path: "gone.js" })).toBe(0);
  });

  specimen.it("the traits column is json on Buffer · Intent · File · Surface — a claim the table validates, never the schema", async () => {
    const { orm } = scenario;
    const columns = Object.fromEntries(
      [BufferEntity, IntentEntity, FileEntity, SurfaceEntity].map((Entity) => [Entity.name, orm.getMetadata().get(Entity).properties.traits]),
    );
    for (const held of Object.values(columns)) {
      specimen.expect(held.columnTypes).toEqual(["json"]);
      specimen.expect(held.enum).toBeFalsy();
    }
    const rebuilt = [...(await orm.schema.getUpdateSchemaSQL()).matchAll(/create table `(\w+)__temp_alter`/g)].map((match) => match[1]);
    specimen.expect(rebuilt).toEqual([]);
  });
});
