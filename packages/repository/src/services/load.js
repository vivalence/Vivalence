import config from "@vivalence/config";
import { loadServices } from "../lib/loadServices.ts";

export default async function load(configMap = null) {
  if (configMap === null) configMap = config.services;
  return await loadServices(configMap);
}
