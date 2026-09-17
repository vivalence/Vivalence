import { specimen, View } from "@vivalence/typology";
import { daemon } from "@vivalence/runtime/scenarios";
import { Buffer } from "../../src/typology/entities/buffer.js";

specimen.describe("Buffer", () => {
  specimen.it("hydrates from a pojo; data rides the atom accessor", () => {
    const pojo = { id: "buf-1", mode: "mode-1", data: { recall: "LEARNING" }, literals: [{ id: "lit-1" }] };

    const buffer = Object.assign(new Buffer(), pojo);

    specimen.expect(buffer).toBeInstanceOf(Buffer);
    specimen.expect(buffer.id).toBe("buf-1");
    specimen.expect(buffer.data.recall).toBe("LEARNING");
    specimen.expect(buffer.literals[0]).toEqual({ id: "lit-1" });
  });

  specimen.it("a view record casts to a View instance on assignment", () => {
    const record = {
      kind: "svelte",
      hash: "deadbeef",
      mount: "/deadbeef.svelte.mjs",
      bundle: { entries: [{ type: "js", mount: "/deadbeef.svelte.mjs", integrity: "sha", bytes: 9 }] },
    };
    const buffer = Object.assign(new Buffer(), { id: "buf-2", data: {}, view: record });

    specimen.expect(buffer.view).toBeInstanceOf(View);
    specimen.expect(buffer.view.hash).toBe("deadbeef");
    specimen.expect(buffer.view.bundle.entries[0].bytes).toBe(9);

    const plain = Object.assign(new Buffer(), { id: "buf-3", data: {} });
    specimen.expect(plain.view).toBe(null);
  });

  specimen.it("toJSON carries data + view past the accessor skip", () => {
    const record = { kind: "svelte", mount: "/x.svelte.mjs", bundle: { entries: [{ type: "js", mount: "/x.svelte.mjs", bytes: 1 }] } };
    const buffer = Object.assign(new Buffer(), { id: "buf-4", data: { recall: "KNOWN" }, view: record });

    const json = JSON.parse(JSON.stringify(buffer));
    specimen.expect(json.data.recall).toBe("KNOWN");
    specimen.expect(json.view.mount).toBe("/x.svelte.mjs");
    specimen.expect(json.$view).toBe(undefined);
    specimen.expect(json.$data).toBe(undefined);
  });

  specimen.it("context is environment-set; release is a method", () => {
    const buffer = Object.assign(new Buffer(), { id: "buf-5", data: {} });
    specimen.expect(buffer.context).toBe(null);
    specimen.expect(typeof buffer.release).toBe("function");
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

  specimen.it("an emitted pojo hydrates a client Buffer (view null on app rows)", async () => {
    const result = await scenario.conn.call("/mode/game/flashcard/emit/literal", {
      literal: { id: scenario.fixtures.hello.id },
      thread: scenario.fixtures.thread.id,
    });
    specimen.expect(result.condition).toBe("NOMINAL");
    const pojo = result.output.buffer[0];

    const buffer = Object.assign(new Buffer(), pojo);

    specimen.expect(buffer.id).toBeTruthy();
    specimen.expect(buffer.view).toBe(null);
    specimen.expect(buffer.data.recall).toBe("LEARNING");
    specimen.expect(buffer.literals.map((literal) => literal.id)).toContain(scenario.fixtures.hello.id);
    specimen.expect(buffer.context).toBe(null);
  });

  specimen.it("mint sets context on buffer", async () => {
    const result = await scenario.conn.call("/mode/game/flashcard/emit/literal", {
      literal: { id: scenario.fixtures.hello.id },
      thread: scenario.fixtures.thread.id,
    });

    const buffer = Object.assign(new Buffer(), result.output.buffer[0]);
    const terminal = {};
    buffer.context = { buffer, terminal };

    specimen.expect(buffer.context.terminal).toBe(terminal);
    specimen.expect(buffer.context.buffer).toBe(buffer);
  });
});
