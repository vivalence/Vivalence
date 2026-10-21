import { is } from "@vivalence/typology";
import { Box, Bridge, Telemetry } from "./prototypes/index.js";

export class App {
  client = null;
  surface = null;
  controller = null;
  box = new Box(this);
  bridge = new Bridge();
  telemetry = new Telemetry(this);

  constructor(app) {
    Object.assign(this, app);
  }

  get theme() {
    return [this.bridge.theme, this.client.mask.trait.THEMED, "trait" in this.client.user ? this.client.user.trait.THEMED : "porcelain"].find(is.string);
  }
}
