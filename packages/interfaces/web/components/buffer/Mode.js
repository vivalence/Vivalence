export default class BufferMode {
  constructor(view, context, hooks = []) {
    this.view = view;
    this.context = context;
    this.hooks = hooks;
  }
  withContext(context) {
    this.context = context;
  }
}
