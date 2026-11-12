// limit: 3000 chars
import { dirname, join } from "@std/path";
import paladin from "@vivalence/paladin";

const HOME = Deno.env.get("HOME");
const MODES = [
  `${HOME}/.viva/registry/education/modes/home/aprende/aprende.viva.js`,
  `${HOME}/.viva/registry/education/modes/games/dojo/dojo.viva.js`,
  `${HOME}/.viva/registry/education/modes/games/comando/comando.viva.js`,
  `${HOME}/.viva/registry/education/modes/games/riddler/riddler.viva.js`,
  `${HOME}/.viva/registry/education/modes/games/cocina/cocina.viva.js`,
  `${HOME}/.viva/registry/assembly/modes/model/import/import.viva.js`,
  `${HOME}/.viva/registry/assembly/modes/model/editor/editor.viva.js`,
  `${HOME}/.viva/registry/assembly/modes/guide/editor/editor.viva.js`,
  `${HOME}/.viva/registry/assembly/modes/guide/player/player.viva.js`,
  `${HOME}/.viva/registry/chess/modes/board/play/play.viva.js`,
  `${HOME}/.viva/registry/chess/modes/study/analysis/analysis.viva.js`,
  `${HOME}/.viva/registry/chess/modes/riddle/puzzles/puzzles.viva.js`,
  `${HOME}/.viva/registry/chess/modes/coach/practice/practice.viva.js`,
  `${HOME}/.viva/registry/chess/modes/library/games/games.viva.js`,
  new URL("../../../commons/reader/reader/reader.viva.js", import.meta.url).pathname,
  new URL("../../../commons/editors/darkroom/darkroom.viva.js", import.meta.url).pathname,
  new URL("../../../commons/dashboards/dataspace/dataspace.viva.js", import.meta.url).pathname,
];

const directory = await Deno.makeTempDir({ prefix: "boot-timing-bundle-" });
const bundler = paladin.bundler(directory);
const seen = [];
try {
  for (const pass of ["cold", "again"]) {
    for (const path of MODES) {
      const imported = performance.now();
      const module = await import(`file://${path}`);
      const loaded = performance.now() - imported;
      for (const view of module.views ?? []) {
        const started = performance.now();
        const built = await bundler.bundle({ mime: view.mime, entry: join(dirname(path), view.mount) });
        seen.push({
          pass,
          mode: path.split("/").slice(-2, -1)[0],
          view: view.slug,
          mime: view.mime.split(".").slice(-2).join("."),
          import: Math.round(loaded),
          bundle: Math.round(performance.now() - started),
          kilobytes: Math.round(built.entries[0].bytes / 1024),
        });
      }
    }
  }
  console.table(seen);
  for (const pass of ["cold", "again"])
    console.log(pass, seen.filter((held) => held.pass === pass).reduce((sum, held) => sum + held.bundle, 0), "ms");
} finally {
  await Deno.remove(directory, { recursive: true });
  Deno.exit(0);
}
