import { join } from "@std/path";
import paladin from "@vivalence/paladin";
import { mime } from "@vivalence/typology";

export const FILESET = async (mode, context) => {
  const directory = join(mode.module.source.dirname, mode.module.fileset.path);
  mode.files = { ...mode.files, directory };
  if (mode.entity.installed) return;
  for (const file of await paladin.find.walk(/./)(directory)) {
    await context.entities.file.record({
      mode: mode.entity.id,
      path: file.absolute.slice(directory.length + 1),
      mount: file.absolute,
      mime: mime.of(file.absolute),
      bytes: await paladin.read.bytes(file.absolute),
    });
  }
};
