import { Call } from "./call/index.js";

function track(status) {
  return async (ctx, next) => {
    status.code = "WIP";
    try {
      await next();
      status.code = "SUCCESS";
      status.label = "alive";
    } catch (error) {
      status.error = { ...error };
      status.code = "ERROR";
      status.label = "erronious";
      throw error;
    }
  };
}

export function createService(url) {
  let manifest = $state({});
  let status = $state({
    label: "uninitialized",
    code: "PENDING",
    timestamp: new Date(),
  });

  const call = new Call(url).use(track(status));
  const service = { manifest, status, call };

  service.handshake = async () => {
    if (!manifest.slug)
      Object.assign(manifest, await service.call("/manifest"));
    return manifest;
  };

  return service;
}
