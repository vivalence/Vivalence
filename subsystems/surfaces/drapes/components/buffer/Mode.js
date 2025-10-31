import { random } from "@vivalence/shared";

export default class BufferMode {
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
