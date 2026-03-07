import { entities } from "@vivalence/html/typology";
import { lighthouse, dataspace } from "$client";

export const ssr = false;

let booted = false;
export const load = async () => {
  if (booted) return;
  booted = true;
  await entities.lighthouse.lifecycle(lighthouse);

  // console.log(dataspace.daemon);
};
