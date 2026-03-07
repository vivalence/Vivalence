import { random } from "@vivalence/shared";
import { Status } from "@vivalence/typology";

export class Buffer {
  status = new Status(null, this);
  constructor(context, view, hooks = []) {
    this.id = random.id();
    this.view = view;
    this.context = context;
    this.hooks = hooks;
    this.context.buffer = this;
  }
}

// context? status? product? units? .... so many possibililties
// maybe pre and post hooks. hooks = [] for only post hooks
// hooks = [[],[]] for pre and post hooks.
// hooks = [[pre],[post]]
