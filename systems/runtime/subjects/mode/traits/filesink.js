import { join } from "@std/path";
import paladin from "@vivalence/paladin";
import { mime, Path, v } from "@vivalence/typology";

export const FILESINK = (mode, context) => {
  mode.aperture.open(
    {
      nature: "/files/receive",
      input: v.object({
        path: v.string().desc('The file\'s path inside the mode, one row per (mode, path). Example: "maps/range.png"'),
        bytes: v.unknown().desc("The bytes, a Uint8Array. Example: new TextEncoder().encode('# Q3')"),
        mime: mime.type().optional().desc('What the bytes are; read off the extension when left out. Example: "image/png"'),
      }),
    },
    async (ctx) => {
      const mount = join(new Path(mode.mountpoint).absolute, ctx.input.path);
      await paladin.state.store(mount, ctx.input.bytes);
      return context.entities.file.record({
        mode: mode.entity.id,
        path: ctx.input.path,
        mount,
        mime: ctx.input.mime ?? mime.of(ctx.input.path),
        bytes: ctx.input.bytes,
      });
    },
  );
};
