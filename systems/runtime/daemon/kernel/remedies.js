export async function remedies(daemonDie) {
  for (const kernelmode of [
    daemonDie.kernel.ontology,
    ...daemonDie.kernel.topic,
  ]) {
    if (kernelmode.topography?.remedies)
      kernelmode.topography?.remedies.map((r) =>
        daemonDie.good.kernel.medic.register(r),
      );
  }
}
