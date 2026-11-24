const SETTLE = 200;

export const watch = (paladin) => {
  const hear = (paths, heard) => {
    const watcher = Deno.watchFs(paths);
    const changed = new Set();
    let settling = null;
    (async () => {
      for await (const event of watcher) {
        if (event.kind === "access") continue;
        for (const path of event.paths) changed.add(path);
        clearTimeout(settling);
        settling = setTimeout(() => {
          const paths = [...changed];
          changed.clear();
          heard(paths);
        }, SETTLE);
      }
    })();
    return () => {
      clearTimeout(settling);
      watcher.close();
    };
  };

  paladin.watch = {
    directory: (path, heard) => hear(path.absolute ?? path, heard),
    files: (paths, heard) => hear(paths.map((path) => path.absolute ?? path), heard),
  };
};
