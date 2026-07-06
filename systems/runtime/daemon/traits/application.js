import { join } from "@std/path";
import { bundle } from "@vivalence/typology";
import { BufferEntity, LiteralEntity, SymbolEntity } from "@vivalence/typology/entities";

let _svelte;
async function svelte() {
  if (_svelte) return _svelte;

  const paladin = (await import("@vivalence/paladin")).default;
  if (!paladin.scope.repository) throw new Error("!paladin.scope.repository");
  const reporoot = paladin.scope.repository.absolute;
  const imports = {
    "@vivalence/typology": join(reporoot, "subsystems/typology/mod.client.js"),
    "@vivalence/typology/schematics": join(reporoot, "subsystems/typology/schematics/index.js"),
    "@vivalence/shared": join(reporoot, "subsystems/shared/mod.client.js"),
    "@vivalence/drapes": join(reporoot, "subsystems/drapes/mod.js"),
    "@vivalence/kajuit": join(reporoot, "systems/kajuit/src/typology/mod.js"),
  };
  _svelte = (entry) =>
    bundle.svelte(entry, { prod: paladin.is.prod, imports, baseUrl: new URL(import.meta.url) });
  return _svelte;
}

export const APPLICATION = async (mode, daemon) => {
  mode.module.app.withBundler(await svelte());
  // await mode.module.app.bundling;

  mode.aperture.open("/buffered", () => ({
    url: mode.module.app.url.absolute,
    schema: mode.module.app.mask,
  }));

  mode.app.buffer = async (descr = {}) => {
    // v.schematics(descr)
    const buffer = daemon.entities.em.create(BufferEntity, {
      // @beef thread!
      mode: mode.entity.id,
      data: mode.app.fill(descr),
      index: descr.index ?? 0,
    });
    if (descr.literals)
      buffer.literals.add(await daemon.entities.literal.findByIdentifiers(descr.literals));
    if (descr.symbols)
      buffer.symbols.add(await daemon.entities.symbol.findByIdentifiers(descr.symbols));
    return buffer;
  };
};
