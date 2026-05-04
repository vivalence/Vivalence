import { is, object, Wafer, Blacklist } from "@vivalence/typology";

import * as lifecycle from "./lifecycle/index.js";
import * as aperture from "./aperture/index.js";

// TODO migrate to dossier pattern.
// TODO2 rename dossier pattern do die pattern.
// aka keep name, change pattern.

export class Die extends Wafer {
  register = {
    lighthouse: null,
    hallucinator: null,
    speech: null,
    verbatim: null,
    datamap: null,
    kernel: [],
    modes: [],
    services: [],
  };

  variant = {
    kernel: {},
    modes: [],
    traits: {},
    entities: [],
    services: {},
  };

  async populate() {
    await lifecycle.population.core(this);
    lifecycle.population.wiring(this);
    await lifecycle.population.datamap(this);
    await lifecycle.population.authority(this);
    await lifecycle.population.acid(this);
    await lifecycle.population.modes(this);
    await lifecycle.population.handlers(this);
    await lifecycle.population.services(this);
  }

  async resolve() {
    await lifecycle.resolution.kernel(this);
    await lifecycle.resolution.modes(this);
    await lifecycle.resolution.freight(this);

    await aperture.datamap(this);
    await aperture.userspace(this);
    await aperture.modes(this);
    await aperture.freight(this);
  }

  async integrate() {
    await lifecycle.integration.call(this);
    await (async () => {
      return;
      await this.datamap.shard.context(async () => {
        const entityTypes = [
          "user",
          "mode",
          "literal",
          "symbol",
          "thread",
          "turn",
          "buffer",
          "memory",
          "trace",
          "intent",
        ];

        const samples = {};

        for (const name of entityTypes) {
          try {
            const entities = await this.good.entities[name].find({}, { limit: 3, filters: false });

            samples[name] = entities.map((e) => {
              const json = e.toJSON();
              const snapshot = { id: json.id };

              // Include all scalar/simple fields
              for (const [key, value] of Object.entries(json)) {
                if (key === "id") continue;

                // Keep scalars, dates, and arrays of scalars
                if (
                  typeof value === "string" ||
                  typeof value === "number" ||
                  typeof value === "boolean" ||
                  value instanceof Date ||
                  (Array.isArray(value) && value.every((v) => typeof v !== "object"))
                ) {
                  snapshot[key] = value;
                }
                // Keep simple objects (metadata, not entity relations)
                else if (value && typeof value === "object" && !value.id && !Array.isArray(value)) {
                  snapshot[key] = value;
                }
                // For entity relations, convert to ID
                else if (value && typeof value === "object" && value.id) {
                  snapshot[`${key}Id`] = value.id;
                }
                // For collections, show count and IDs
                else if (Array.isArray(value) && value.length > 0) {
                  snapshot[`${key}Count`] = value.length;
                  if (value[0]?.id && value.length <= 5) {
                    snapshot[`${key}Ids`] = value.map((v) => v.id);
                  }
                }
              }

              return snapshot;
            });
          } catch (error) {
            samples[name] = { error: error.message };
          }
        }

        console.log(JSON.stringify(samples, null, 2));
      });
    })();
    // await lifecycle.integration.prune(this);
    this.status.set("alive");
  }

  async disintegrate() {
    await this.datamap?.disintegrate();
    this.status.set("stopped");
  }
}
