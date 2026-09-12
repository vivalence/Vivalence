import { Url, Connection, Vector, shape, shard, sleep, v } from "@vivalence/typology";
import { metronome } from "@vivalence/typology/scenarios";
import * as routes from "@vivalence/runtime/daemon/aperture";
import { create as harnessed } from "./cortex.js";
import { tiers } from "./fixtures.js";

export const TOKENS = { user: "user-token", stranger: "stranger-token" };

export const TOOL = { tool: { id: "c1", name: "lookup", input: { query: "x" } } };
export const OBJECT = {
  packets: [{
    event: "/turn/full",
    turn: { role: "assistant", parts: [{ type: "object", data: { answer: "42" } }], meta: { state: "complete" }, object: { answer: "42" } },
  }],
};
export const SPOKEN = {
  packets: [
    { event: "/turn/open", turn: { role: "user" } },
    { event: "/verbatim/partial", transcript: "buon" },
    { event: "/verbatim/final", transcript: "buongiorno", segment: 0 },
    { event: "/turn/close" },
  ],
};

const lookup = async (ctx) => {
  const found = await ctx.mode.harness.object.render({
    controller: ctx.controller.branch("object"),
    thread: ctx.thread,
    turns: [{ role: "user", parts: [{ type: "text", text: ctx.input.query }] }],
    output: v.object({ answer: v.string() }),
  });
  return { message: found.output.object.answer };
};

export async function create({ port = 0, script = (index) => [TOOL, OBJECT, { deltas: 6 }][index % 3] } = {}) {
  const world = await harnessed();
  const { daemon, dewey, cortex, em, datamap, fixtures } = world;

  const clock = metronome.metronome(script);
  const spoken = metronome.metronome(() => SPOKEN, "verbatim");
  cortex.register([clock.faculty, spoken.faculty]);
  dewey.tools = new Vector().open({ nature: "lookup", input: v.object({ query: v.string() }) }, lookup);

  const stranger = em.create(tiers.user.entity, { roles: ["USER"], config: {} });
  await em.flush();
  const enrolled = new Map([[TOKENS.user, fixtures.user], [TOKENS.stranger, stranger]]);
  daemon.aperture.use(async (ctx, next) => {
    ctx.authority = {
      authenticate: async (token) => {
        const user = enrolled.get(token);
        if (!user) throw new Error("invalid token");
        return { identity: { id: user.id }, getUser: async () => user, enroll: async () => user };
      },
    };
    await next();
  });

  const die = { good: daemon, datamap, status: { reflection: { code: "ALIVE" } }, manifest: daemon.manifest };
  await routes.userspace(die);
  daemon.aperture.open("/datamap", () => shard.datamap.strip(datamap.introspect()));
  daemon.aperture.branch("/metadata").open("/aperture", () => shape.strip(daemon.aperture));

  const gate = shard.serve.multiplex(daemon.aperture);
  daemon.aperture.open("/multiplex", gate);
  const abort = new AbortController();
  const handler = shape.http(daemon.aperture);
  const server = Deno.serve({ port, signal: abort.signal, onListen() {} }, handler);
  await sleep.ms(50);

  const connect = (who) =>
    new Connection(new Url("http://test"), shard.transmitter.inline(handler)).use(async (ctx, next) => {
      ctx.request.headers.set("authorization", `Bearer ${who === stranger ? TOKENS.stranger : TOKENS.user}`);
      await next();
    });

  return {
    ...world,
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
