import { join } from "@std/path";
import paladin from "@vivalence/paladin";
import { Aperture, mime, Mode, Path, shape, shard, Vector } from "@vivalence/typology";
import { traits } from "@vivalence/runtime";
import { attachment } from "../../subjects/runtime/attachment.js";
import { seed } from "./datamap.js";

// m120 — one declared tty view over a seeded :memory: datamap, served through the real /attached Vector;
// the mount imports a sibling, so an edit to either is a source edit; esbuild bundles plain .js, no babel

export const MOUNT = "views/board.js";
export const IMPORT = "views/part.js";

export const board = (edit) => `import { part } from "./part.js";\nexport default () => "board ${edit}" + part;\n`;
export const part = (edit) => `export const part = " part ${edit}";\n`;

export async function viewed() {
  const scenario = await seed();
  const directory = await Deno.makeTempDir({ prefix: "viewed-" });
  await Deno.mkdir(join(directory, "board", "views"), { recursive: true });
  await Deno.writeTextFile(join(directory, "board", MOUNT), board(""));
  await Deno.writeTextFile(join(directory, "board", IMPORT), part(""));

  const mode = new Mode({
    manifest: { type: "test", slug: "board", traits: [] },
    source: { dirname: join(directory, "board") },
    views: [{ slug: "board", mime: mime.tty.solid, mount: MOUNT }],
  });
  mode.aperture = new Aperture();
  mode.entity = scenario.fixtures.mode;
  mode.mountpoint = join(directory, "board", "mountpoint");
  await traits.mode.VIEWABLE(mode, { entities: scenario.repos, reference: new Path("/daemon/test") });

  const runtime = { entities: scenario.repos, modes: { test: { board: mode } }, daemons: {} };
  const attached = new Vector().use(shard.context.bind("runtime", runtime)).graft(attachment);
  const aperture = new Aperture();
  aperture.branch("/attached", attached);
  const handler = shape.http(aperture);

  const builds = [];
  const bundler = paladin.bundler;
  paladin.bundler = Object.assign((...held) => {
    const made = bundler(...held);
    return {
      ...made,
      bundle: (input) => {
        builds.push(input.name);
        return made.bundle(input);
      },
    };
  }, bundler);

  const view = mode.views[0];
  return {
    scenario,
    directory,
    mode,
    view,
    builds,
    artifact: join(mode.mountpoint, view.entry),
    open: (headers = {}) => handler(new Request(`http://internal/attached/view/${view.id}`, { headers })),
    edit: (path, text) => Deno.writeTextFile(join(directory, "board", path), text),
    restart: () => scenario.repos.view.em.clear(),
    async close() {
      paladin.bundler = bundler;
      await scenario.orm.close();
      await Deno.remove(directory, { recursive: true });
    },
  };
}
