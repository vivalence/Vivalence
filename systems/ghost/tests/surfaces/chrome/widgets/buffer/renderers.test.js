import { mime, specimen } from "@vivalence/typology";
import { cell, following, frame, runs } from "../../../../../surfaces/chrome/widgets/buffer/renderers.js";

const buffer = (RENDERED) => ({ id: "b1", mime: mime.json, data: {}, traits: ["LABELED"], trait: { LABELED: { name: "accounts" }, RENDERED } });

const view = (slug, viewMime = mime.tty.solid, entryMime = mime.javascript) => ({ id: null, slug, mime: viewMime, traits: ["FRAME"], entry: "cells/Glance.js", files: [{ path: "cells/Glance.js", mime: entryMime }] });

specimen.describe("renderers — runs keeps what the tty chrome mounts; frame · cell pick among those by RENDERED's slug", () => {
  specimen.it("runs: a tty solid view runs, a dom one does not", () => {
    specimen.expect(runs(view("memo"))).toBe(true);
    specimen.expect(runs(view("memo", mime.dom.svelte))).toBe(false);
  });

  specimen.it("frame: RENDERED.frame names the slug; empty or stale, the compiled view; none, undefined", () => {
    const source = view("source", mime.tty.solid, "text/jsx");
    const compiled = view("compiled");
    specimen.expect(frame(buffer({ frame: "source" }), [source, compiled])).toBe(source);
    specimen.expect(frame(buffer({}), [source, compiled])).toBe(compiled);
    specimen.expect(frame(buffer({ frame: "gone" }), [source, compiled])).toBe(compiled);
    specimen.expect(frame(buffer({}), [])).toBe(undefined);
  });

  specimen.it("cell: RENDERED.cell names the slug; empty or stale, the first; none, undefined; following steps round", () => {
    const board = view("board");
    const glance = view("glance");
    specimen.expect(cell(buffer({ cell: "glance" }), [board, glance])).toBe(glance);
    specimen.expect(cell(buffer({}), [board, glance])).toBe(board);
    specimen.expect(cell(buffer({ cell: "gone" }), [board, glance])).toBe(board);
    specimen.expect(cell(buffer({}), [])).toBe(undefined);
    specimen.expect(following(glance, [board, glance])).toBe("board");
  });
});
