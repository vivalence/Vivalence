import paladin from "@vivalence/paladin";
import { dirname, resolve } from "@std/path";
import { CloneConfirm, SlugPicker, TargetPicker } from "./Clone.jsx";

// skip state + scm during clone — clone is "fresh checkout from registry"
// const SKIP = new Set([".logs", ".git", ".jj", "node_modules"]);

export async function clone(ctx) {
  const modules = await findModules();

  let identifier = ctx.signal.params[0];
  let module = identifier
    ? modules.find((c) => c.manifest.identifier === identifier || c.manifest.slug === identifier)
    : null;

  // explicit identifier passed but no match — drop to picker
  if (identifier && !module) {
    console.warn(`variant not found: ${identifier}`);
    identifier = null;
  }

  if (!module) {
    const choice = await ctx.view.scroll.render(
      { options: modules.map((c) => c.manifest.identifier) },
      null,
      SlugPicker,
    );
    if (!choice) return (ctx.effect = { aborted: true });
    module = modules.find((c) => c.manifest.identifier === choice);
  }

  let target = ctx.signal.params[1];
  if (!target) {
    target = await ctx.view.scroll.render(
      { initial: `./${module.manifest.slug}` },
      null,
      TargetPicker,
    );
  }
  if (!target) return (ctx.effect = { aborted: true });

  const source = dirname(module.mount.absolute);
  // shell cwd — deno task rewrites PWD to repo root; INIT_CWD preserves original shell cwd
  const cwd = Deno.env.get("INIT_CWD") ?? Deno.env.get("PWD") ?? Deno.cwd();
  const absolute = resolve(cwd, target);

  // console.log({
  //   env: Deno.env.toObject(),
  //   paladin: paladin.env.vars,
  //   cwd,
  //   identifier,
  //   module,
  //   target,
  //   source,
  //   absolute,
  // });

  const confirmed = await ctx.view.scroll.render(
    { source, target: absolute, identifier: module.manifest.identifier },
    null,
    CloneConfirm,
  );
  if (!confirmed) return (ctx.effect = { aborted: true });

  await cloneDir(source, absolute);

  ctx.effect = {
    variant: module.manifest,
    target: { relative: target, absolute },
    source,
  };
}

async function findModules() {
  await paladin.vip.supply();
  return await paladin.vip.list({ type: "variant" });
}

export async function cloneDir(source, target) {
  await Deno.mkdir(target, { recursive: true });
  for await (const entry of Deno.readDir(source)) {
    // if (SKIP.has(entry.name)) continue;
    const src = `${source}/${entry.name}`;
    const dst = `${target}/${entry.name}`;
    if (entry.isDirectory) {
      await cloneDir(src, dst);
    } else if (entry.isFile) {
      await Deno.copyFile(src, dst);
    }
  }
}
