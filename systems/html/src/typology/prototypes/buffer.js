import { random } from "@vivalence/shared";

export class Buffer {
  // state? status? product? units? .... so many possibililties
  constructor(view, context, hooks = []) {
    this.id = random.id();
    this.view = view;
    this.context = context;
    this.hooks = hooks;
    this.context.buffer = this;
  }
  withContext(context) {
    this.context = context;
    return this;
  }
}
