import { Vector, is, object, shape, soma, steer, string } from "@vivalence/typology";
import { v } from "../schematics/v.js";
import { Tier, Tune } from "../schematics/primitives/hallucination.js";

const CONFIG = v.object({
  rounds: v.integer({ minimum: 1, default: 10 }),
  tune: v.union([Tier, Tune]).optional(),
  output: v.unknown().optional(),
});

export function Hallucination(cortex, configuration) {
  const turns = []; // ordered, may repeat — never a Set
  const tools = {};
  const context = new Map();
  const config = v.create(CONFIG);

  const resolve = (type, via) => {
    const faculty = cortex.findOne({ type, tune: config.tune, via });
    if (!faculty)
      throw new Error(`[hallucination] no '${type}' faculty resolves a '${via}' avenue`);
    return faculty;
  };

  const rendering = (type) => async (ctx) => {
    ctx.output = await render(resolve(type, "render"), ctx.input.turns, ctx.input.config, tools);
  };

  const streaming = (type) => (ctx) => {
    ctx.output = stream(resolve(type, "stream"), ctx.input.turns, ctx.input.config, tools);
  };

  const vector = new Vector()
    .use(async (ctx, next) => {
      ctx.input = {
        turns: [...hallucination.context.compile(), ...hallucination.entities.turn.compile()],
        config: { ...config, ...hallucination.entities.tool.compile() },
      };
      await next();
    })
    .use(async (ctx, next) => {
      await next();
      const data = ctx.output?.parts?.find((part) => part.type === "object")?.data;
      if (data !== undefined && ctx.output.object === undefined) ctx.output.object = data;
    })
    .open("/dialogue/render", rendering("dialogue"))
    .open("/dialogue/stream", streaming("dialogue"))
    .open("/object/render", rendering("object"))
    .open("/object/stream", streaming("object"))
    .open("/speech/render", rendering("speech"))
    .open("/speech/stream", streaming("speech"))
    .open("/verbatim/render", rendering("verbatim"))
    .open("/verbatim/stream", streaming("verbatim"));

  const hallucination = shape.object(vector, steer.echo);

  hallucination.configure = (patch = {}) => {
    v.cast(CONFIG, object.assign(config, patch));
    const failure = [...v.errors(CONFIG, config)][0];
    if (failure)
      throw new Error(`[hallucination] invalid config ${failure.path}: ${failure.message}`);
    return hallucination;
  };

  hallucination.context = {
    system: (text) => {
      context.set("system", text);
      return hallucination;
    },
    extend: (entries = {}) => {
      for (const [key, value] of Object.entries(entries)) context.set(key, value);
      return hallucination;
    },
    compile: () => {
      if (!context.size) return [];
      const sections = [];
      if (context.has("system")) sections.push(string.stringify(context.get("system")));
      for (const [key, value] of context) {
        if (key === "system") continue;
        sections.push(`${key}:\n${string.stringify(value)}`);
      }
      return [{ role: "system", parts: [{ type: "text", text: sections.join("\n\n") }] }];
    },
  };

  hallucination.entities = {
    turn: {
      chain: (...supplied) => {
        turns.push(...supplied.flat(Infinity).filter((turn) => turn?.role));
        return hallucination;
      },
      all: () => [...turns],
      replace: (next = []) => {
        turns.length = 0;
        turns.push(...next);
        return hallucination;
      },
      compile: () => [...turns],
      // append: (turns = []) => cast.array(turns).map
    },
    tool: {
      add: (name, spec) => {
        const entries = is.object(name) ? Object.entries(name) : [[name, spec]];
        for (const [key, supplied] of entries) {
          tools[key] = typeof supplied === "function" ? { execute: supplied } : supplied;
        }
        return hallucination;
      },
      compile: () => (Object.keys(tools).length ? { tools } : {}),
    },
  };

  if (configuration) hallucination.configure(configuration);
  return hallucination;
}

