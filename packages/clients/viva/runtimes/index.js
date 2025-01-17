import { runtimes } from "@vivalence/shared";

export default async function (viva) {
  viva.runtimes = await runtimes.loadFromRepo();

  if (false) {
    for (const runtime of Object.values(viva.runtimes)) {
      for (const service of Object.values(runtime.services)) {
        service.source = runtime;
      }
    }
  }

  return viva;
}
