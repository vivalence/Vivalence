import { isAbsolute, resolve, dirname, fromFileUrl } from "@std/path";
import { Path } from "@vivalence/typology";

// tendentially supports every way a path gets referenced — beef: "absolute
// paths, relative to cli execution, relative to file name, etc". A bare
// string stays repo-root-relative; everything else is additive, all built
// from precedent already live elsewhere in the repo.
export default function source(paladin) {
  paladin.source = (reference) => {
    if (typeof reference === "object" && reference.file)
      return new Path(resolve(dirname(fromFileUrl(reference.file)), reference.source)); // relative to the declaring file
    const target = typeof reference === "string" ? reference : reference.source;
    if (isAbsolute(target)) return new Path(target); // absolute — as-is
    if (target.startsWith("./") || target.startsWith("../")) { // relative to CLI execution
      const cwd = Deno.env.get("INIT_CWD") ?? Deno.env.get("PWD") ?? Deno.cwd();
      return new Path(resolve(cwd, target));
    }
    return paladin.scope.repository.branch(target); // bare segment — repo-root-relative
  };
}
