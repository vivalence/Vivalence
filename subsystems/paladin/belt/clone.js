import { dirname } from "@std/path";
import { Path } from "@vivalence/typology";

const REMOTE = /^(https?:|git@|ssh:)/;

export default function clone(paladin) {
  const attempt = async (bin, args) => {
    try {
      const { success, stderr } = await new Deno.Command(bin, { args }).output();
      return { success, stderr: new TextDecoder().decode(stderr) };
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) return null;
      throw error;
    }
  };

  paladin.clone = async (remote, destination) => {
    const target = destination.absolute ?? String(destination);
    await Deno.mkdir(dirname(target), { recursive: true });
    const jj = await attempt("jj", ["git", "clone", "--colocate", remote, target]);
    if (jj?.success) return new Path(target);
    if (jj) throw new Error(`[PALADIN] clone ${remote}: ${jj.stderr}`);
    const git = await attempt("git", ["clone", remote, target]);
    if (git?.success) return new Path(target);
    throw new Error(`[PALADIN] clone ${remote}: ${git ? git.stderr : "neither jj nor git on PATH"}`);
  };

  // the ONE test for "is this a remote spec" — callers that pre-resolve paths must ask before
  // resolving, or an scp-style `git@host:path` is rewritten into a cwd path and stops being remote.
  paladin.clone.remote = (source) => REMOTE.test(String(source ?? ""));
}
