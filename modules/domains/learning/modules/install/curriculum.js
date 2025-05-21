import config from "@vivalence/config";
import { promise, array, sleep } from "@vivalence/shared";

const log = true;
function chunked(promises) {
  return promise.chunked(promises, config.env.get("INSTALL_CHUNK_SIZE"), log);
}

export default async function curriculum({ curriculum }, runtime) {
  const installations = {};
  const validations = {};

  if (curriculum.tags?.length > 0) {
    log && console.log("\n\n[Tag installation:]");

    installations.tags = await chunked(
      curriculum.tags.map((tag) => () => runtime.call(`/tag/install`, { tag })),
    );
  }

  if (curriculum.units?.length > 0) {
    log && console.log("\n\n[Unit installation:]");

    installations.units = await chunked(
      curriculum.units.map((unit) => () => runtime.call(`/unit/install`, { unit })),
    );
  }

  if (curriculum.dependencies?.length > 0) {
    log && console.log("\n\n[Dependency installation:]");
    installations.dependencies = await chunked(
      curriculum.dependencies.map(
        (dependency) => () => runtime.call(`/dependency/install`, { dependency }),
      ),
    );
  }

  if (installations.tags?.flat().length > 0) {
    log && console.log("\n\n[Tag validation:]");
    validations.tags = await chunked(
      installations.tags
        .flat()
        .filter(({ status }) => status === "success")
        .map(
          ({ tag }) =>
            () =>
              runtime.call(`/tag/validate`, { tag }),
        ),
    );
  }

  if (installations.units?.flat().length > 0) {
    log && console.log("\n\n[Unit validation:]");
    validations.units = await chunked(
      installations.units
        .flat()
        .filter(({ status }) => status === "success")
        .map(
          ({ unit }) =>
            () =>
              runtime.call(`/unit/validate`, { unit }),
        ),
    );
  }
}

// const slug = "creía:imp-creer-ind-sing-3-verb-imp-fin";
// curriculum.units = curriculum.units.filter((u) => u.slug === slug);
// curriculum.units = curriculum.units.filter((u) => u.annotation.pos === "verb");
// curriculum.units = curriculum.units.filter((u) => u.annotation.verbform === "fin");
// curriculum.units.map((unit) => console.log(unit.annotation));
// curriculum.units = [curriculum.units[Math.floor(Math.random() * curriculum.units.length)]];
// curriculum.units = curriculum.units.sort(() => Math.random() - 0.5).slice(0, 1000);
// curriculum.units = curriculum.units.sort().slice(base + 2000, base + 4000);

// curriculum.tags = [curriculum.tags[Math.floor(Math.random() * curriculum.tags.length)]];

// for (const [key, resources] of Object.entries(curriculum)) {
//   resources
//     .map((resource) => ({ [resourceTypeMap[key]]: resource }))
//     .map((resource) => () => runtime.call(`/${resourceTypeMap[key]}/install`, resource))
//     .forEach((promise) => promises.push(promise));
// }

// let i = 0;
// const installations = [];

// // CHUNKED INSTALLATION
// // TODO: requires entitymap management bc of parallel entity construction and patching.

// // LINEAR INSTALLATION
