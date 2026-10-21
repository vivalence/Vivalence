import { Aperture, Path, specimen, steer, v } from "@vivalence/typology";
import { FileRepository, traits } from "@vivalence/runtime";

const { FILESINK, VIEWABLE } = traits.mode;

specimen.describe("FILESINK — /files/receive reads the payload off ctx.input through the real aperture", () => {
  let mountpoint;
  const recorded = [];
  const context = {
    entities: {
      file: { ensure: async (row) => (recorded.push(row), row), em: { flush: async () => {} }, record: FileRepository.prototype.record },
      em: { flush: async () => {} },
    },
  };

  specimen.beforeAll(async () => {
    mountpoint = await Deno.makeTempDir({ prefix: "filesink-" });
  });
  specimen.afterAll(async () => {
    await Deno.remove(mountpoint, { recursive: true });
  });

  specimen.it("a posted { path, bytes } lands under the mountpoint; mime is read off the extension", async () => {
    const mode = { aperture: new Aperture(), mountpoint: new Path(mountpoint), entity: { id: 7 }, files: {} };
    FILESINK(mode, context);
    const bytes = new TextEncoder().encode("# Q3");
    const file = await steer.dispatch.invoke(mode.aperture, "/files/receive", steer.strategy.request)({ path: "notes/q3.md", bytes });
    specimen.expect(file.path).toBe("notes/q3.md");
    specimen.expect(file.mime).toBe("text/markdown");
    specimen.expect(file.bytes).toBe(4);
    specimen.expect(await Deno.readTextFile(`${mountpoint}/notes/q3.md`)).toBe("# Q3");
    specimen.expect(recorded).toHaveLength(1);
  });
});

specimen.describe("VIEWABLE — a bare mode.buffer() seats data before the fill, so the schema's defaults land", () => {
  const created = [];
  const context = {
    reference: new Path("/runtime/runtime"),
    entities: { buffer: { create: async (row) => (created.push(row), row) } },
  };
  const mode = {
    entity: { id: 9 },
    manifest: { type: "home", slug: "primer" },
    module: { buffer: v.buffer({ data: { history: v.array(v.string()).default([]), concept: v.string().optional() } }) },
  };

  specimen.it("mode.buffer() lands { history: [] }, never undefined", async () => {
    await VIEWABLE(mode, context);
    const buffer = await mode.buffer();
    specimen.expect(buffer.data).toEqual({ history: [] });
  });

  specimen.it("a desc carrying data keeps it, filled; the caller's desc is not mutated", async () => {
    const desc = { data: { concept: "salve" } };
    const buffer = await mode.buffer(desc);
    specimen.expect(buffer.data).toEqual({ history: [], concept: "salve" });
    specimen.expect(desc).toEqual({ data: { concept: "salve" } });
  });
});
