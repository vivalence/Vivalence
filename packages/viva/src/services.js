import registry from "@vivalence/registry";
import config from "@vivalence/config";

import { Command } from "jsr:@cliffy/command@1.0.0-rc.7";
import { colors } from "jsr:@cliffy/ansi@1.0.0-rc.7/colors";

export default async function loadServices() {
  for (const [serviceKey, serviceSlug] of Object.entries(config.services)) {
    config.services[serviceKey] = await registry.load(serviceSlug);
  }

  const List = new Command()
    .name("list")
    .description("List all services")
    .action(() => {
      console.log(colors.bold("Services:"));
      for (const [serviceKey, service] of Object.entries(config.services)) {
        console.log(`  ${serviceKey}: ${service.manifest.name}`);
      }
    });

  const Commands = new Command().description("Manage Vivalence services").command("list", List);

  for (const [serviceKey, service] of Object.entries(config.services)) {
    const Service = new Command();

    for (const command of Object.values(await service.service())) {
      Service.command(command.name).action(command.action).description(command.description);
    }

    Commands.command(serviceKey, Service).description(service.manifest.name);
  }

  return Commands;
}
