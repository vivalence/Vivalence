// @claude: you work here
// !OLD:
import parser from "../parsers/sig.ts";
import { Walker } from "./walker.ts";
import { Deferred } from "./lib/index.ts";

export class Agentic {
  constructor(vector) {
    this.vector = vector;
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

  traverse(ancestorPath = this.seperator, vector = this.vector) {
    for (const [pattern, effect] of vector.effects.entries()) {
      // TODO filter by pattern.type path
      const nodePath = `${ancestorPath}${pattern.docs.segment}`;

      this.onEffect(nodePath, pattern.docs);
      this.onTool(nodePath, effect, pattern.docs);
    }

    for (const [pattern, descendant] of vector.descendants.entries()) {
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
        const walker = new Walker(this.vector, deferred);
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
