import { lighthouse, remotes, generator } from "$client";
import { entities } from "@vivalence/html/typology";

export const ssr = false;

let booted = false;

export const load = async () => {
  if (booted) return;
  booted = true;

  await entities.lighthouse.lifecycle(lighthouse);
  remotes.lighthouse.add(lighthouse);
};
