import { hash } from "@vivalence/typology";
import { validators, obj } from "@vivalence/shared";
import { Agentic } from "@vivalence/typology/compiler";

// TODO migrate to typebox for validator
// import { Compile } from 'typebox'
// const jsonSchema = {type: 'object', required: ['x', 'y', 'z'], properties: {x: { type: 'number' }, y: { type: 'number' }, z: { type: 'number' }}}
// const C = Compile(jsonSchema)
// const result = C.Check({ x: 1, y: 2, z: 3 })
// const parsed = C.Parse({ x: 1, y: 2, z: 3 })

export class Agent {
  constructor(slug = "") {
    this.slug = slug;
    this.context = new Map();
    this.inputValidator = null;
    this.outputValidator = null;
  }

  static hallucinate = {
    async object(input) {
      return await this.generate(input);
    },
    async action(input) {
      return await this.do(input);
    },
    // async conversation(input) {},
  };

  withBrain(brain) {
    this.brain = brain;
    return this;
  }

  withInput(input) {
    this.input = input;
    // this.inputValidator = TypeCompiler.Compile(input);
    this.inputValidator = validators.ajv.compile(input);
    return this;
  }

  withOutput(output) {
    this.output = output;
    // this.outputValidator = TypeCompiler.Compile(output);
    this.outputValidator = validators.ajv.compile(output);
    return this;
  }

  withTemplate(template) {
    this.template = template;
    return this;
  }

  withTools(vector) {
    // !process vector into tools. aka agentic()
    this.tools = new Agentic(vector);
    return this;
  }

  withContext(slug, textOrFn) {
    this.context.set(slug, textOrFn);
    return this;
  }

  enhance(text) {
    this.context.set(hash.string(text), text);
    return this;
  }

  // @beef: kind of a silly way to set this up. TODO: make good.
  // consume(slug) {const value = this.context.get(slug); this.context.delete(slug); if (typeof value === "function") {return value(this);} else {return value;}}

  getContext() {
    const contextArray = [];
    for (const [slug, value] of this.context) {
      if (typeof value === "function") {
        contextArray.push(value(this));
      } else {
        contextArray.push(value);
      }
    }
    return contextArray;
  }

  get system() {
    return this.getContext().reduce((system, prompt) => system + prompt, "");
  }

  validate(input) {
    if (!this.inputValidator) return [];
    // if (!this.inputValidator.Check(input)) {// const errors = [...this.inputValidator.Errors(input)];
    if (!this.inputValidator(input)) {
      const errors = [...this.inputValidator.errors];
      // return errors;
      this.onIssues(errors);
      // console.log("[INPUT VALIDATION ERRORS]", this.inputValidator);
    }
    return [];
  }

  parse(output) {
    let errors = [];
    if (!this.outputValidator) return [output, errors];
    // if (!this.outputValidator.Check(output)) {// const errors = [...this.outputValidator.Errors(output)];

    if (!this.outputValidator(obj.stripNulls(output))) {
      // console.log("@shared/agent.js [OUTPUT VALIDATION ERRORS]");
      // console.log({output, rest, errors: this.outputValidator.errors, agent: this.slug,});
      // console.log("/[OUTPUT VALIDATION ERRORS]");
      errors = [...this.outputValidator.errors];
    }
    return [output, errors];
  }

  async generate(input) {
    this.check(["input", "output"]);
    this.validate(input);

    const response = await this.brain.object({
      schema: this.output,
      system: this.system,
      prompt: this.prompt(input),
    });

    let [object, errors] = this.parse(response.object);

    if (errors.length === 0) return object;

    const retry = await this.brain.object({
      schema: this.output,
      system:
        this.system + "\n# Failure and retry:" + JSON.stringify({ previousOutput: object, errors }),
      prompt: this.prompt(input),
    });

    [object, errors] = this.parse(retry.object);
    if (errors.length === 0) return object;
    else this.onIssues(errors);
  }

  async do(input) {
    this.check(["tools", "input"]);
    this.validate(input);

    const { text, messages } = await this.brain.action({
      system: this.system,
      tools: this.tools,
      prompt: this.prompt(input),
    });

    return { text, messages };
  }

  onIssues(issues) {
    // AgentOperationError
    throw new Error(`Validation failed: ${issues.map((e) => e.message).join(", ")}`);
  }

  prompt(input) {
    if (this.template) return this.template(input);
    else if (typeof input !== "string") return JSON.stringify(input);
    else return input;
  }

