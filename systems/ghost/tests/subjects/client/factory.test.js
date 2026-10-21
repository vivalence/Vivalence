import { atom } from "nanostores";
import { Controller, Path, Span, specimen } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";

const mask = () => ({ manifest: { type: "client", slug: "ghost", traits: [] }, reference: new Path("/client/ghost"), modes: [], trait: {} });

specimen.describe("client.factory — mints the Client and its Runtime, connects, dispatches its execution, hands it back RUNNING; nobody awaits its run", () => {
  specimen.it("with no instance the factory rejects before any execution: no runtime to mint, the shell's controller untouched", async () => {
    const root = new Controller({ stdout: new Span("ghost") });
    await specimen.expect(ghost.client.factory({ controller: root, mask: mask(), register: { modes: [] }, instance: null })).rejects.toThrow(/reading 'runtime'/);
    specimen.expect(root.status.is("IDLE")).toBe(true);
  });

  specimen.it("an unreachable remote rejects the factory at the lighthouse call; the multiplex closes, the client never starts", async () => {
    const root = new Controller({ stdout: new Span("ghost") });
    const instance = { runtime: { statics: { remote: "http://127.0.0.1:9/" } } };
    await specimen.expect(ghost.client.factory({ controller: root, mask: mask(), register: { modes: [] }, instance })).rejects.toThrow();
    specimen.expect(root.status.is("IDLE")).toBe(true);
  });
});

specimen.describe("terminals — the reconcile holds one stall watch per terminal and releases a terminal that leaves", () => {
  specimen.it("a terminal entering the store is watched; one leaving is unwatched; the client's stop unwatches the rest", async () => {
    const root = new Controller({ stdout: new Span("ghost") });
    const clientDie = new ghost.client.Client({ controller: root.branch("client"), mask: mask(), register: { modes: [] }, instance: null });
    const $entities = atom([]);
    clientDie.runtime = { entities: { terminal: { $entities }, mode: { $entities: atom([]) } } };
    const watched = new Set();
    const terminal = (id) => ({ id, stall: { watch: () => { watched.add(id); return () => watched.delete(id); } } });
    const first = terminal("t1");
    const second = terminal("t2");
    const stopping = Promise.withResolvers();
    const beat = ghost.client.lifecycle.terminals(clientDie, () => stopping.promise);

    $entities.set([first, second]);
    specimen.expect([...watched]).toEqual(["t1", "t2"]);
    $entities.set([second]);
    specimen.expect([...watched]).toEqual(["t2"]);
    $entities.set([second]);
    specimen.expect([...watched]).toEqual(["t2"]);

    stopping.resolve();
    await beat;
    specimen.expect([...watched]).toEqual([]);
  });
});
