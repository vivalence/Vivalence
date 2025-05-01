import config from "@vivalence/config";
import Repository from "@vivalence/repository";

export default async function (viva) {
  const services = await Repository.services.load(config.services);
  const runtimes = await Repository.runtimes.load();

  for (const [serviceKey, service] of Object.entries(services)) {
    await service.boot(
      { trajectory: viva.trajectory.branch((p) => p.path(`/daemon/${serviceKey}`)) },
      service,
    );
  }

  for (const runtime of runtimes) {
    for (const [serviceKey, service] of Object.entries(runtime.services)) {
      await service.boot(
        {
          trajectory: viva.trajectory.branch((p) =>
            p.path(`/runtimes/${runtime.manifest.slug}/${serviceKey}`),
          ),
        },
        service,
      );
    }
  }

  return viva;
}
