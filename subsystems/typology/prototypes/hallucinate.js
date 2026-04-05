import { soma } from "@vivalence/typology";

export class Hallucinate {
  constructor(cortex) {
    this.cortex = cortex;
    this.turns = [];
    this.tools = {};
    this.tuning = "balanced";
    this.config = {};

    this.conversation = {
      render: () => this.render("conversation"),
      stream: () => this.stream("conversation"),
    };

    this.speech = {
      render: () => this.render("speech"),
      stream: () => this.stream("speech"),
    };

    this.object = {
      render: () => this.render("object"),
    };
  }

  add(...args) {
    for (const arg of args) {
      if (!arg)                    continue;
      if (typeof arg === "string") { this.turns.push({ role: "system", parts: [{ type: "text", text: arg }] }); continue; }
      if (Array.isArray(arg))      { this.add(...arg); continue; }
      if (arg.role)                { this.turns.push(arg); continue; }
    }
    return this;
  }

  tool(name, spec) {
    this.tools[name] = spec;
    return this;
  }

  tune(tier) {
    this.tuning = tier;
    return this;
  }

  configure(config) {
    Object.assign(this.config, config);
    return this;
  }

  *protocol() {
    let turns = [...this.turns];
    const config = { ...this.config };
    if (Object.keys(this.tools).length) config.tools = this.tools;

    for (let round = 0; round < 10; round++) {
      const turn = yield { call: { turns, config } };
      if (turn.meta?.stop !== "tool_use") return turn;
      const results = yield { execute: turn.parts };
      turns = [...turns, turn, { role: "user", parts: results }];
    }
  }

  async execute(parts) {
    const results = [];
    for (const part of parts) {
      if (part.type !== "tool_use") continue;
      const tool = this.tools[part.name];
      const handler = typeof tool === "function" ? tool : tool?.execute;
      if (!handler) {
        results.push({ type: "tool_result", id: part.id, output: { error: `unknown tool: ${part.name}` } });
        continue;
      }
      const input = typeof part.input === "string" ? JSON.parse(part.input) : part.input;
      const output = await handler(input);
      results.push({ type: "tool_result", id: part.id, output });
    }
    return results;
  }

  async render(type) {
    const faculty = this.cortex.resolve(type, { tune: this.tuning, via: "render" });
    const program = this.protocol();
    let step = program.next();
    while (!step.done) {
      if (step.value.call) {
        const { turns, config } = step.value.call;
        step = program.next(await faculty.via.render(turns, config));
      } else {
        step = program.next(await this.execute(step.value.execute));
      }
    }
    return step.value;
  }

  async* stream(type) {
    const faculty = this.cortex.resolve(type, { tune: this.tuning, via: "stream" });
    const program = this.protocol();
    let step = program.next();
    while (!step.done) {
      if (step.value.call) {
        const { turns, config } = step.value.call;
        let turn = null;
        for await (const packet of await faculty.via.stream(turns, config)) {
          turn = soma.pour(turn, packet);
          yield packet;
        }
        step = program.next(turn);
      } else {
        const results = await this.execute(step.value.execute);
        yield* soma.drain({ role: "user", parts: results });
        step = program.next(results);
      }
    }
  }
}
