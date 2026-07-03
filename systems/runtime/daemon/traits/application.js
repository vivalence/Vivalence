import { join } from "@std/path";
import { helper } from "@vivalence/typology/entities";
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

  const ensure = (repo, ref) => (helper(ref) ? ref : repo.findOne(ref?.id ?? ref));

  mode.buffer = async (data = {}) => {
    // extend to rich interface. ctx.mode.buffer.emit()
    const buffer = daemon.entities.em.create(BufferEntity, {
      mode: mode.entity.id,
      data: mode.module.app.fill(data),
      index: data.index ?? 0,
    });
    if (data.literals)
      buffer.literals.add(
        await Promise.all(data.literals.map((l) => ensure(daemon.entities.literal, l))),
      );
    if (data.symbols)
      buffer.symbols.add(
        await Promise.all(data.symbols.map((s) => ensure(daemon.entities.symbol, s))),
      );
    return buffer;
  };
};
