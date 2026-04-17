import { array, soma } from "@vivalence/typology";
import { Hallucination } from "./hallucination.js";

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

const FACULTY_TYPES = ["dialogue", "speech", "verbatim"];

async function executeTools(tools, parts) {
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
    const input = typeof part.input === "string" ? JSON.parse(part.input) : part.input;
    const output = await handler(input);
    results.push({ type: "tool_result", id: part.id, output });
  }
  return results;
}

function streamLeaf(cortex, type) {
  return async (ctx) => {
    const { tuning, turns, tools, config } = ctx.hallucination;
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
        const results = await executeTools(tools, turn.parts);
        yield* soma.drain({ role: "user", parts: results });
        currentTurns = [...currentTurns, turn, { role: "user", parts: results }];
      }
    })();
  };
}

function renderLeaf(cortex, type) {
  return async (ctx) => {
    const { tuning, turns, tools, config } = ctx.hallucination;
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
      const results = await executeTools(tools, turn.parts);
      currentTurns = [...currentTurns, turn, { role: "user", parts: results }];
    }
  };
}

export class Cortex {
  table = new Map();

  extend(faculties) {
    for (const faculty of faculties) {
      if (faculty.tune.length === 3) faculty.tune = [...faculty.tune, 0.5];
      if (!this.table.has(faculty.type)) this.table.set(faculty.type, []);
      this.table.get(faculty.type).push(faculty);
    }
    return this;
  }

  has(type) {
    return this.table.has(type);
  }

  resolve(type, { tune, via } = {}) {
    const candidates = this.table.get(type) || [];
    const eligible = via ? candidates.filter((faculty) => faculty.via[via]) : candidates;
    return nearest(eligible, tune ?? [0.5, 0.5, 0.5, 0.5]);
  }

  get shard() {
    const cortex = this;
    return {
      harness: async (ctx, next) => {
        ctx.hallucination = new Hallucination(cortex, ctx.input);
        await next();
      },
      effects: (vector) => {
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
