// import fs from "fs-extra";
import { colors } from "@cliffy/ansi/colors";

// import { Prompt } from "@vivalence/interfaces-cli";
// import config from "@vivalence/config";

export const match = "/list";
export const name = "list all services";

export default async (ctx) => {
  console.log(ctx);
  console.log(colors.bold("Services found in viva repo:"));

  const serviceConfigs = Object.entries(
    obj.deepMerge(
      viva.services,
      (() => Object.values(viva.runtimes).reduce((s, r) => r.services, {}))(),
    ),
  );

  const Services = {};
  for (const [serviceKey, serviceConfig] of serviceConfigs) {
    const Service = await registry.load(serviceConfig.service);
    if (!Service?.service) continue;
    // if key exists, warn and apply priority queue
    Services[serviceKey] = Service;
  }

  for (const [serviceKey, Service] of Object.entries(Services)) {
    console.log(`  ${serviceKey}: ${Service.manifest.name}`);
  }
};
