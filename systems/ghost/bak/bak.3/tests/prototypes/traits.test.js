import { specimen, Bundle, Connection, Url, Vector, belt, shape, shard } from "@vivalence/typology";
import { Mode } from "../../prototypes/mode.js";
import { mode as traits, client } from "../../traits/index.js";

const { describe, it, expect } = specimen;

const yielded = () => ({
  condition: "NOMINAL",
  output: { message: "ciao", object: { score: 1 }, buffer: [{ id: "b1" }], literal: [{ id: "l1" }], word: [{ id: "w1" }] },
});

const harness = new Vector()
  .open("/dialogue/render", () => yielded())
  .open({ nature: "stream", yields: {} }, async function* () {
    yield { event: "/turn/open" };
    yield { event: "/tool/yield", result: yielded() };
  });

const emitter = new Vector().open("/literal", (ctx) => ({ condition: "NOMINAL", output: { buffer: [{ id: "e1", recall: ctx.input.recall }] } }));
const rules = new Vector().open("/rules/position", (ctx) => ({ fen: ctx.input.fen }));

const aperture = new Vector();
aperture.branch("/metadata").open("/harness", () => shape.strip(harness)).open("/emitter", () => shape.strip(emitter)).open("/aperture", () => shape.strip(rules)).open("/application", () => ({
  url: "http://bench/attached/bundle/daemon/bench/mode/game/dojo",
  bundle: { entries: {} },
  schema: { properties: { recall: {} } },
}));
aperture.branch("/harness", harness);
aperture.branch("/emit", emitter);
aperture.graft(rules);
const host = new Vector();
host.branch("/daemon/bench/mode/game/dojo", aperture);

const multiplexed = (handler) => {
  const inline = shard.transmitter.inline(handler);
  return async (ctx) => {
    await inline(ctx);
    if (ctx.response.body?.getReader) ctx.response.body = belt.sse.frames(ctx.response.body);
  };
};

const repository = (name, merged) => ({ merge: async (pojo) => (merged.push(name), { ...pojo, merged: name }) });

const live = (transport = shard.transmitter.inline) => {
  const merged = [];
  const repositoryMap = { buffer: repository("buffer", merged), thread: repository("thread", merged), literal: repository("literal", merged), mode: repository("mode", merged) };
  const runtime = { entities: { em: { repositoryMap }, ...repositoryMap } };
  const daemon = { entities: { literal: repositoryMap.literal, mode: repositoryMap.mode } };
  const mode = Object.assign(new Mode(), { id: "m1", type: "game", slug: "dojo", traits: ["HARNESSED", "EMITTER", "EXPOSED", "APPLICATION"] });
  mode.connection = new Connection(new Url("http://bench"), transport(shape.http(host))).branch("/daemon/bench/mode/game/dojo");
  mode.runtime = runtime;
  mode.daemon = daemon;
  return { mode, daemon, merged };
};

describe("HARNESSED — the harness wired, every yielded entity merged where it lives", () => {
  it("a rendered yield merges every entity the one em holds a repository for; the rest passes as sent", async () => {
    const { mode, daemon, merged } = live();
    expect(await traits.HARNESSED(mode, daemon)).toBe(undefined);
    expect(Object.keys(mode.metadata.harness.branches).sort()).toEqual(["dialogue", "stream"]);
    const result = await mode.harness.dialogue.render({ text: "ciao" });
    expect(merged.sort()).toEqual(["buffer", "literal"]);
    expect(result.output.buffer).toEqual([{ id: "b1", merged: "buffer" }]);
    expect(result.output.literal).toEqual([{ id: "l1", merged: "literal" }]);
    expect(result.output.word).toEqual([{ id: "w1" }]);
    expect([result.output.message, result.output.object]).toEqual(["ciao", { score: 1 }]);
  });

  it("over HTTP a stream arrives as SSE frames the harness leaves to the reader", async () => {
    const { mode, daemon, merged } = live();
    await traits.HARNESSED(mode, daemon);
    const packets = [];
    for await (const packet of await mode.harness.stream({})) packets.push(packet);
    expect(packets.map((packet) => packet.event)).toEqual(["/turn/open", "/tool/yield"]);
    expect(merged).toEqual([]);
  });

  it("over the multiplex a streamed /tool/yield is merged in flight, every other packet passes untouched", async () => {
    const { mode, daemon, merged } = live(multiplexed);
    await traits.HARNESSED(mode, daemon);
    const packets = [];
    for await (const packet of await mode.harness.stream({})) packets.push(packet);
    expect(packets.map((packet) => packet.event)).toEqual(["/turn/open", "/tool/yield"]);
    expect(packets[1].result.output.buffer).toEqual([{ id: "b1", merged: "buffer" }]);
    expect(merged.sort()).toEqual(["buffer", "literal"]);
  });
});

describe("EMITTER · EXPOSED · APPLICATION — the mode's routes wired from its own metadata", () => {
  it("EMITTER wires mode.emit under /emit", async () => {
    const { mode, daemon } = live();
    await traits.EMITTER(mode, daemon);
    expect(Object.keys(mode.metadata.emitter.branches)).toEqual(["literal"]);
    expect(await mode.emit.literal({ recall: "LEARNING" })).toEqual({ condition: "NOMINAL", output: { buffer: [{ id: "e1", recall: "LEARNING" }] } });
  });

  it("EXPOSED wires mode.call over the mode's aperture", async () => {
    const { mode, daemon } = live();
    await traits.EXPOSED(mode, daemon);
    expect(await mode.call.rules.position({ fen: "8/8" })).toEqual({ fen: "8/8" });
  });

  it("APPLICATION reads the bundle record into mode.application", async () => {
    const { mode, daemon } = live();
    await traits.APPLICATION(mode, daemon);
    expect(mode.application.url).toBe("http://bench/attached/bundle/daemon/bench/mode/game/dojo");
    expect(mode.application.schema).toEqual({ properties: { recall: {} } });
    expect(mode.application.bundle).toBeInstanceOf(Bundle);
    expect(mode.toJSON().application.url).toBe(mode.application.url);
  });

  it("the trait table is keyed by trait name for stagger; GENERATIVE is a declared no-op", () => {
    expect(Object.keys(traits).sort()).toEqual(["APPLICATION", "EMITTER", "EXPOSED", "GENERATIVE", "HARNESSED"]);
    expect(traits.GENERATIVE()).toBe(undefined);
  });
});

describe("HOME — the mode a thread with none enters: the user's over the client's", () => {
  const MEMO = "/daemon/memo/mode/srs/memo";
  const PROBE = "/runtime/house/mode/home/probe";
  const holder = (user, mask) => ({ runtime: { lighthouse: { user } }, mask });
  const homed = (reference) => ({ traits: ["HOME"], trait: { HOME: { reference } } });

  it("the client's HOME when the user carries none — the AUTOLOGIN user's card", () => {
    expect(client.home.reference(holder({ id: "u1", slug: "localhost", traits: [], trait: {} }, homed(MEMO)))).toBe(MEMO);
  });

  it("the user's HOME over the client's", () => {
    expect(client.home.reference(holder(homed(PROBE), homed(MEMO)))).toBe(PROBE);
  });

  it("a HOME named in trait but not claimed in traits is no HOME; neither carrying one is null", () => {
    expect(client.home.reference(holder({ traits: [], trait: homed(PROBE).trait }, { traits: [], trait: {} }))).toBe(null);
    expect(client.home.reference(holder(null, { traits: [], trait: {} }))).toBe(null);
  });
});
