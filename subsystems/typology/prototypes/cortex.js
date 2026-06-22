import { array, soma, Vector } from "@vivalence/typology";
// import { Hallucination } from "./hallucination.js";

export const tiers = {
  frugal: [0.1, 0.3, 0.9, 1.0],
  balanced: [0.4, 0.6, 0.6, 0.6],
  capable: [0.6, 0.8, 0.4, 0.4],
  unleashed: [0.9, 1.0, 0.2, 0.2],
  eager: [0.3, 0.5, 0.5, 0.1],
};

export function nearest(faculties, target) {
  if (typeof target === "string") target = tiers[target] ?? [0.5, 0.5, 0.5, 0.5];
  return array.nearest(faculties, target, (faculty) => faculty.tune);
}

const FACULTY_TYPES = ["dialogue", "object", "speech", "verbatim"];

async function executeTools(tools, parts, thread) {
  const results = [];
  for (const part of parts) {
    if (part.type !== "tool_use") continue;
    const tool = tools[part.name];
    const handler = typeof tool === "function" ? tool : tool?.execute;
    if (!handler) {
      results.push({
        type: "tool_result",
        id: part.id,
        output: { error: `unknown tool: ${part.name}` },
      });
      continue;
    }
    const input =
      typeof part.input === "string" ? (part.input ? JSON.parse(part.input) : {}) : (part.input ?? {});
    const output = await handler(thread ? { ...input, thread } : input);
    results.push({ type: "tool_result", id: part.id, output });
  }
  return results;
}

function streamLeaf(cortex, type) {
  return async (ctx) => {
    const { tuning, turns, tools, config, thread } = ctx.hallucination;
    ctx.output = (async function* () {
      const faculty = cortex.resolve(type, { tune: tuning, via: "stream" });
      const callConfig = { ...config };
      if (Object.keys(tools).length) callConfig.tools = tools;
      let currentTurns = [...turns];
      for (let round = 0; round < 10; round++) {
        let turn = null;
        for await (const packet of await faculty.via.stream(currentTurns, callConfig)) {
          turn = soma.pour(turn, packet);
          yield packet;
        }
        if (turn.meta?.stop !== "tool_use") return;
        const results = await executeTools(tools, turn.parts, thread);
        yield* soma.drain({ role: "user", parts: results });
        currentTurns = [...currentTurns, turn, { role: "user", parts: results }];
      }
    })();
  };
}

function renderLeaf(cortex, type) {
  return async (ctx) => {
    const { tuning, turns, tools, config, thread } = ctx.hallucination;
    const faculty = cortex.resolve(type, { tune: tuning, via: "render" });
    const callConfig = { ...config };
    if (Object.keys(tools).length) callConfig.tools = tools;
    let currentTurns = [...turns];
    for (let round = 0; round < 10; round++) {
      const turn = await faculty.via.render(currentTurns, callConfig);
      if (turn.meta?.stop !== "tool_use") {
        ctx.output = turn;
        return;
      }
      const results = await executeTools(tools, turn.parts, thread);
      currentTurns = [...currentTurns, turn, { role: "user", parts: results }];
    }
  };
}

// faculties the cortex synthesizes when no provider offers them natively.
// object: dialogue + a terminal `respond` tool — the universal path, and the only one
// that supports tool-calling mid-generation.
function synthesizeObject(cortex, tune) {
  return async (turns, config) => {
    const tools = config?.tools ?? {};
    const respond = { valence: "Return the final result as structured data.", input: config?.schema };
    const dialogue = cortex.resolve("dialogue", { tune, via: "render" });
    let currentTurns = [...turns];
    for (let round = 0; round < 10; round++) {
      const turn = await dialogue.via.render(currentTurns, {
        ...config,
        tools: { ...tools, respond },
        tool_choice: { type: "any" },
      });
      const done = turn.parts.find((part) => part.type === "tool_use" && part.name === "respond");
      if (done) {
        const data = typeof done.input === "string" ? (done.input ? JSON.parse(done.input) : {}) : done.input;
        return { role: "assistant", parts: [{ type: "object", data }], meta: { stop: "end_turn" } };
      }
      const results = await executeTools(tools, turn.parts);
      currentTurns = [...currentTurns, turn, { role: "user", parts: results }];
    }
  };
}

const DERIVATIONS = {
  object: (cortex, tune) => ({
    type: "object",
    channels: { in: ["text"], out: ["object"] },
    via: { render: synthesizeObject(cortex, tune) },
  }),
};

export class Cortex {
  table = new Map();
  tools = new Vector();

  extend(faculties) {
    for (const faculty of faculties) {
      if (faculty.tune.length === 3) faculty.tune = [...faculty.tune, 0.5];
      if (!this.table.has(faculty.type)) this.table.set(faculty.type, []);
      this.table.get(faculty.type).push(faculty);
    }
    return this;
  }

  has(type) {
    return this.table.has(type) || (type in DERIVATIONS && this.derivable(type));
  }

  derivable(type) {
    return type === "object" ? !!this.resolve("dialogue", { via: "render" }) : false;
  }

  resolve(type, { tune, via } = {}) {
    const candidates = this.table.get(type) || [];
    const eligible = via ? candidates.filter((faculty) => faculty.via[via]) : candidates;
    const native = nearest(eligible, tune ?? [0.5, 0.5, 0.5, 0.5]);
    if (native) return native;

    const derive = DERIVATIONS[type];
    if (!derive || !this.derivable(type)) return native;
    const derived = derive(this, tune);
    return !via || derived.via[via] ? derived : undefined;
  }

  get shard() {
    const cortex = this;
    return {
      // harness: async (ctx, next) => {console.trace("DEPRACATEED"); ctx.hallucination = new Hallucination(cortex, ctx.input); await next();},
      faculties: (vector) => {
        for (const type of FACULTY_TYPES) {
          if (!cortex.has(type)) continue;
          const branch = vector.branch(type);
          if (cortex.resolve(type, { via: "stream" }))
            branch.open("stream", streamLeaf(cortex, type));
          if (cortex.resolve(type, { via: "render" }))
            branch.open("render", renderLeaf(cortex, type));
        }
      },
    };
  }
}
