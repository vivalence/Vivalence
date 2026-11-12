import { Url, Connection, Vector, Aperture, shape, shard, sleep, v } from "@vivalence/typology";
import { metronome } from "@vivalence/typology/scenarios";
import { create as harnessed } from "./cortex.js";
import { tiers, TIER_POINTS } from "./fixtures.js";
import { lighthouseOf, SECRET } from "./daemon.js";
import { signer } from "../../subjects/lighthouse/signer.js";
import { userspace } from "../../subjects/runtime/lifecycle/3-integration.js";

export const TOOL = { tool: { id: "c1", name: "lookup", input: { query: "x" } } };
export const OBJECT = {
  packets: [{
    event: "/turn/full",
    turn: { role: "assistant", parts: [{ type: "object", data: { answer: "42" } }], meta: { state: "complete" } },
  }],
};
export const SPOKEN = {
  packets: [
    { event: "/turn/open", turn: { role: "user" } },
    { event: "/part/open", index: 0, part: { type: "text", text: "" } },
    { event: "/part/draft", index: 0, part: { text: "buon" } },
    { event: "/part/delta", index: 0, part: { text: "buongiorno" } },
    { event: "/part/close", index: 0 },
    { event: "/turn/close", turn: {} },
  ],
};

const lookup = async (ctx) => {
  const found = await ctx.mode.harness.object.render({
    controller: ctx.controller.branch("object"),
    thread: ctx.thread,
    turns: [{ role: "user", parts: [{ type: "text", text: ctx.input.query }] }],
    output: v.object({ answer: v.string() }),
  });
  return { message: found.product.object.answer };
};

export async function create({ port = 0, script = (index) => [TOOL, OBJECT, { deltas: 6 }][index % 3] } = {}) {
  const clock = metronome.metronome(script);
  const spoken = metronome.metronome(() => SPOKEN, "verbatim");
  const world = await harnessed({ faculties: [{ ...clock.faculty, tune: TIER_POINTS.capable }, spoken.faculty] });
  const { daemon, dewey, cortex, em, datamap, runtime: kernel, twitch, fixtures } = world;
  dewey.tools = new Vector().open({ nature: "lookup", input: v.object({ query: v.string() }) }, lookup);

  const stranger = em.create(tiers.user.entity, { slug: "stranger" });
  await em.flush();

  const lighthouse = lighthouseOf(datamap, kernel.user);
  const runtime = { datamap, entities: kernel, twitch, lighthouse, aperture: new Aperture().use(shard.datamap.inject(datamap)) };
  await userspace({ aperture: runtime.aperture, runtime }, async () => {});
  runtime.aperture.open("/status", () => "RUNNING");
  runtime.aperture.branch("/metadata").open("/datamap", () => shard.datamap.strip(datamap.getMetadata())).open("/aperture", () => shape.strip(runtime.aperture));
  daemon.aperture.use(shard.datamap.inject(datamap)).use(lighthouse.authenticate).use(lighthouse.bind);
  runtime.aperture.branch(daemon.reference.nature, daemon.aperture);

  const gate = shard.serve.multiplex(runtime.aperture);
  runtime.aperture.open("/multiplex", gate);
  const abort = new AbortController();
  const handler = shape.http(runtime.aperture);
  const server = Deno.serve({ port, signal: abort.signal, onListen() {} }, handler);
  await sleep.ms(50);

  const sign = signer(SECRET);
  const tokens = { [fixtures.user.id]: await sign.access(fixtures.user), [stranger.id]: await sign.access(stranger) };
  const connect = (who) =>
    new Connection(new Url("http://test"), shard.transmitter.inline(handler)).use(async (ctx, next) => {
      ctx.request.headers.set("authorization", `Bearer ${tokens[who.id]}`);
      await next();
    });

  return {
    ...world,
    runtime,
    lighthouse,
    tokens,
    clock,
    spoken,
    gate,
    connect,
    fixtures: { ...fixtures, stranger },
    url: new Url(`http://localhost:${server.addr.port}`),
    async close() {
      await daemon.entities.activity.remove({});
      abort.abort();
      await sleep.ms(20);
      await world.orm.close();
    },
  };
}
