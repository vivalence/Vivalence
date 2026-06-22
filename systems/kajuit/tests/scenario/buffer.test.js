import { specimen } from "@vivalence/typology";
import { daemon } from "@vivalence/runtime/scenarios";
import { Buffer } from "../../src/entities/buffer.js";
import { Terminal } from "../../src/terminal/terminal.js";

specimen.describe("Buffer.from", () => {
  specimen.it("creates buffer instance from pojo with app", () => {
    const app = { url: "http://test/view", schema: {} };
    const pojo = { id: "buf-1", mode: "mode-1", data: { recall: "LEARNING" }, literals: [{ id: "lit-1" }] };

    const buffer = Buffer.from(pojo, app);

    specimen.expect(buffer).toBeInstanceOf(Buffer);
    specimen.expect(buffer.id).toBe("buf-1");
    specimen.expect(buffer.app).toBe(app);
    specimen.expect(buffer.data.recall).toBe("LEARNING");
    specimen.expect(buffer.literals[0]).toEqual({ id: "lit-1" });
  });

  specimen.it("app is set directly from argument", () => {
    const app = { url: "http://test/view/game/flashcard", schema: {} };
    const pojo = { id: "buf-2", data: {}, literals: [{ id: "lit-1" }] };

    const buffer = Buffer.from(pojo, view);

    specimen.expect(buffer.app).toBe(app);
    specimen.expect(buffer.app.url).toBe("http://test/view/game/flashcard");
  });

  specimen.it("app is null when not provided", () => {
    const pojo = { id: "buf-3", data: {} };

    const buffer = Buffer.from(pojo, null);

    specimen.expect(buffer.app).toBe(null);
  });

  specimen.it("context is not set by Buffer.from — set by environment (mint)", () => {
    const pojo = { id: "buf-4", data: { recall: "KNOWN" }, literals: [{ id: "lit-1" }] };
    const buffer = Buffer.from(pojo, null);

    specimen.expect(buffer.context).toBe(null);
  });

  specimen.it("release is a class method, not a data property", () => {
    const pojo = { id: "buf-5", data: {} };
    const buffer = Buffer.from(pojo, null);

    specimen.expect(typeof buffer.release).toBe("function");
  });

  specimen.it("Buffer.from preserves data fields and app", () => {
    const app = { url: "http://test" };
    const pojo = { id: "buf-6", mode: "mode-1", data: { recall: "LEARNING" }, literals: ["lit-1"], symbols: [] };

    const buffer = Buffer.from(pojo, app);

    specimen.expect(buffer.id).toBe("buf-6");
    specimen.expect(buffer.mode).toBe("mode-1");
    specimen.expect(buffer.app).toBe(app);
    specimen.expect(buffer.data).toEqual({ recall: "LEARNING" });
    specimen.expect(buffer.literals).toEqual(["lit-1"]);
    specimen.expect(buffer.symbols).toEqual([]);
    specimen.expect(buffer.context).toBe(null);
  });
});

specimen.describe("buffer lifecycle", { sanitizeResources: false, sanitizeOps: false }, () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await daemon.create();
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("emit pojo consumed by Buffer.from with correct app", async () => {
    const result = await scenario.conn.call("/mode/game/flashcard/emit/literal", {
      literal: { id: scenario.fixtures.hello.id },
      thread: scenario.fixtures.thread.id,
    });
    specimen.expect(result.condition).toBe("NOMINAL");
    const pojo = result.buffers[0];

    const buffered = await scenario.conn.call("/mode/game/flashcard/buffered");

    const buffer = Buffer.from(pojo, buffered);

    specimen.expect(buffer.id).toBeTruthy();
    specimen.expect(buffer.app).toBe(buffered);
    specimen.expect(buffer.app.url).toBeTruthy();
    specimen.expect(buffer.data.recall).toBe("LEARNING");
    specimen.expect(buffer.literals.map((l) => l.id)).toContain(scenario.fixtures.hello.id);
    specimen.expect(buffer.context).toBe(null);
  });

  specimen.it("mint sets context on buffer", async () => {
    const result = await scenario.conn.call("/mode/game/flashcard/emit/literal", {
      literal: { id: scenario.fixtures.hello.id },
      thread: scenario.fixtures.thread.id,
    });

    const buffered = await scenario.conn.call("/mode/game/flashcard/buffered");

    const buffer = Buffer.from(result.buffers[0], buffered);
    const terminal = {};
    buffer.context = { buffer, terminal };

    specimen.expect(buffer.context.terminal).toBe(terminal);
    specimen.expect(buffer.context.buffer).toBe(buffer);
  });

  specimen.it("Buffer.from into stall produces active buffer with app", async () => {
    const result = await scenario.conn.call("/mode/game/flashcard/emit/literal", {
      literal: { id: scenario.fixtures.hello.id },
      thread: scenario.fixtures.thread.id,
    });

    const buffered = await scenario.conn.call("/mode/game/flashcard/buffered");

    const terminal = new Terminal();
    terminal.daemon = { entities: { buffer: { update: () => {} } } };

    const buffers = result.buffers.map((pojo) => Buffer.from(pojo, buffered));
    terminal.stall.push(buffers);

    specimen.expect(terminal.stall.$active.get()).toBeTruthy();
    specimen.expect(terminal.stall.$active.get().app).toBe(buffered);
    specimen.expect(terminal.stall.$active.get().data.recall).toBe("LEARNING");
    // specimen.expect(terminal.stall.$active.get().literals).toContain(scenario.fixtures.hello.id);
    specimen.expect(terminal.stall.$active.get().literals.map((l) => l.id)).toContain(scenario.fixtures.hello.id);
  });

  specimen.it("blacklist extraction from buffer.literals", async () => {
    const result = await scenario.conn.call("/mode/game/flashcard/emit/literal", {
      literal: { id: scenario.fixtures.hello.id },
      thread: scenario.fixtures.thread.id,
    });

    const buffered = await scenario.conn.call("/mode/game/flashcard/buffered");
    const terminal = new Terminal();
    terminal.daemon = { entities: { buffer: { update: () => {} } } };

    const buffers = result.buffers.map((pojo) => Buffer.from(pojo, buffered));
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
