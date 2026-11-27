import { join } from "@std/path";
import paladin from "@vivalence/paladin";
import { Path } from "@vivalence/typology";

export const boot = async (modeDie, mode) => {
  const source = join(new Path(mode.mountpoint).absolute, "source");
  await paladin.write.dir(source);
  return paladin.watch.directory(source, () => mode.call.build().catch((error) => mode.stdout.fault(error)));
};
