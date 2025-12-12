import { Application } from "@oak/oak";

import { Wafer } from "@vivalence/typology";
import { sleep } from "@vivalence/shared";
import * as lifecycle from "./lifecycle/index.js";

export class Die extends Wafer {
  server = new Application(); // runs an oak server
  abort = new AbortController(); // yeet that babye

  async populate() {
    await lifecycle.population.registry(this);
    await lifecycle.population.terrans(this);
    await lifecycle.population.aperture(this);
  }

  async resolve() {
    for (const die of this.good.terrans) {
      await die.populate();
      await die.resolve();
      await die.integrate();
    }

    await lifecycle.resolution.attach(this);
    await lifecycle.resolution.compose(this);
    await lifecycle.resolution.launch(this);
    await lifecycle.resolution.watchdog(this);
  }

  async integrate() {
    await lifecycle.integration.announce(this);
    this.status.set("alive");
  }

  async disintegrate() {
    this.status.set("stopping");

    for (const die of this.good.terrans) {
      await die.disintegrate?.();
    }

    this.abort.abort();

    delete this.good;

    await sleep(2);
    this.status.set("stopped");
  }

  async perpetuate() {
    this.status.set("alive");

    ["SIGTERM", "SIGINT", "SIGQUIT"].forEach((sig) => {
      Deno.addSignalListener(sig, () => this.disintegrate(sig));
    });

    while (this.status.is("alive")) {
      if (this.status.is("stopped")) {
        // shutdown in grace. i might need some hook here once i chose a paradigm for shutting down dies.
        return;
      }
      if (!this.good) {
        // handle missing runtime.
        return;
      }
      await this.good.ters?.patrol();
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }
}

// // construct runtime die from wafer
// import { Path } from "@vivalence/typology";
// import paladin from "@vivalence/paladin";

// // import { Runtime, lifecycle } from "./typology.js";

// const runtime = await (async () => {
//   console.log("runtime construction");
//   await paladin.ikiro;
//   const runtime = new Runtime();

//   await paladin.vip.mount(paladin.scope.registry.branch("kernels"));
//   await paladin.vip.mount(paladin.scope.registry.branch("modes"));
//   await paladin.vip.mount(paladin.scope.registry.branch("services"));

//   await lifecycle.populate.aperture(runtime);
//   await lifecycle.populate.terrans(runtime);
//   console.log("runtime populated");
//   return runtime;
// })();

//  = (async () => {
//   console.log("runtime integration");
//   await lifecycle.integrate.serve(runtime);
//   await lifecycle.integrate.watchdog(runtime);
//   await lifecycle.integrate.launch(runtime);
//   console.log("runtime integrated");
// })();
