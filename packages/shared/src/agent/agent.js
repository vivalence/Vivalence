import { Agentic } from "@vivalence/shared/trajectory";
// import { TypeCompiler } from "@sinclair/typebox/compiler";
import validators from "@vivalence/shared/validators";

export class Agent {
  constructor(slug, name, manifest = {}) {
    this.slug = slug;
    this.name = name;
    this.context = new Map();
    this.inputValidator = null;
    this.outputValidator = null;
  }

  withBrain(brain) {
    this.brain = brain;
    return this;
  }

  // ears
  withInput(input) {
    this.input = input;
    // this.inputValidator = TypeCompiler.Compile(input);
    this.inputValidator = validators.ajv.compile(input);
    return this;
  }

  // mouth
  withOutput(output) {
    this.output = output;
    // this.outputValidator = TypeCompiler.Compile(output);
    this.outputValidator = validators.ajv.compile(output);
    return this;
  }

  // ... spin?
  withTemplate(template) {
    this.template = template;
    return this;
  }

  withTools(tools) {
    this.tools = tools;
    return this;
  }

  withContext(slug, textOrFn) {
    this.context.set(slug, textOrFn);
    return this;
  }

  // @lj: kind of a silly way to set this up. TODO: make good.
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
    if (!this.outputValidator) return output;
    // if (!this.outputValidator.Check(output)) {// const errors = [...this.outputValidator.Errors(output)];
    if (!this.outputValidator(output)) {
      const errors = [...this.outputValidator.errors];
      this.onIssues(errors);
      // console.log("[OUTPUT VALIDATION ERRORS]", this.outputValidator);
    }
    return output;
  }

  onIssues(issues) {
    // AgentOperationError
    throw new Error(
      `Validation failed: ${issues.map((e) => e.message).join(", ")}`,
    );
  }

  prompt(input) {
    if (this.template) return this.template(input);
    else if (typeof input !== "string") return JSON.stringify(input);
    else return input;
  }

  check(what = []) {
    const issues = [];
    if (!this.brain) issues.push("Agent missing brain");
    if (what.includes("input") && !this.input)
      issues.push("input schema not defined");
    if (what.includes("output") && !this.output)
      issues.push("Output schema not defined");
    if (what.includes("tools") && !this.tools)
      issues.push("Agent has no tools");

    if (issues.length > 0) {
      // AgentCheckError
      throw new Error(`Agent configuration incomplete: ${issues.join(", ")}`);
    }
  }

  async do(input) {
    this.check(["tools", "input"]);
    this.validate(input);

    const { text, messages } = await this.brain.call.tools({
      system: this.system,
      tools: this.tools,
      prompt: this.prompt(input),
    });

    return { text, messages };
  }

  async generate(input) {
    this.check(["input", "output"]);
    this.validate(input);

    const { object } = await this.brain.generate.object({
      schema: this.output,
      system: this.system,
      prompt: this.prompt(input),
    });

    return this.parse(object);
  }
}
// import { TypeCompiler } from "@sinclair/typebox/compiler";

// export class Agent {
//   constructor(slug, name) {
//     this.slug = slug;
//     this.name = name;

//     this.context = new Map();

//     // FUTURE FEATURES:
//     // this.scope =  this.scopeController(trajectory)
//     // this.demos = []; // i could allow agents to provide feedback about the examples (evaluations in terms of the a111finnvalencesdataset) and depending on some evaluation(result), rank the demos
//   }
//   withProvider(provider) {
//     this.provider = provider;
//     return this;
//   }
//   withProfile(profile) {
//     this.profile = profile;
//     return this;
//   }
//   get model() {
//     return this.provider(this.profile);
//   }

//   setContext(slug, textOrFn) {
//     return this.context.set(slug, textOrFn);
//   }
//   getContext() {
//     let context = "";

//     // if any context value is a function, we apply it. // might be able to implement a tree structure of consumption/application here
//     // [this.context, this.identity, this.task] //}
//     return context;
//   }
//   get system() {
//     // if (scope) context compilation works differently.
//     return this.getContext() //
//       .reduce((system, prompt) => system + prompt, ``);
//   }

//   validate(input) {
//     // this.inputValidator = TypeCompiler.Compile(input);
//     // if (!this.inputValidator.Check(input)) {const errors = [...this.inputValidator.Errors(input)]; throw new Error(`Invalid input: ${errors[0]?.message}`);}
//   }
//   onIssues(issues) {
//     // throw error
//   }
//   parse(output) {
//     // this.outputValidator = TypeCompiler.Compile(output);
//     // if (!this.outputValidator.Check(output)) {const errors = [...this.outputValidator.Errors(result)]; throw new Error(`Invalid output: ${errors[0]?.message}`);}
//     return output;
//   }
//   get generatorSchemaFromInput() {
//     return this.input;
//   }
//   prompt(message) {
//     if (this.template) return this.template(message);
//     else return `${message}`;
//   }
//   check() {
//     // if (!this.output)
//     // if (!this.input)
//     // if (!this.provider)
//     // if (!this.profile)
//   }

//   async barf(input) {
//     // await this.check()

//     // const issues = this.validate(input)
//     // if (issues) return this.onIssues(issues)

//     const output = await generateObject({
//       model: this.model,
//       system: this.system,
//       schema: this.generatorSchemaFromInput,
//       prompt: this.prompt(input),
//     });

//     return this.parse(output);
//   }
// }
