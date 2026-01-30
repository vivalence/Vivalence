import { random } from "@vivalence/shared";
import { Status } from "@vivalence/typology";

// state? status? product? units? .... so many possibililties
// maybe pre and post hooks. hooks = [] for only post hooks
// hooks = [[],[]] for pre and post hooks.
// hooks = [[pre],[post]]

export class Buffer {
  status = new Status(null, this);
  constructor(view, context, hooks = []) {
    this.id = random.id();
    this.view = view;
    this.context = context;
    this.context.buffer = this;
    this.stall = context.stall;
    this.hooks = hooks;
  }
}
