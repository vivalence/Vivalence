import { persistentAtom } from "@nanostores/persistent";

export class Telemetry {
  $state = persistentAtom(
    "viva.telemetry.state",
    {
      open: false,
      view: "logger",
      filter: "all",
      selection: null,
      since: 0,
      window: { x: 0, y: 3, width: 77, height: 23 },
      point: "app",
      lens: "tree",
      query: "",
      folds: { app: true, client: true },
      trace: null,
      only: "all",
      stack: false,
      json: false,
      peeks: {},
    },
    { encode: JSON.stringify, decode: JSON.parse },
  );

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
