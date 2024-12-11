import { Command, colors } from "@vivalence/interfaces-cli";
import registry from "@vivalence/registry";
import config from "../../../../config/src/mod.ts";

export default async function loadServiceCommands(viva) {
  const services = {};
  const Commands = new Command().description("Manage Vivalence services");

  for (const [serviceKey, serviceSlug] of Object.entries(config.services)) {
    const service = await registry.load(serviceSlug);
    if (!service?.service) continue;
    services[serviceKey] = service;
  }

  Commands.command(
    "list",
    new Command()
      .name("list")
      .description("List all services")
      .action(() => {
        console.log(colors.bold("Services:"));
        for (const [serviceKey, service] of Object.entries(services)) {
          console.log(`  ${serviceKey}: ${service.manifest.name}`);
        }
      }),
  );

  for (const [serviceKey, service] of Object.entries(services)) {
    const commands = await service.service(viva);

    const Service = new Command();
    for (const command of Object.values(commands)) {
      Service.command(command.name).action(command.action).description(command.description);
    }
    Commands.command(serviceKey, Service).description(service.manifest.name);
  }

  return Commands;
}
