import { join } from "@std/path";
import paladin from "@vivalence/paladin";
import { Aperture, mime, Mode, Path, shape, shard, Vector } from "@vivalence/typology";
import { traits } from "@vivalence/runtime";
import { attachment } from "../../subjects/runtime/attachment.js";
import { seed } from "./datamap.js";

// m120 — one declared tty view over a seeded :memory: datamap, served through the real /attached Vector;
// the mount imports a sibling, so an edit to either is a source edit; esbuild bundles plain .js, no babel

export const MOUNT = "surfaces/board.js";
export const IMPORT = "surfaces/part.js";

export const board = (edit) => `import { part } from "./part.js";\nexport default () => "board ${edit}" + part;\n`;
export const part = (edit) => `export const part = " part ${edit}";\n`;

export async function surfaced() {
  const scenario = await seed();
  const directory = await Deno.makeTempDir({ prefix: "viewed-" });
  await Deno.mkdir(join(directory, "board", "surfaces"), { recursive: true });
  await Deno.writeTextFile(join(directory, "board", MOUNT), board(""));
  await Deno.writeTextFile(join(directory, "board", IMPORT), part(""));

  const mode = new Mode({ module: {
    manifest: { type: "test", slug: "board", traits: [] },
    source: { dirname: join(directory, "board") },
    surfaces: [{ slug: "board", mime: mime.tty.solid, mount: MOUNT }],
  } });
  mode.aperture = new Aperture();
  mode.entity = scenario.fixtures.mode;
  mode.mountpoint = join(directory, "board", "mountpoint");
  await traits.mode.SURFACED(mode, { entities: scenario.repos, reference: new Path("/daemon/test") });

  const runtime = { entities: scenario.repos, modes: { test: { board: mode } }, daemons: {} };
  const attached = new Vector().use(shard.context.bind("runtime", runtime)).graft(attachment);
  const aperture = new Aperture();
  aperture.branch("/attached", attached);
  const handler = shape.http(aperture);

  const builds = [];
  const unwatched = paladin.bundle.directory;
  paladin.bundle.directory = (...held) => {
    const made = unwatched(...held);
    return {
      ...made,
      bundle: (input) => {
        builds.push(input.name);
        return made.bundle(input);
      },
    };
  };

  const surface = mode.surfaces[0];
  return {
    scenario,
    directory,
    mode,
    surface,
    builds,
    artifact: join(mode.mountpoint, surface.entry),
    open: (headers = {}) => handler(new Request(`http://internal/attached/surface/${surface.id}`, { headers })),
    edit: (path, text) => Deno.writeTextFile(join(directory, "board", path), text),
    restart: () => scenario.repos.surface.em.clear(),
    async close() {
      paladin.bundle.directory = unwatched;
      await scenario.orm.close();
      await Deno.remove(directory, { recursive: true });
    },
  };
}
