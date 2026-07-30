import { Vector, Span, object, shape, shard, steer, string } from "@vivalence/typology";
import { v } from "../schematics/v.js";
import { Tier, Tune, Settings, Output, Packet } from "../schematics/primitives/hallucination.js";

const CONFIG = v.object({
  rounds: v.integer({ minimum: 1, default: 10 }),
  backoff: v.array(v.integer(), { default: [1000, 4000] }),
  tune: v.union([Tier, Tune]).optional(),
  settings: Settings.optional(),
  output: Output.optional(),
});

export function Hallucination(cortex, configuration) {
  const turns = []; // ordered, may repeat — never a Set
  const tools = new Vector();
  const span = new Span("/hallucination");
  const context = new Map();
  const config = v.create(CONFIG);

  const resolveFaculty = (type, via) => {
    const faculty = cortex.findOne({ type, tune: config.tune, via });
    if (!faculty)
      throw new Error(`[hallucination] no '${type}' faculty resolves a '${via}' avenue`);
    return faculty;
  };

  const resolveConfig = (type, avenue) => ({
    rounds: config.rounds,
    backoff: config.backoff,
    tools,
    span: span.branch(type).branch(avenue),
  });

  const declarations = () =>
    steer.trie.rollup(tools, () => null).map(({ pattern, steps }) => ({
      name: shard.hallucinate.nameOf(steps),
      ...(pattern.valence && { valence: pattern.valence }),
      ...(pattern.input && { input: pattern.input }),
    }));

  const rendering = (type) => async (ctx) => {
    ctx.output = await shard.hallucinate.render(
      resolveFaculty(type, "render"),
      ctx.input,
      resolveConfig(type, "render"),
    );
  };

  const streaming = (type) => (ctx) => {
    ctx.output = shard.hallucinate.session(
      resolveFaculty(type, "stream"),
      "stream",
      ctx.input,
      resolveConfig(type, "stream"),
    );
  };

  const hallucinator = new Vector()
    .use(async (ctx, next) => {
      const transcript = hallucination.entities.turn.compile();
      const tooling = declarations();
      const marks = [...(context.size ? ["context"] : []), ...(tooling.length ? ["tools"] : [])];
      const turns = [
        ...hallucination.context.compile(transcript),
        ...transcript.filter((turn) => turn.role !== "system"),
      ];
      ctx.input = {
        turns,
        ...(tooling.length && { tools: tooling }),
        ...(marks.length && { cache: { marks } }),
        ...(config.settings && { settings: config.settings }),
        ...(config.output && { output: config.output }),
      };
      await next();
    })
    .open({ nature: "/dialogue/stream", yields: Packet.Session }, streaming("dialogue"))
    .open({ nature: "/object/stream", yields: Packet.Session }, streaming("object"))
    .open({ nature: "/speech/stream", yields: Packet.Session }, streaming("speech"))
    .open({ nature: "/verbatim/stream", yields: Packet.Session }, streaming("verbatim"))
    .open("/dialogue/render", rendering("dialogue"))
    .open("/object/render", rendering("object"))
    .open("/speech/render", rendering("speech"))
    .open("/verbatim/render", rendering("verbatim"));

  const hallucination = shape.object(hallucinator, steer.strategy.echo);

  hallucination.tools = tools;
  hallucination.span = span;

  hallucination.configure = (patch = {}) => {
    v.cast(CONFIG, object.assign(config, patch)); // @beef this might also help cleanup the unreadable code above!
    const failure = [...v.errors(CONFIG, config)][0];
    if (failure)
      throw new Error(`[hallucination] invalid config ${failure.path}: ${failure.message}`);
    return hallucination;
  };

  hallucination.context = {
    system: (...supplied) => {
      const sections = supplied.flat(Infinity).filter(Boolean).map(string.stringify);
      context.set("system", sections.join("\n\n"));
      return hallucination;
    },
    extend: (entries = {}) => {
      for (const [key, value] of Object.entries(entries)) context.set(key, value);
      return hallucination;
    },
    compile: (transcript = []) => {
      const hoisted = transcript
        .filter((turn) => turn.role === "system")
        .map((turn) => turn.parts.map((part) => part.text).join("\n"));
      if (!context.size && !hoisted.length) return [];
      const sections = [];
      if (context.has("system")) sections.push(string.stringify(context.get("system")));
      sections.push(...hoisted);
      for (const [key, value] of context) {
        if (key === "system") continue;
        sections.push(`${key}:\n${string.stringify(value)}`);
      }
      return [{ role: "system", parts: [{ type: "text", text: sections.join("\n\n") }] }];
    },
  };

  hallucination.entities = {
    // maybe we loose entities as a top level register and go down to hallucination.turns
    turn: {
      append: (...supplied) => {
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
    },
  };

  hallucination.output = {
    object: (schema) => hallucination.configure({ output: { object: schema } }),
  };

  Object.defineProperty(hallucination, "json", {
    enumerable: true,
    get: () => ({
      tune: config.tune,
      settings: config.settings,
      output: config.output,
      context: Object.fromEntries(context),
      tools: declarations(),
      turns: [...turns],
    }),
  });

  if (configuration) hallucination.configure(configuration);
  return hallucination;
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
