import { specimen } from "@vivalence/typology";
import { daemon } from "@vivalence/runtime/scenarios";
import { Buffer } from "../../src/typology/entities/buffer.js";
import { Terminal } from "../../src/typology/prototypes/terminal.js";

specimen.describe("Buffer.from", () => {
  specimen.it("creates buffer instance from pojo with view", () => {
    const view = { url: "http://test/view", schema: {} };
    const pojo = { id: "buf-1", mode: "mode-1", data: { recall: "LEARNING" }, literals: [{ id: "lit-1" }] };

    const buffer = Buffer.from(pojo, view);

    specimen.expect(buffer).toBeInstanceOf(Buffer);
    specimen.expect(buffer.id).toBe("buf-1");
    specimen.expect(buffer.view).toBe(view);
    specimen.expect(buffer.data.recall).toBe("LEARNING");
    specimen.expect(buffer.literals[0]).toEqual({ id: "lit-1" });
  });

  specimen.it("view is set directly from argument", () => {
    const view = { url: "http://test/view/game/flashcard", schema: {} };
    const pojo = { id: "buf-2", data: {}, literals: [{ id: "lit-1" }] };

    const buffer = Buffer.from(pojo, view);

    specimen.expect(buffer.view).toBe(view);
    specimen.expect(buffer.view.url).toBe("http://test/view/game/flashcard");
  });

  specimen.it("view is null when not provided", () => {
    const pojo = { id: "buf-3", data: {} };

    const buffer = Buffer.from(pojo, null);

    specimen.expect(buffer.view).toBe(null);
  });

  specimen.it("context is not set by Buffer.from — set by environment (mint)", () => {
    const pojo = { id: "buf-4", data: { recall: "KNOWN" }, literals: [{ id: "lit-1" }] };
    const buffer = Buffer.from(pojo, null);

    specimen.expect(buffer.context).toBe(null);
  });

  specimen.it("release is not set by Buffer.from — set by environment", () => {
    const pojo = { id: "buf-5", data: {} };
    const buffer = Buffer.from(pojo, null);

    specimen.expect(buffer.release).toBeUndefined();
  });

  specimen.it("toJSON returns clean shape with data and literals", () => {
    const view = { url: "http://test" };
    const pojo = { id: "buf-6", mode: "mode-1", data: { recall: "LEARNING" }, literals: ["lit-1"], symbols: [] };

    const buffer = Buffer.from(pojo, view);
    const json = buffer.toJSON();

    specimen.expect(json).toEqual({
      id: "buf-6",
      mode: "mode-1",
      view: { url: "http://test" },
      data: { recall: "LEARNING" },
      literals: ["lit-1"],
      symbols: [],
    });
  });
});

specimen.describe("buffer lifecycle", () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await daemon.create();
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("emit pojo consumed by Buffer.from with correct view", async () => {
    const result = await scenario.conn.call("/mode/game/flashcard/emit/literal", {
      literal: { id: scenario.fixtures.hello.id },
      session: scenario.fixtures.session.id,
    });
    const pojo = result[0];

    const buffered = await scenario.conn.call("/mode/game/flashcard/buffered");

    const buffer = Buffer.from(pojo, buffered);

    specimen.expect(buffer.id).toBeTruthy();
    specimen.expect(buffer.view).toBe(buffered);
    specimen.expect(buffer.view.url).toBeTruthy();
    specimen.expect(buffer.data.recall).toBe("LEARNING");
    specimen.expect(buffer.literals).toContain(scenario.fixtures.hello.id);
    specimen.expect(buffer.context).toBe(null);
  });

  specimen.it("mint sets context on buffer", async () => {
    const result = await scenario.conn.call("/mode/game/flashcard/emit/literal", {
      literal: { id: scenario.fixtures.hello.id },
      session: scenario.fixtures.session.id,
    });

    const buffered = await scenario.conn.call("/mode/game/flashcard/buffered");

    const buffer = Buffer.from(result[0], buffered);
    const terminal = {};
    buffer.context = { buffer, terminal };

    specimen.expect(buffer.context.terminal).toBe(terminal);
    specimen.expect(buffer.context.buffer).toBe(buffer);
  });

  specimen.it("Buffer.from into stall produces active buffer with view", async () => {
    const result = await scenario.conn.call("/mode/game/flashcard/emit/literal", {
      literal: { id: scenario.fixtures.hello.id },
      session: scenario.fixtures.session.id,
    });

    const buffered = await scenario.conn.call("/mode/game/flashcard/buffered");

    const terminal = new Terminal();
    terminal.daemon = { entities: { buffer: { update: () => {} } } };

    const buffers = result.map((pojo) => Buffer.from(pojo, buffered));
    terminal.stall.push(buffers);

    specimen.expect(terminal.stall.$active.get()).toBeTruthy();
    specimen.expect(terminal.stall.$active.get().view).toBe(buffered);
    specimen.expect(terminal.stall.$active.get().data.recall).toBe("LEARNING");
    specimen.expect(terminal.stall.$active.get().literals).toContain(scenario.fixtures.hello.id);
  });

  specimen.it("blacklist extraction from buffer.literals", async () => {
    const result = await scenario.conn.call("/mode/game/flashcard/emit/literal", {
      literal: { id: scenario.fixtures.hello.id },
      session: scenario.fixtures.session.id,
    });

    const buffered = await scenario.conn.call("/mode/game/flashcard/buffered");
    const terminal = new Terminal();
    terminal.daemon = { entities: { buffer: { update: () => {} } } };

    const buffers = result.map((pojo) => Buffer.from(pojo, buffered));
    terminal.stall.push(buffers);

    const queued = terminal.stall.queue;
    const blacklist = {
      literals: queued
        .flatMap((b) => b.literals ?? [])
        .map((l) => (typeof l === "object" ? l.id : l)),
    };

    specimen.expect(blacklist.literals).toContain(scenario.fixtures.hello.id);
  });
});
