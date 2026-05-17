import paladin from "@vivalence/paladin";
import { resolve } from "@std/path";
import * as fs from "@std/fs";

export async function clone(ctx) {
  const { signal, span } = ctx;
  const [slug, targetArg] = signal.params;

  if (!slug || !targetArg) {
    throw new Error("usage: instance/clone <slug> <target>");
  }

  await paladin.vip.mount(paladin.scope.registry);

  const cake = await paladin.vip.accio(slug);
  const sourcePath = cake.mount.dirname;
  const targetPath = resolve(Deno.cwd(), targetArg);

  span?.track.subject({ schema: "variant", id: cake.manifest.slug });

  await paladin.state.dir(targetPath);
  await fs.copy(sourcePath, targetPath, { overwrite: true });

  await paladin.system.instances.write(cake.manifest.slug, {
    mount: targetPath,
  });

  ctx.effect = {
    status: "cloned",
    slug: cake.manifest.slug,
    source: sourcePath,
    target: targetPath,
  };
}
