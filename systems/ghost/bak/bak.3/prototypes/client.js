import { atom } from "nanostores";
import { Controller, Span, Vector } from "@vivalence/typology";
import { dock } from "../gestalten/belt/index.js";
import { Runtime } from "./runtime.js";
import { Terminals } from "./terminals.js";

export class Client {
  mask;
  controller;
  runtime;
  // terminals;
  // repl = new Vector();
  // dispatch = null;
  // $dock = atom(dock.DEFAULT_DOCK);
  // $activeTerminal = atom(null);

  constructor(mask, parent = null) {
    this.mask = mask;
    this.controller = new Controller({ stdout: new Span(`client/${mask.manifest.slug}`) });
    this.runtime = new Runtime({ remote: mask.statics.remote });
    // this.terminals = new Terminals(this.runtime);
  }

  get dock() {
    return this.$dock.get();
  }

  get json() {
    return {
      mask: this.mask,
      runtime: this.runtime.json,
      terminal: this.terminals.active ? this.terminals.active.id : null,
    };
  }
}
