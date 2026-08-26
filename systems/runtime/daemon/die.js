import { is, object, shape, Wafer, Blacklist } from "@vivalence/typology";

import * as lifecycle from "./lifecycle/index.js";
import * as aperture from "./aperture/index.js";

// TODO migrate to dossier pattern.
// TODO2 rename dossier pattern do die pattern.
// aka keep name, change pattern.

export class Die extends Wafer {
  register = {
    lighthouse: null,
    hallucinator: null,
    datamap: null,
    kernel: [],
    services: [],
  };

  instance = {
    kinds: {},
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
    await lifecycle.resolution.domain(this);
    await lifecycle.resolution.modes(this);
    await lifecycle.resolution.freight(this);

    await aperture.datamap(this);
    await aperture.userspace(this);
    await aperture.modes(this);
    await aperture.freight(this);
    await aperture.metadata(this);
    await aperture.cortex(this);
  }

  async integrate() {
    await lifecycle.integration.call(this);
    // console.log("this", this.mask, Object.keys(this));

    // const compiled = shape.agentic(this.good.aperture);
    // console.log(compiled);
    await lifecycle.integration.prune(this);
    this.status.set("alive");
  }

  async disintegrate() {
    for (const mode of this.good?.flatmodes?.() ?? [])
      for (const terminate of mode.terminators ?? []) await terminate();
    await this.datamap?.disintegrate();
    this.status.set("stopped");
  }
}

// lifecyclelogs =

//     // ── CLAUDE EPHEMERAL · snapshot daemon modes · DELETE ME ─────────────
//     // three interesting modes captured DEEP (full instance, generous depth);
//     // the rest shallow (curated field pick). DRY = preview paths/sizes, write nothing.
//     const { snapshot } = await import("@vivalence/typology/specimen");
//     const base = new URL("../tests/snapshots", import.meta.url).pathname;
//     const DRY = false; // write the instance snapshots (dry:true to preview)
//     const DEEP = new Set(["language-learning", "aprende", "nyan"]);
//     const SHALLOW = ["id", "type", "slug", "traits", "manifest", "metadata"];

//     for (const mode of this.good.flatmodes()) {
//       const deep = DEEP.has(mode.slug);
//       const { pojo, path } = snapshot(mode, {
//         base,
//         dry: DRY,
//         depth: deep ? 6 : 2,
//         pick: deep ? undefined : SHALLOW,
//         omit: deep ? ["module"] : undefined, // module duplicates the live aperture/emitter contract
//         locate: () => `${mode.type}-${mode.slug}-${this.slug}.snapshot.json`,
//       });
//       const json = JSON.stringify(pojo);
//       console.log(
//         `[snapshot ${DRY ? "DRY" : "WRITE"}${deep ? " deep" : "     "}] ` +
//           `${mode.type}/${mode.slug} → ${path} · ${Object.keys(pojo).length} keys · ` +
//           `${json.length} bytes · ~${Math.ceil(json.length / 4)} tokens`, // ~4 chars/token heuristic
//       );
//       console.log(`\n===BEGIN ${mode.type}/${mode.slug}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
//     }
//     // ── /CLAUDE EPHEMERAL ────────────────────────────────────────────────
