import { Command, colors } from "@vivalence/interfaces-cli";
import registry from "@vivalence/registry";
import { obj } from "@vivalence/shared";

export default async function loadServiceCommands(viva) {
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

  const Commands = new Command().description("Manage Vivalence services");

  const ListCommand = new Command()
    .name("list")
    .description("List all services")
    .action(() => {
      // >> @interface-cli/component: display list/table
      console.log(colors.bold("Services found in viva repo:"));
      for (const [serviceKey, Service] of Object.entries(Services)) {
        console.log(`  ${serviceKey}: ${Service.manifest.name}`);
      }
    });

  Commands.command("list", ListCommand);

  for (const [serviceKey, serviceConfig] of serviceConfigs) {
    const Service = Services[serviceKey];
    if (!Service) continue;

    const commands = await Service.service(serviceConfig, viva);

    const ServiceCommand = new Command();
    for (const [verb, command] of Object.entries(commands)) {
      ServiceCommand.command(verb).action(command.do).description(command.what);
    }

    Commands.command(serviceKey, ServiceCommand).description(Service.manifest.name);
  }

  return Commands;
}