async function render(faculty, turns, config, tools) {
  let transcript = turns;
  for (let round = 0; round < config.rounds; round++) {
    const turn = await faculty.via.render(transcript, config);
    if (turn?.meta?.stop !== "tool_use") return turn;
    const results = await execute(tools, turn.parts);
    transcript = [...transcript, turn, { role: "user", parts: results }];
  }
  throw new Error(`[hallucination] '${faculty.type}' tool loop exceeded ${config.rounds} rounds`);
}

async function* stream(faculty, turns, config, tools) {
  let transcript = turns;
  for (let round = 0; round < config.rounds; round++) {
    let turn = null;
    for await (const packet of await faculty.via.stream(transcript, config)) {
      turn = soma.pour(turn, packet);
      yield packet;
    }
    if (!turn || turn.meta?.stop !== "tool_use") return;
    const results = await execute(tools, turn.parts);
    const resultTurn = { role: "user", parts: results };
    yield* soma.drain(resultTurn);
    transcript = [...transcript, turn, resultTurn];
  }
  throw new Error(`[hallucination] '${faculty.type}' tool loop exceeded ${config.rounds} rounds`);
}

async function execute(tools, parts) {
  const results = [];
  for (const part of parts) {
    if (part.type !== "tool_use") continue;
    const tool = tools[part.name];
    const handler = typeof tool === "function" ? tool : tool?.execute;
    if (!handler) {
      console.warn(`[hallucination] unknown tool called: ${part.name}`);
      results.push({
        type: "tool_result",
        id: part.id,
        output: { error: `unknown tool: ${part.name}` },
      });
      continue;
    }
    const input =
      typeof part.input === "string"
        ? part.input
          ? JSON.parse(part.input)
          : {}
        : (part.input ?? {});
    const returned = await handler(input);
    const native =
      is.object(returned) &&
      ("message" in returned || "entities" in returned || "object" in returned);
    const { message, entities, object } = native ? returned : { message: returned };
    results.push({ type: "tool_result", id: part.id, output: message, entities, object });
  }
  return results;
}

// ── beef's original sketch — the seed ──────────────
// import { Vector, is, soma } from "@vivalence/typology";
//
// export function Hallucination(cortex) {
//   const turns = new Set();
//   const tools = new Set();
//   const context = new Map();
//   const config = {};
//
//   const vector = new Vector()
//     .use(async (ctx, next) => {
//       // compile ctx.input via processing and injecting of {config,turns,tools,context};
//       await next();
//     })
//     .use(async (ctx, next) => {
//       await next();
//       // process ctx.output. like parsing tool uses for entities etc.
//     })
//     .use(async (ctx, next) => {
//       // provide tooling and utilities for streaming, rendering, and tool calling.
//       // use of cortex either here on in someF.
//       await next();
//     })
//     .open("/object/stream", (ctx) => someFA(ctx))
//     .open("/object/render", (ctx) => someFB(ctx))
//     .open("/dialogue/stream", (ctx) => someF(ctx))
//     .open("/dialogue/render", (ctx) => someF(ctx))
//     .open("/verbatim/stream", (ctx) => someF(ctx))
//     .open("/verbatim/render", (ctx) => someF(ctx))
//     .open("/speech/stream", (ctx) => someF(ctx))
//     .open("/speech/render", (ctx) => someF(ctx));
//
//   const hallucination = shape.object(vector); // maybe some custom strategy if needed?!  strategy might be one place to facilitate the tool use loop?! a middleware would also be adequate. the streaming interface must be elegant!
//
//   hallucination.entities = {
//     turn: {
//       load: () => {}, // these can be called anything really. probably entity specific.
//     },
//     tool: {
//       load: () => {},
//     },
//     context: {
//       load: () => {},
//     },
//     // ...
//   };
//
//   return hallucination;
//   // hallucination can now be extended via hal.entities.[]();
//   // and be executed via await hallucination.object.render();
// }
