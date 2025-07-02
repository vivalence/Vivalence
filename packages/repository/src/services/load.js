// import { loadServices } from "../lib/loadServices.ts";

export default async function load(configMap = null) {
  if (configMap === null) throw new Error("Service loading requires config.");
  return await loadServices(configMap);
}
