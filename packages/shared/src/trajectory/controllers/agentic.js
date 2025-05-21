import { Walker } from "./walker.ts";
import { Deferred } from "./lib/index.ts";
import { tools } from "./lib/prompts.js";

const normalizePath = (path) => path.replace(/\/+/g, "/").replace(/\/$/, "");

export class Agentic {
  constructor(trajectory) {
    this.trajectory = trajectory;
    this.callables = [];
    this.index = "";
    this.traverse();
  }

  traverse(ancestorPath = "", trajectory = this.trajectory) {
    for (const [pattern, effect] of trajectory.effects.entries()) {
      const nodePath = `${ancestorPath}${pattern.docs.segment}`;
      this.index += `\n$: "${nodePath}": ${pattern.docs.valence}`;
      this.collect(nodePath, pattern.docs, effect);
    }

    for (const [pattern, descendant] of trajectory.descendants.entries()) {
      const nodePath = `${ancestorPath}${pattern.docs.segment}_`;

      if (pattern.docs.valence)
        this.index += `\n@: "${nodePath}": \n${pattern.docs.valence}`;

      this.traverse(nodePath, descendant);
    }
  }

  collect(path, docs, effect) {
    let description = `\n### "${path}":`;
    if (docs.valence)
      description += `\n- valence: ${JSON.stringify(docs.valence)}`;
    if (docs.input) description += `\n- input: ${JSON.stringify(docs.input)}`;
    if (docs.output)
      description += `\n- output: ${JSON.stringify(docs.output)}`;

    this.callables.push({
      name: path,
      description,
      parameters: docs.input,
      func: async (input) => {
        console.log("CALLABLE CALLED");
        console.log(input);
        console.log(path, docs);
        // const signal = new Signal("sig", { path: patternInfo.fullPath });
        // const deferred = new Deferred();
        // const walker = new Walker(trajectory, deferred);
        // try {
        //   await walker.walk([signal], async () => {
        //     throw new Error(`No handler found for ${patternInfo.fullPath}`);
        //   });
        //   const ctx = {};
        //   const handler = await deferred.handler;
        //   return await handler(input, ctx);
        // } catch (error) {
        //   throw error;
        // }
      },
    });
  }
}
