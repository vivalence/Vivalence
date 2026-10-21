import { crypto, mime, specimen, Url } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";

// m87 law 3 · 5 · 9 on the client side — the pin, else the mode's View rows (Q10′), unfiltered: each chrome keeps what it runs; the pick compiled first;
// bytes proven twice (the header and the row) before a module is imported from a blob; a real Deno.serve on a free port

const MODULE = "export default (target) => `mounted ${target}`;\n";
const TAMPERED = "export default () => 'tampered';\n";

let server;
let attach;
let integrity;
let lying;

const file = (id, path, type, held) => ({ id, path, mime: type, integrity: held });
const view = (slug, type, entryPath, files) => ({ id: `v-${slug}`, slug, mime: type, entry: entryPath, files });

specimen.describe("ghost belt/view — candidates · pick · entry · bytes · load", { sanitizeResources: false, sanitizeOps: false }, () => {
  specimen.beforeAll(async () => {
    integrity = `sha256-${await crypto.digest(MODULE)}`;
    lying = `sha256-${await crypto.digest(TAMPERED)}`;
    const rows = { "v-play": view("play", mime.tty.solid, "board.js", [file("f-play", "board.js", mime.javascript, integrity)]) };
    server = Deno.serve({ port: 0, hostname: "127.0.0.1", onListen() {} }, (request) => {
      const { pathname } = new URL(request.url);
      if (pathname === "/attached/file/f-play") return new Response(MODULE, { headers: { "content-type": mime.javascript, "x-viva-integrity": integrity } });
      if (pathname === "/attached/file/f-lying") return new Response(MODULE, { headers: { "content-type": mime.javascript, "x-viva-integrity": lying } });
      if (pathname === "/attached/file/f-tampered") return new Response(TAMPERED, { headers: { "content-type": mime.javascript, "x-viva-integrity": integrity } });
      const held = rows[pathname.slice("/attached/view/".length)];
      return held && pathname.startsWith("/attached/view/") ? Response.json(held) : new Response("nope", { status: 404 });
    });
    const url = new Url(`http://127.0.0.1:${server.addr.port}/attached`);
    attach = { url, call: async (path) => (await fetch(url.branch(path).absolute)).json() };
  });
  specimen.afterAll(async () => {
    await server.shutdown();
  });

  specimen.it("identity reads an id or a row; row fetches /attached/view/:id by either", async () => {
    specimen.expect(ghost.belt.view.identity("v-play")).toBe("v-play");
    specimen.expect(ghost.belt.view.identity({ id: "v-play" })).toBe("v-play");
    specimen.expect((await ghost.belt.view.row("v-play", attach)).slug).toBe("play");
    specimen.expect((await ghost.belt.view.row({ id: "v-play" }, attach)).entry).toBe("board.js");
  });

  specimen.it("candidates: the pin wins (fetched by id); empty, the buffer's own mode's views from the store, fetched by id; no mode object, none", async () => {
    const mode = (id, views) => ({ id, views });
    specimen.expect((await ghost.belt.view.candidates({ views: ["v-play"], mode: mode("m1", []) }, attach)).map((held) => held.slug)).toEqual(["play"]);
    specimen.expect((await ghost.belt.view.candidates({ views: [], mode: mode("m-play", [{ id: "v-play" }]) }, attach)).map((held) => held.entry)).toEqual(["board.js"]);
    specimen.expect(await ghost.belt.view.candidates({ views: [], mode: mode("m-probe", []) }, attach)).toEqual([]);
    specimen.expect(await ghost.belt.view.candidates({ views: [], mode: "m1" }, attach)).toEqual([]);
    specimen.expect(await ghost.belt.view.candidates({ views: [], mode: null }, attach)).toEqual([]);
  });

  specimen.it("pick takes a compiled entry over a source, the first of equals, and leaves its list unsorted; none, undefined; entry fails loud without its file", () => {
    const source = view("source", mime.tty.solid, "a.jsx", [file("2", "a.jsx", mime.tty.solid, "x")]);
    const built = view("built", mime.tty.solid, "a.mjs", [file("3", "a.mjs", mime.javascript, "x")]);
    const listed = [source, built];
    specimen.expect(ghost.belt.view.pick(listed).slug).toBe("built");
    specimen.expect(listed.map((held) => held.slug)).toEqual(["source", "built"]);
    specimen.expect(ghost.belt.view.pick([])).toBe(undefined);
    specimen.expect(ghost.belt.view.entry(built).id).toBe("3");
    specimen.expect(() => ghost.belt.view.entry(view("lost", mime.tty.solid, "gone.js", [file("4", "a.js", mime.javascript, "x")]))).toThrow(/lost: no file at its entry gone\.js — its files: a\.js/);
    specimen.expect(() => ghost.belt.view.entry(view("bare", mime.tty.solid, "gone.js", []))).toThrow(/its files: none/);
  });

  specimen.it("bytes: the text is served when its sha256 is the header's AND the row's; a row without integrity trusts the header; a lying header, tampered bytes or a 404 fault", async () => {
    specimen.expect(await ghost.belt.view.bytes(file("f-play", "board.js", mime.javascript, integrity), attach)).toBe(MODULE);
    specimen.expect(await ghost.belt.view.bytes({ id: "f-play" }, attach)).toBe(MODULE);
    await specimen.expect(ghost.belt.view.bytes(file("f-lying", "board.js", mime.javascript, integrity), attach)).rejects.toThrow(/is not the header's/);
    await specimen.expect(ghost.belt.view.bytes(file("f-play", "board.js", mime.javascript, "sha256-0000000000000"), attach)).rejects.toThrow(/the row's 000000000000/);
    await specimen.expect(ghost.belt.view.bytes(file("f-tampered", "board.js", mime.javascript, integrity), attach)).rejects.toThrow(/sha256/);
    await specimen.expect(ghost.belt.view.bytes({ id: "f-missing" }, attach)).rejects.toThrow(/\/attached\/file\/f-missing: 404/);
  });

  specimen.it("load imports the entry from a blob and memoizes the module by integrity; a tampered entry never loads", async () => {
    const play = view("play", mime.tty.solid, "board.js", [file("f-play", "board.js", mime.javascript, integrity)]);
    const module = await ghost.belt.view.load(play, attach);
    specimen.expect(module.default("cell")).toBe("mounted cell");
    specimen.expect(await ghost.belt.view.load({ ...play, id: "v-other", files: [file("f-missing", "board.js", mime.javascript, integrity)] }, attach)).toBe(module);
    await specimen.expect(ghost.belt.view.load(view("bad", mime.tty.solid, "board.js", [file("f-tampered", "board.js", mime.javascript, lying)]), attach)).rejects.toThrow(/sha256/);
  });
});
