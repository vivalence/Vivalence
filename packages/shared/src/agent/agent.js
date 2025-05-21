import { generateObject } from "@ai/skd";

import { TypeCompiler } from "@sinclair/typebox/compiler";

export class Agent {
  constructor(slug, name) {
    this.slug = slug;
    this.name = name;

    this.context = new Map();

    // FUTURE FEATURES:
    // this.scope =  this.scopeController(trajectory)
    // this.demos = []; // i could allow agents to provide feedback about the examples (evaluations in terms of the a111finnvalencesdataset) and depending on some evaluation(result), rank the demos
  }
  withProvider(provider) {
    this.provider = provider;
    return this;
  }
  withProfile(profile) {
    this.profile = profile;
    return this;
  }
  get model() {
    return this.provider(this.profile);
  }

  setContext(slug, textOrFn) {
    return this.context.set(slug, textOrFn);
  }
  getContext() {
    let context = "";

    // if any context value is a function, we apply it. // might be able to implement a tree structure of consumption/application here
    // [this.context, this.identity, this.task] //}
    return context;
  }
  get system() {
    // if (scope) context compilation works differently.
    return this.getContext() //
      .reduce((system, prompt) => system + prompt, ``);
  }

  validate(input) {
    // this.inputValidator = TypeCompiler.Compile(input);
    // if (!this.inputValidator.Check(input)) {const errors = [...this.inputValidator.Errors(input)]; throw new Error(`Invalid input: ${errors[0]?.message}`);}
  }
  onIssues(issues) {
    // throw error
  }
  parse(output) {
    // this.outputValidator = TypeCompiler.Compile(output);
    // if (!this.outputValidator.Check(output)) {const errors = [...this.outputValidator.Errors(result)]; throw new Error(`Invalid output: ${errors[0]?.message}`);}
    return output;
  }
  get generatorSchemaFromInput() {
    return this.input;
  }
  prompt(message) {
    if (this.template) return this.template(message);
    else return `${message}`;
  }
  check() {
    // if (!this.output)
    // if (!this.input)
    // if (!this.provider)
    // if (!this.profile)
  }

  async barf(input) {
    // await this.check()

    // const issues = this.validate(input)
    // if (issues) return this.onIssues(issues)

    const output = await generateObject({
      model: this.model,
      system: this.system,
      schema: this.generatorSchemaFromInput,
      prompt: this.prompt(input),
    });

    return this.parse(output);
  }
}
