import { entities } from "@vivalence/html/typology";
import { lighthouse, dataspace } from "$client";

export const ssr = false;

entities.lighthouse.hydrate(lighthouse);

export const load = async ({ url }) => {
  if (!lighthouse.$isAuthorized.get()) return;
  if (dataspace.daemon.$entities.get().length) return;
  await entities.lighthouse.lifecycle(lighthouse);
};
