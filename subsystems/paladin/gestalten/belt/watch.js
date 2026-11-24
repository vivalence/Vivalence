const SETTLE = 200;

export default function watch(paladin) {
  paladin.watch = (path, heard) => {
    const watcher = Deno.watchFs(path?.absolute ?? path);
    const changed = new Set();
    let settling = null;

    const settle = () => {
      const paths = [...changed];
      changed.clear();
      heard(paths);
    };

    const listen = async () => {
      for await (const event of watcher) {
        if (event.kind === "access") continue;
        for (const path of event.paths) changed.add(path);
        clearTimeout(settling);
        settling = setTimeout(settle, SETTLE);
      }
    };
    listen();

    return () => {
      clearTimeout(settling);
      watcher.close();
    };
  };
}
