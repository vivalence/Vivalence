import { join } from "@std/path";
import { helper } from "@mikro-orm/core";
import { bundle, is } from "@vivalence/typology";
import { BufferEntity, LiteralEntity, SymbolEntity } from "@vivalence/typology/entities";
import paladin from "@vivalence/paladin";

const reporoot = paladin.scope.system.absolute;

const imports = {
  "@vivalence/typology": join(reporoot, "subsystems/typology/mod.client.js"),
  "@vivalence/typology/schematics": join(reporoot, "subsystems/typology/schematics/index.js"),
  "@vivalence/shared": join(reporoot, "subsystems/shared/mod.client.js"),
  "@vivalence/drapes": join(reporoot, "subsystems/drapes/mod.js"),
};

function svelte(entry) {
  return bundle.svelte(entry, {
    prod: paladin.is.prod,
    imports,
    baseUrl: new URL(import.meta.url),
  });
}

export const BUFFERED = (mode, daemon) => {
  mode.cake.buffer.withBundler(svelte);
  mode.aperture.open("/buffered", () => ({
    url: mode.cake.buffer.url.absolute,
    schema: mode.cake.buffer.schema,
  }));

  const ensure = (repo, ref) => helper(ref) ? ref : repo.findOne(ref?.id ?? ref);

  mode.buffer = async (desc = {}) => {
    const buffer = daemon.entities.em.create(BufferEntity, {
      mode: mode.entity.id,
      data: mode.cake.buffer.cast(desc),
      index: desc.index ?? 0,
    });
    if (desc.literals) buffer.literals.add(await Promise.all(desc.literals.map((l) => ensure(daemon.entities.literal, l))));
    if (desc.symbols) buffer.symbols.add(await Promise.all(desc.symbols.map((s) => ensure(daemon.entities.symbol, s))));
    return buffer;
  };
};

// export const BUFFERED = (mode, daemon) => {
//   mode.cake.buffer.withBundler(svelte);
//   mode.aperture.open("/buffered", () => ({
//     url: mode.cake.buffer.url.absolute,
//     schema: mode.cake.buffer.schema,
//   }));
//   mode.buffer = (props) => ({
//     mode: mode.entity.id,
//     props: mode.cake.buffer.cast(props),
//   });
// };
