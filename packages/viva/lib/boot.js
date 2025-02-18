import config from "@vivalence/config";
import registry from "@vivalence/registry";
import { colors } from "@vivalence/interfaces-cli";

// need to add checks that variables are present, process captured, registry init successfull, trajectory commands compiled, daemon successfull daemonized, runtime boots successfull.
// this step should also read .source and itterate through and ask for any it has a $PLACEHOLDER_ID name, and write missing ones..
// test if the locals are working. docker ps confirms that docker service is running f.E.

export default async function boot(viva) {
  return await install(viva);
}

async function install(viva) {
  if (!config.env.get("VIVA_SELF_INSTALLED")) {
    console.log(colors.blue("Installing viva ..."));

    console.log(colors.blue("Starting database services..."));
    if (!viva.services.database) throw new Error("[viva] no database service defined");
    const databaseModule = await registry.load(viva.services.database.service);
    if (!databaseModule) throw new Error("[viva] no database module loaded");
    const databaseService = await databaseModule.service(viva.services.database, viva);
    if (!databaseService) throw new Error("[viva] no database service to boot");
    await databaseService.install.do();
    console.log(colors.green("✓ database services started successfully"));

    // TODO: migrations / schemad  deploy

    config.env.write("VIVA_SELF_INSTALLED", true);

    // console.log(colors.blue("Starting identity services..."));
    // const identityModule = await registry.load(viva.services.identity);
    // const identityTMap = await identityModule.service(viva);
    // throw new Error("Stop");
    // console.log(colors.green("✓ identity services started successfully"));

    console.log(colors.green("✓ Install successfull"));
  }
  return viva;
}
