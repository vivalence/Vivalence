import { Wafer } from "@vivalence/typology";
import paladin from "@vivalence/paladin";
import * as lifecycle from "./lifecycle/index.js";

export class Die extends Wafer {
  get manifest() {
    const runtime = paladin.instance.runtime ?? {};
    return {
      type: "runtime",
      slug: runtime.slug ?? "runtime",
      traits: runtime.traits ?? [],
    };
  }

  async populate() {
    await lifecycle.population.wiring(this);
    await lifecycle.population.registry(this);
    await lifecycle.population.daemons(this);
    await lifecycle.population.processes(this);
    await lifecycle.population.aperture(this);
  }

  async resolve() {
    for (const die of [...this.good.daemons, ...this.good.processes]) {
      await die.populate();
      await die.resolve();
      await die.integrate();
    }

    await lifecycle.resolution.attach(this);
    await lifecycle.resolution.expose(this);
    await lifecycle.resolution.metadata(this);
    // await lifecycle.resolution.compose(this);
  }

  async integrate() {
    await lifecycle.integration.launch(this);
    await lifecycle.integration.wake(this);
    await lifecycle.integration.announce(this);
    this.status.set("alive");
  }

  async disintegrate() {
    if (this.status.is(["STOPPING", "STOPPED"])) return;
    this.status.set("stopping");

    for (const die of [...this.good.daemons, ...this.good.processes]) {
      await die.disintegrate?.();
    }

    this.abort.abort();
    this.status.set("stopped");
  }

  async perpetuate() {
    this.status.set("alive");

    // console.log("run.status");
    // console.log(this.status);
    // console.log("run.status");

    ["SIGTERM", "SIGINT", "SIGQUIT"].forEach((sig) => {
      Deno.addSignalListener(sig, async () => {
        await this.disintegrate();
        Deno.exit(0);
      });
    });

    while (this.status.is("alive")) {
      await this.good.ters?.patrol();
      await new Promise((resolve) => setTimeout(resolve, 60000));
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
