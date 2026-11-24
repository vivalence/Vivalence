export const remove = (paladin) => {
  paladin.remove = {
    file: (path) => Deno.remove(path.absolute ?? path).catch(() => {}),
  };
};
