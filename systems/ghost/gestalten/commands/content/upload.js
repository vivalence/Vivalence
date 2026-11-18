import { basename } from "@std/path";
import paladin from "@vivalence/paladin";
import { Vector, is, mime, v } from "@vivalence/typology";
import * as belt from "../../belt/index.js";

const UPLOAD = {
  nature: "/file/upload",
  rank: "hidden",
  valence:
    "files go up, each answering its bytes landed, then its File; a flag names what holds them, none leaves them loose; no file opens the prompt. " +
    "Example: /file/upload /tmp/cat.png --thread=01a1fb69",
};

const DROPPED = [
  [
    (datum) => datum instanceof File,
    (datum) => ({ path: datum.name, mime: datum.type, body: datum.stream() }),
  ],
  [
    (datum) => is.string(datum),
    async (datum) => ({
      path: basename(datum),
      mime: mime.of(datum),
      body: new Blob([await paladin.read.bytes(datum)]).stream(),
    }),
  ],
];

const dropped = (datum) => {
  const found = DROPPED.find(([carries]) => carries(datum));
  if (!found) throw new Error(`/file/upload takes a file or a path, got: ${JSON.stringify(datum)}`);
  return found[1](datum);
};

const Named = v.object({
  name: v.string().desc('The waiting upload\'s file name, the rest of the line. Example: "notes.md"'),
});

export const upload = new Vector()
  .open(UPLOAD, async (ctx) => {
    if (ctx.signal.body.length === 0)
      return ctx.terminal.repl.narrow({ ...UPLOAD, options: [] }, ctx.signal.argv.slice(1));
    return (async function* () {
      for (const datum of ctx.signal.body)
        yield* ctx.runtime.entities.file.upload({ ...(await dropped(datum)), ...ctx.signal.flags });
    })();
  })
  .open(
    {
      nature: "/upload/trash",
      rank: "hidden",
      valence:
        "a waiting upload leaves the draft; its file stays where it landed. Example: /upload/trash notes.md",
      input: Named,
    },
    (ctx) => {
      const { name } = belt.input.cast(Named, belt.input.lined(ctx.signal));
      ctx.client.app.bridge.$uploads.set(
        ctx.client.app.bridge.uploads.filter((upload) => upload.name !== name),
      );
    },
  );
