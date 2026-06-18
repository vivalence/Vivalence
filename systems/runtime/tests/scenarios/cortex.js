import {
  Url,
  Connection,
  shard,
  Mode,
  Path,
  shape,
  Aperture,
  Vector,
  Cortex,
} from "@vivalence/typology";
import { ModeEntity, UserEntity, ThreadEntity, TurnEntity } from "@vivalence/typology/entities";
import { seed } from "./entities.ts";

import { HARNESSED } from "@vivalence/runtime/daemon/traits";

// ─── Mock faculty providers ───────────────────────────────────────────

function textStream(text, role = "assistant") {
  return async function* () {
    yield { event: "/turn/open", turn: { role } };
    yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
    for (const character of text) {
      yield { event: "/part/delta", index: 0, delta: { text: character } };
    }
    yield { event: "/part/close", index: 0 };
    yield {
      event: "/turn/close",
      meta: { usage: { input: 10, output: text.length }, stop: "end_turn" },
    };
  };
}

function textTurn(text, stop = "end_turn") {
  return {
    role: "assistant",
    parts: [{ type: "text", text }],
    meta: { usage: { input: 10, output: text.length }, stop },
  };
}

function toolUseTurn(id, name, input) {
  return {
    role: "assistant",
    parts: [
      { type: "text", text: `thinking about ${name}...` },
      { type: "tool_use", id, name, input: JSON.stringify(input) },
    ],
    meta: { usage: { input: 10, output: 20 }, stop: "tool_use" },
  };
}

function toolUseStream(id, name, input) {
  const inputString = JSON.stringify(input);
  const thinkingText = `thinking about ${name}...`;
  return async function* () {
    yield { event: "/turn/open", turn: { role: "assistant" } };
    yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
    for (const character of thinkingText) {
      yield { event: "/part/delta", index: 0, delta: { text: character } };
    }
    yield { event: "/part/close", index: 0 };
    yield { event: "/part/open", index: 1, part: { type: "tool_use", id: "", name: "", input: "" } };
    yield { event: "/part/delta", index: 1, delta: { id, name, input: inputString } };
    yield { event: "/part/close", index: 1 };
    yield { event: "/turn/close", meta: { usage: { input: 10, output: 20 }, stop: "tool_use" } };
  };
}

function lastUserText(turns) {
  for (let index = turns.length - 1; index >= 0; index--) {
    if (turns[index].role !== "user") continue;
    const text = turns[index].parts?.find((part) => part.type === "text")?.text;
    if (text) return text;
  }
  return "";
}

function hasToolResult(turns) {
  return turns.at(-1)?.parts?.some((part) => part.type === "tool_result");
}

function makeFaculties() {
  return [
    {
      type: "dialogue",
      tune: [0.9, 1.0, 0.3],
      context: 200000,
      channels: {
        in: ["text", "image", "document", "tool_result", "thinking"],
        out: ["text", "thinking", "tool_use"],
      },
      via: {
        render: async (turns, config) => {
          const text = lastUserText(turns);
          if (config?.tools && !hasToolResult(turns)) {
            return toolUseTurn("t1", Object.keys(config.tools)[0], { query: text });
          }
          return textTurn(`[opus] ${text}`);
        },
        stream: async (turns, config) => {
          const text = lastUserText(turns);
          if (config?.tools && !hasToolResult(turns)) {
            return toolUseStream("t1", Object.keys(config.tools)[0], { query: text })();
          }
          return textStream(`[opus] ${text}`)();
        },
      },
    },
    {
      type: "dialogue",
      tune: [0.4, 0.6, 0.6],
      context: 200000,
      channels: { in: ["text", "image", "tool_result"], out: ["text", "tool_use"] },
      via: {
        render: async (turns) => textTurn(`[sonnet] ${lastUserText(turns)}`),
        stream: async (turns) => textStream(`[sonnet] ${lastUserText(turns)}`)(),
      },
    },
    {
      type: "dialogue",
      tune: [0.1, 0.3, 1.0],
      context: 200000,
      channels: { in: ["text", "tool_result"], out: ["text"] },
      via: {
        render: async (turns) => textTurn(`[haiku] ${lastUserText(turns)}`),
      },
    },
  ];
}

// ─── Scenario ─────────────────────────────────────────────────────────

export async function create() {
  const { orm, em, fixtures } = await seed();

  const deweyEntity = em.create(ModeEntity, {
    slug: "dewey",
    type: "teacher",
    traits: ["EXPOSED", "HARNESSED"],
    installed: true,
  });
  await em.flush();

  const cortex = new Cortex().extend(makeFaculties());

  const dewey = new Mode({
    manifest: { type: "teacher", slug: "dewey", traits: ["EXPOSED", "HARNESSED"] },
  });
  dewey.aperture = new Aperture();
  dewey.mount = new Path(`/mode/${dewey.type}/${dewey.slug}`);
  dewey.entity = deweyEntity;
  dewey.id = deweyEntity.id;
  dewey.cake.tune = "balanced";

  dewey.cake.harness = new Vector();
  dewey.cake.harness.branch("/dialogue").use(async (ctx, next) => {
    ctx.hallucination.add("You are Dewey, a patient language tutor.");
    await next();
  });

  const daemon = {
    manifest: { slug: "test-daemon", traits: [] },
    mount: new Path("/daemon/test-daemon"),
    aperture: new Aperture(),
    twitch: new Vector(),
    entities: { em },
    modes: { teacher: { dewey } },
    cortex,
    cargo: { version: "0.0.1", test: true },
    services: {},
    flatmodes() {
      return Object.values(this.modes).flatMap((type) => Object.values(type));
    },
  };

  daemon.aperture.use(shard.context.attach("daemon", daemon));

  daemon.entities.mode = em.getRepository(ModeEntity);
  daemon.entities.thread = em.getRepository(ThreadEntity);
  daemon.entities.turn = em.getRepository(TurnEntity);
  daemon.entities.user = em.getRepository(UserEntity);
  daemon.entities.trace = null;

  em.setFilterParams("user", { user: fixtures.user.id });

  const subscriber = shape.subscriber(daemon.twitch);
  em.getEventManager().registerSubscriber(subscriber);

  const finalizer = HARNESSED(dewey, daemon);
  if (typeof finalizer === "function") await finalizer();

  daemon.aperture.branch(dewey.mount.absolute).slurp(dewey.aperture);

  const createThread = async () => {
    const thread = em.create(ThreadEntity, {
      user: fixtures.user,
      mode: deweyEntity,
      trait: {},
      cursor: 0,
      counter: 0,
    });
    await em.flush();
    return thread;
  };

  return {
    daemon,
    dewey,
    cortex,
    orm,
    em,
    fixtures: { ...fixtures, dewey: deweyEntity },
    createThread,
  };
}
