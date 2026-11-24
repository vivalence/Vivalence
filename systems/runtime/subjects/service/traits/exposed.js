import { shard } from "@vivalence/typology";

export const EXPOSED = (service, mask) => {
  service.aperture.use(shard.context.bind("mask", mask)).graft(service.module.aperture);
};
