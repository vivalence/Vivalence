import { Signal, Feature } from "@vivalence/typology";
import { shards, Vector } from "@vivalence/vector";

export async function topography(daemonDie) {
  for (const kernelmodule of daemonDie.register.kernel) {
    if (!kernelmodule.topography) continue;

    if (kernelmodule.topography?.dimensions) {
      await Promise.all(
        kernelmodule.topography.dimensions.map((t) => daemonDie.good.entities.dimension.ensure(t)),
      );
      // console.log(await daemonDie.good.entities.dimension.find(), daemonDie.good.entities.dimension,);
    }

    if (kernelmodule.topography?.subjects)
      await Promise.all(
        kernelmodule.topography.subjects.map((t) => daemonDie.good.entities.subject.ensure(t)),
      );

    if (kernelmodule.topography?.remedies)
      kernelmodule.topography?.remedies.map((r) => daemonDie.good.kernel.medic.register(r));
  }

  await daemonDie.good.entities.em.flush();
}

// if (topology.constraints) topology.constraints .map((c) => rme.instance.ontology.constraint.create(c));
// if (topology.remedies) topology.remedies.map((r) => rme.instance.ontology.medic.register(r));
// if (topology.receptors) {
//   topology.receptors.entries().forEach(([form, parsers]) => {
//     parsers.map((parser) =>
//       rme.instance.ontology.taxonomist.on(form, parser),
//     );
//   });
// }
// export async function topography(daemonDie) {
//   // console.log(daemonDie);
//   // const datasets = daemonDie .flatmodules() .filter(module.manifest.traits.includes("DATASET"));
//   // console.log({ datasets });

//   for (const dataset of daemonDie.register.kernel) {
//     if (!dataset.manifest.traits.includes("DATASET")) continue;
//     await traitmap.DATASET(dataset, daemonDie.good);
//   }

//   //   for (const {
//   //     dimension = [],
//   //     topography = [],
//   //     constraint = [],
//   //     // predicate = [],
//   //     remedy = [],
//   //     receptor = [],
//   //   } of topic) {
//   //     dimensions.forEach((a) => ontology.dimension.create(a));
//   //     // constraints.forEach((c) => ontology.constraint.create(c));
//   //     // topographies.forEach((t) => ontology.topography.create(t));

//   //     // remedies.forEach((r) => ontology.remedy.register(r));
//   //     // // predicate.forEach((r) => ontology.remedy.register(r));
//   //     // // receptor.entries().forEach(([form, parsers]) => {
//   //     // //   parsers.map((parser) => ontology.classifier.on(form, parser));
//   //     // // });
//   //   }

//   //   // runtime.ontology = ontology;
//   //   // factories.reduce((r, f) => f(r), runtime);

//   // // if (runtime.config.modules.ontology.boot) runtime.config.modules.ontology.boot(ontology);

//   //   //
// }
