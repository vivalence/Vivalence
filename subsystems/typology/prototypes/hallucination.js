export class Hallucination {
  constructor(cortex, { turns = [], tune = "balanced", tools = {}, config = {} } = {}) {
    this.cortex = cortex;
    this.turns = [...turns];
    this.tuning = tune;
    this.tools = { ...tools };
    this.config = { ...config };
  }

  add(...args) {
    for (const arg of args) {
      if (!arg) continue;
      if (typeof arg === "string") {
        this.turns.push({ role: "system", parts: [{ type: "text", text: arg }] });
        continue;
      }
      if (Array.isArray(arg)) {
        this.add(...arg);
        continue;
      }
      if (arg.role) {
        this.turns.push(arg);
        continue;
      }
    }
    return this;
  }

  tool(name, spec) {
    this.tools[name] = typeof spec === "function" ? { execute: spec } : spec;
    return this;
  }

  absorb({ llmstxt, tools } = {}) {
    if (llmstxt) this.add(llmstxt);
    if (tools)   Object.assign(this.tools, tools);
    return this;
  }

  tune(tier) {
    this.tuning = tier;
    return this;
  }

  configure(patch) {
    Object.assign(this.config, patch);
    return this;
  }
}
