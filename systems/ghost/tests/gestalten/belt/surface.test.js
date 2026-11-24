import { crypto, mime, specimen, Url } from "@vivalence/typology";
import { atom } from "nanostores";
import * as ghost from "@vivalence/ghost";

// m87 law 3 · 5 · 9 on the client side — the pin, else the mode's View rows (Q10′), unfiltered: each chrome keeps what it runs; the pick the first (m120 Q8);
// bytes proven twice (the header and the row); a view loads by its id, a held fingerprint answers 304 (m120 Q5); a real Deno.serve on a free port

const MODULE = "export default (target) => `mounted ${target}`;\n";
const TAMPERED = "export default () => 'tampered';\n";

let server;
let attach;
let integrity;
let lying;
const answered = [];

const file = (id, path, type, held) => ({ id, path, mime: type, integrity: held });
const surface = (slug, type, entryPath, files) => ({ id: `v-${slug}`, slug, mime: type, entry: entryPath, files });

specimen.describe("ghost belt/surface — candidates · pick · entry · bytes · load", { sanitizeResources: false, sanitizeOps: false }, () => {
  specimen.beforeAll(async () => {
    integrity = `sha256-${await crypto.digest(MODULE)}`;
    lying = `sha256-${await crypto.digest(TAMPERED)}`;
    server = Deno.serve({ port: 0, hostname: "127.0.0.1", onListen() {} }, (request) => {
      const { pathname } = new URL(request.url);
      if (pathname === "/attached/file/f-play") return new Response(MODULE, { headers: { "content-type": mime.javascript, "x-viva-integrity": integrity } });
      if (pathname === "/attached/file/f-lying") return new Response(MODULE, { headers: { "content-type": mime.javascript, "x-viva-integrity": lying } });
      if (pathname === "/attached/file/f-tampered") return new Response(TAMPERED, { headers: { "content-type": mime.javascript, "x-viva-integrity": integrity } });
      if (pathname === "/attached/surface/v-play" && request.headers.get("if-none-match") === `"${integrity}"`) {
        answered.push(304);
        return new Response(null, { status: 304, headers: { etag: `"${integrity}"`, "x-viva-integrity": integrity } });
      }
      if (pathname === "/attached/surface/v-play") {
        answered.push(200);
        return new Response(MODULE, { headers: { "content-type": mime.javascript, etag: `"${integrity}"`, "x-viva-integrity": integrity } });
      }
      if (pathname === "/attached/surface/v-bad") return new Response(TAMPERED, { headers: { "content-type": mime.javascript, "x-viva-integrity": integrity } });
      return new Response("nope", { status: 404 });
    });
    const url = new Url(`http://127.0.0.1:${server.addr.port}/attached`);
    attach = { attached: (path) => url.branch(path).absolute };
  });
  specimen.afterAll(async () => {
    await server.shutdown();
  });

  specimen.it("identity reads an id or an entity", () => {
    specimen.expect(ghost.belt.surface.identity("v-play")).toBe("v-play");
    specimen.expect(ghost.belt.surface.identity({ id: "v-play" })).toBe("v-play");
  });

  specimen.it("candidates: the pools merge in order, a surface held by two pools once; a pool filling later lands in the store; the pools are not mutated", () => {
    const play = { id: "v-play", slug: "play" };
    const pulse = { id: "v-pulse", slug: "pulse" };
    const pinned = atom([pulse]);
    const shipped = atom([]);
    const pool = ghost.belt.surface.candidates(pinned, shipped);
    specimen.expect(pool.get().map((held) => held.slug)).toEqual(["pulse"]);
    shipped.set([play, pulse]);
    specimen.expect(pool.get().map((held) => held.slug)).toEqual(["pulse", "play"]);
    specimen.expect(ghost.belt.surface.candidates(atom([]), atom([])).get()).toEqual([]);
    specimen.expect(pinned.get()).toEqual([pulse]);
    specimen.expect(shipped.get()).toEqual([play, pulse]);
  });

  specimen.it("pick takes the first, a surface without its File too, and leaves its list unsorted; none, undefined; entry fails loud without its file", () => {
    const unbuilt = surface("unbuilt", mime.tty.solid, "bundle/unbuilt.tty.solid.mjs", []);
    const built = surface("built", mime.tty.solid, "a.mjs", [file("3", "a.mjs", mime.javascript, "x")]);
    const listed = [unbuilt, built];
    specimen.expect(ghost.belt.surface.pick(listed).slug).toBe("unbuilt");
    specimen.expect(listed.map((held) => held.slug)).toEqual(["unbuilt", "built"]);
    specimen.expect(ghost.belt.surface.pick([])).toBe(undefined);
    specimen.expect(ghost.belt.surface.entry(built).id).toBe("3");
    specimen.expect(() => ghost.belt.surface.entry(surface("lost", mime.tty.solid, "gone.js", [file("4", "a.js", mime.javascript, "x")]))).toThrow(/lost: no file at its entry gone\.js — its files: a\.js/);
    specimen.expect(() => ghost.belt.surface.entry(surface("bare", mime.tty.solid, "gone.js", []))).toThrow(/its files: none/);
  });

  specimen.it("bytes: the text is served when its sha256 is the header's AND the row's; a row without integrity trusts the header; a lying header, tampered bytes or a 404 fault", async () => {
    specimen.expect(await ghost.belt.surface.bytes(file("f-play", "board.js", mime.javascript, integrity), attach)).toBe(MODULE);
    specimen.expect(await ghost.belt.surface.bytes({ id: "f-play" }, attach)).toBe(MODULE);
    await specimen.expect(ghost.belt.surface.bytes(file("f-lying", "board.js", mime.javascript, integrity), attach)).rejects.toThrow(/is not the header's/);
    await specimen.expect(ghost.belt.surface.bytes(file("f-play", "board.js", mime.javascript, "sha256-0000000000000"), attach)).rejects.toThrow(/the row's 000000000000/);
    await specimen.expect(ghost.belt.surface.bytes(file("f-tampered", "board.js", mime.javascript, integrity), attach)).rejects.toThrow(/sha256/);
    await specimen.expect(ghost.belt.surface.bytes({ id: "f-missing" }, attach)).rejects.toThrow(/\/attached\/file\/f-missing: 404/);
  });

  specimen.it("load fetches the surface by id, imports it from a blob; again, it sends the fingerprint and a 304 keeps the module; a tampered surface or a 404 never loads", async () => {
    const play = surface("play", mime.tty.solid, "bundle/play.tty.solid.mjs", []);
    const module = await ghost.belt.surface.load(play, attach);
    specimen.expect(module.default("cell")).toBe("mounted cell");
    specimen.expect(await ghost.belt.surface.load(play, attach)).toBe(module);
    specimen.expect(answered).toEqual([200, 304]);
    await specimen.expect(ghost.belt.surface.load(surface("bad", mime.tty.solid, "bundle/bad.tty.solid.mjs", []), attach)).rejects.toThrow(/sha256/);
    await specimen.expect(ghost.belt.surface.load(surface("gone", mime.tty.solid, "bundle/gone.tty.solid.mjs", []), attach)).rejects.toThrow(/\/attached\/surface\/v-gone: 404/);
  });
});
