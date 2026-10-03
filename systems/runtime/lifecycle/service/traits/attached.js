import { shard } from "@vivalence/typology";

export const ATTACHED = (service, mask) => {
  service.attachment
    .open("/status", () => service.controller.status)
    .open("/manifest", () => service.manifest)
    .use(shard.context.bind("service", service))
    .use(shard.context.bind("mask", mask));
  if (mask.attachment) service.attachment.graft(mask.attachment);
};