  check(what = []) {
    const issues = [];
    if (!this.brain) issues.push("Agent missing brain");
    if (what.includes("input") && !this.input) issues.push("input schema not defined");
    if (what.includes("output") && !this.output) issues.push("Output schema not defined");
    if (what.includes("tools") && !this.tools) issues.push("Agent has no tools");

    if (issues.length > 0) {
      // AgentCheckError
      throw new Error(`Agent configuration incomplete: ${issues.join(", ")}`);
    }
  }
}
// import { is } from "@vivalence/typology";

// export class Agent {
//   constructor(slug, name) {
//     this.slug = slug;
//     this.name = name || slug;
//     this.brain = null;
//     this.vector = null;
//     this._system = [];
//     this._input = null;
//     this._output = null;
//     this._template = null;
//   }

//   // Fluent configuration
//   with(key, value) {
//     if (key === "brain") this.brain = value;
//     else if (key === "vector") this.vector = value;
//     else if (key === "input") this._input = value;
//     else if (key === "output") this._output = value;
//     else if (key === "template") this._template = value;
//     else this[key] = value;
//     return this;
//   }

//   context(textOrFn) {
//     this._system.push(textOrFn);
//     return this;
//   }

//   get system() {
//     return this._system
//       .map((s) => (typeof s === "function" ? s(this) : s))
//       .join("\n");
//   }

//   // Extract tools from Action-based Vector
//   get tools() {
//     if (!this.vector) return {};
//     const tools = {};

//     const walk = (vector, path = []) => {
//       for (const [action, effect] of vector.effects) {
//         const segments = [...path, action.nature].filter(Boolean);
//         const name = segments.join("_");

//         tools[name] = {
//           valence: action.description,
//           input: action.schema,
//           output: action.outputSchema,
//           execute: async (input, context = {}) => {
//             const ctx = { input, action, agent: this, ...context };
//             return await effect(ctx);
//           },
//         };
//       }

//       for (const [action, child] of vector.trajectories) {
//         walk(child, [...path, action.nature]);
//       }
//     };

//     walk(this.vector);
//     return tools;
//   }

//   // Generate tools documentation for system prompt
//   get toolsDocs() {
//     if (!this.vector) return "";

//     const lines = ["### Available Tools"];

//     const walk = (vector, path = [], indent = 0) => {
//       for (const [action, child] of vector.trajectories) {
//         const prefix = "  ".repeat(indent);
//         if (action.description) {
//           lines.push(`${prefix}## ${action.nature}: ${action.description}`);
//         }
//         walk(child, [...path, action.nature], indent + 1);
//       }

//       for (const [action] of vector.effects) {
//         const prefix = "  ".repeat(indent);
//         const name = [...path, action.nature].filter(Boolean).join("_");
//         lines.push(`${prefix}- ${name}: ${action.description}`);
//         if (action.schema) {
//           lines.push(`${prefix}  input: ${JSON.stringify(action.schema)}`);
//         }
//       }
//     };

//     walk(this.vector);
//     return lines.join("\n");
//   }

//   prompt(input) {
//     if (this._template) return this._template(input);
//     if (typeof input === "string") return input;
//     return JSON.stringify(input);
//   }

//   // Generate structured output
//   async generate(input) {
//     this._check(["brain", "output"]);

//     const response = await this.brain.object({
//       schema: this._output,
//       system: this.system,
//       prompt: this.prompt(input),
//     });

//     return response.object;
//   }

//   // Execute with tools
//   async act(input) {
//     this._check(["brain", "vector"]);

//     const response = await this.brain.action({
//       tools: this.tools,
//       system: this.system + "\n" + this.toolsDocs,
//       prompt: this.prompt(input),
//     });

//     return response;
//   }

//   // Simple text generation
//   async think(input) {
//     this._check(["brain"]);

//     const response = await this.brain.text({
//       system: this.system,
//       prompt: this.prompt(input),
//     });

//     return response.text;
//   }

//   _check(required = []) {
//     const missing = [];
//     if (required.includes("brain") && !this.brain) missing.push("brain");
//     if (required.includes("vector") && !this.vector) missing.push("vector");
//     if (required.includes("output") && !this._output) missing.push("output");
//     if (required.includes("input") && !this._input) missing.push("input");

//     if (missing.length > 0) {
//       throw new Error(`Agent "${this.slug}" missing: ${missing.join(", ")}`);
//     }
//   }
// }
