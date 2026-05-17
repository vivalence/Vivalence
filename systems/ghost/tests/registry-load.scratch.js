// Ephemeral: verify paladin.vip can mount registry and accio a wafer.
// Delete after confirming.

import paladin from "@vivalence/paladin";
import { Path } from "@vivalence/typology";

await paladin.ikiro;

const registryPath = new Path(paladin.env.get("VIVA_REPOSITORY_MOUNT")).branch("registry");
console.log("registry path:", registryPath.absolute);

await paladin.vip.mount(registryPath);
console.log("pensieve size:", paladin.vip.pensieve.size);

const localhost = await paladin.vip.accio("@vivalence/variant/localhost");
console.log("localhost manifest:", localhost?.manifest);
console.log("localhost mount:", localhost?.mount?.absolute);
console.log("has modes via daemons[0]:", localhost?.daemons?.[0]?.modes?.length);

const owners = [...paladin.vip.pensieve.keys()];
console.log("owners:", owners);
const vivalenceTypes = [...paladin.vip.pensieve.get("@vivalence").keys()];
console.log("types under @vivalence:", vivalenceTypes);
for (const type of vivalenceTypes) {
  const slugs = [...paladin.vip.pensieve.get("@vivalence").get(type).keys()];
  console.log(`  ${type}:`, slugs);
}
