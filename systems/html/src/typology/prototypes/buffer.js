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

  toJSON() {
    return {
      id: this.id,
      status: this.status?.toJSON?.() ?? String(this.status),
      view: this.view ? { Component: !!this.view.Component, url: this.view.url ?? null } : null,
      context: Object.fromEntries(
        Object.entries(this.context ?? {}).map(([k, v]) => [
          k,
          v?.id ?? v?.slug ?? (typeof v === "object" ? `[${v?.constructor?.name ?? "Object"}]` : v),
        ]),
      ),
      hooks: this.hooks?.length ?? 0,
    };
  }
}

// context? status? product? units? .... so many possibililties
// maybe pre and post hooks. hooks = [] for only post hooks
// hooks = [[],[]] for pre and post hooks.
// hooks = [[pre],[post]]
