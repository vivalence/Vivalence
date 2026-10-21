import { atom } from "nanostores";

export class Telemetry {
  $state = atom({ open: false, view: "logger", filter: "all", selection: null, since: 0, window: { x: 0, y: 3, width: 77, height: 23 } });

  constructor(app) {
    this.app = app;
  }

  get state() {
    return this.$state.get();
  }

  get $logger() {
    return this.app.client.controller.stdout.$history;
  }
}
