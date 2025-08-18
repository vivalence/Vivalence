import parser from "../parsers/sig.ts";
import { Walker } from "./walker.ts";
import { Deferred } from "./lib/index.ts";

export class Agentic {
  constructor(trajectory) {
    this.trajectory = trajectory;
    this.tools = {};
    this.stack = [`### Tools`];
    this.seperator = "/";
    this.traverse();
  }

  onPattern(path, docs) {
    this.stack.push(`### ${path}`);
    if (docs.valence) this.stack.push(docs.valence);
  }
  onEffect(path, docs) {
    this.stack.push(`"${this.denormalize(path)}":`);
    if (docs.valence) this.stack.push(docs.valence);
    if (docs.input) this.stack.push(`- input ${JSON.stringify(docs.input)}`);
    if (docs.output) this.stack.push(`- output ${JSON.stringify(docs.output)}`);
  }

  get llmstxt() {
    return "\n" + this.stack.join("\n") + "\n";
  }

  traverse(ancestorPath = this.seperator, trajectory = this.trajectory) {
    for (const [pattern, effect] of trajectory.effects.entries()) {
      // TODO filter by pattern.type path
      const nodePath = `${ancestorPath}${pattern.docs.segment}`;

      this.onEffect(nodePath, pattern.docs);
      this.onTool(nodePath, effect, pattern.docs);
    }

    for (const [pattern, descendant] of trajectory.descendants.entries()) {
      const nodePath = `${ancestorPath}${pattern.docs.segment}${this.seperator}`;

      this.onPattern(nodePath, pattern.docs);

      this.traverse(nodePath, descendant);
    }
  }

  onTool(path, effect, docs) {
    this.tools[this.denormalize(path)] = {
      valence: docs.valence,
      input: docs.input,
      execute: async (input) => {
        const deferred = new Deferred();
        const walker = new Walker(this.trajectory, deferred);
        const signal = parser.signal(path);

        await walker.walk(signal, async () => {
          throw new Error(`No handler ${path}: ${JSON.stringify(docs)}`);
        });

        const ctx = {};
        const handler = await deferred.handler;
        const result = await handler(input, ctx);
        return result;
      },
    };
  }
  denormalize(path) {
    return path.replaceAll(this.seperator, "_").slice(1);
  }
}
