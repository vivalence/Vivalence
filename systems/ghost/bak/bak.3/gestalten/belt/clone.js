// recursive directory copy. distinct from `paladin.clone`, which is the git/jj checkout —
// this one materializes a tree already on disk (an instance from a source, a package from a package).
export async function tree(source, target) {
  await Deno.mkdir(target, { recursive: true });
  for await (const entry of Deno.readDir(source)) {
    const from = `${source}/${entry.name}`;
    const to = `${target}/${entry.name}`;
    if (entry.isDirectory) {
      await tree(from, to);
    } else if (entry.isFile) {
      await Deno.copyFile(from, to);
    }
  }
}
