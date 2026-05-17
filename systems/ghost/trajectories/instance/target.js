import paladin from "@vivalence/paladin";
import { resolve } from "@std/path";

export async function resolveTarget(target) {
  if (!target) throw new Error("usage: instance/<cmd> <slug|path>");
  const entry = await paladin.system.instances.read(target);
  return {
    slug: entry ? target : target.replaceAll("/", "_"),
    mount: entry?.mount ?? resolve(Deno.cwd(), target),
  };
}

export const CHILDREN = [
  { process: "runtime", task: "runtime/run" },
  { process: "kajuit", task: "kajuit/watch" },
];
