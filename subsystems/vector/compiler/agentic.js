import { controller } from "@vivalence/vector";

export class Agentic {
  constructor(vector) {
    this.vector = vector;
    this.tools = {};
    this.stack = [`### Tools`];
    this.separator = "/";
    this.compile();
  }

  onBranch(path, pattern) {
    this.stack.push(`### ${path}`);
    if (pattern?.valence) this.stack.push(pattern.valence);
  }

  onEffect(path, pattern) {
    const toolName = this.normalize(path);
    this.stack.push(`"${toolName}":`);
    if (pattern?.valence) this.stack.push(`  ${pattern.valence}`);
    if (pattern?.input)
      this.stack.push(`  - input: ${JSON.stringify(pattern.input)}`);
    if (pattern?.output)
      this.stack.push(`  - output: ${JSON.stringify(pattern.output)}`);
  }

  get llmstxt() {
    return "\n" + this.stack.join("\n") + "\n";
  }

  compile(ancestorPath = this.separator, vector = this.vector) {
    for (const [pattern, effect] of vector.effects.entries()) {
      const segment = pattern.nature;
      const nodePath = `${ancestorPath}${segment}`;

      this.onEffect(nodePath, pattern);
      this.registerTool(nodePath, effect, pattern);
    }

    for (const [pattern, descendant] of vector.trajectories.entries()) {
      const segment = pattern.nature;
      const nodePath = `${ancestorPath}${segment}${this.separator}`;

      this.onBranch(nodePath, pattern);
      this.compile(nodePath, descendant);
    }
  }

  registerTool(path, effect, pattern = {}) {
    const toolName = this.normalize(path);
    const vector = this.vector;

    this.tools[toolName] = {
      valence: pattern.valence || "",
      input: pattern.input,
      output: pattern.output,
      execute: async (input, context = {}) => {
        try {
          const result = await controller.invoke(vector, path, {
            ...context,
            input,
          });
          return result;
        } catch (error) {
          console.error(`[Agentic] Tool execution failed: ${toolName}`, error);
          throw error;
        }
      },
    };
  }

  normalize(path) {
    return path.replaceAll(this.separator, "_").slice(1);
  }

  denormalize(toolName) {
    return this.separator + toolName.replaceAll("_", this.separator);
  }
}

// import { Signal } from "@vivalence/typology";
// import { invoke } from "@vivalence/vector/controller";

// export class Agentic {
//   constructor(vector) {
//     this.vector = vector;
//     this.tools = {};
//     this.stack = [`### Tools`];
//     this.separator = "/";
//     this.compile();
//   }

//   onBranch(path, docs) {
//     this.stack.push(`### ${path}`);
//     if (docs?.valence) this.stack.push(docs.valence);
//   }

//   onEffect(path, docs) {
//     const toolName = this.normalize(path);
//     this.stack.push(`"${toolName}":`);
//     if (docs?.valence) this.stack.push(`  ${docs.valence}`);
//     if (docs?.input)
//       this.stack.push(`  - input: ${JSON.stringify(docs.input)}`);
//     if (docs?.output)
//       this.stack.push(`  - output: ${JSON.stringify(docs.output)}`);
//   }

//   get llmstxt() {
//     return "\n" + this.stack.join("\n") + "\n";
//   }

//   compile(ancestorPath = this.separator, vector = this.vector) {
//     // Process effects (leaf nodes with handlers)
//     for (const [pattern, effect] of vector.effects.entries()) {
//       const segment = pattern.nature;
//       const nodePath = `${ancestorPath}${segment}`;

//       this.onEffect(nodePath, pattern.docs);
//       this.registerTool(nodePath, effect, pattern.docs);
//     }

//     // Process trajectories (branch nodes)
//     for (const [pattern, descendant] of vector.trajectories.entries()) {
//       const segment = pattern.nature;
//       const nodePath = `${ancestorPath}${segment}${this.separator}`;

//       this.onBranch(nodePath, pattern.docs);
//       this.compile(nodePath, descendant);
//     }
//   }

//   registerTool(path, effect, docs = {}) {
//     const toolName = this.normalize(path);
//     const vector = this.vector;

//     this.tools[toolName] = {
//       valence: docs.valence || "",
//       input: docs.input,
//       output: docs.output,
//       execute: async (input, context = {}) => {
//         try {
//           const result = await invoke(vector, path, { ...context, input });
//           return result;
//         } catch (error) {
//           console.error(`[Agentic] Tool execution failed: ${toolName}`, error);
//           throw error;
//         }
//       },
//     };
//   }

//   normalize(path) {
//     return path.replaceAll(this.separator, "_").slice(1);
//   }

//   denormalize(toolName) {
//     return this.separator + toolName.replaceAll("_", this.separator);
//   }
// }

// export default Agentic;
