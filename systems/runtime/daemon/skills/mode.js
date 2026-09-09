import { v, Vector } from "@vivalence/typology";

// a mode's places on disk: its source, what it serves (the mountpoint), what it carries (freight) when
// that is somewhere else. Empty for a mode with none — a scenario mode, a kernel entry without a file.
export const places = (mode) =>
  [
    mode.module?.mount?.dirname && `source ${mode.module.mount.dirname}`,
    mode.mountpoint?.absolute && `mountpoint ${mode.mountpoint.absolute}`,
    mode.freight?.path?.absolute && mode.freight.path.absolute !== mode.mountpoint?.absolute &&
    `freight ${mode.freight.path.absolute}`,
  ].filter(Boolean).join(" · ");

const line = (mode) => {
  const placed = places(mode);
  return `${mode.manifest.type}/${mode.manifest.slug} · ${mode.manifest.name ?? mode.manifest.slug} · ` +
    `traits ${(mode.manifest.traits ?? []).join(" ") || "none"}${placed ? ` · ${placed}` : ""}`;
};

export const mode = new Vector().open(
  {
    nature: "/mode/find",
    valence: "Every mode of this daemon with its places on disk — source, mountpoint, freight — as rows: " +
      "the absolute paths fs_* and shell_run take. The first row is the daemon and its mountpoint. Narrow " +
      'by type or slug. Returns { message }. Example: { type: "office" }',
    input: v.object({
      type: v.string().optional().desc('A mode type. Example: "office"'),
      slug: v.string().optional().desc('A mode slug. Example: "vdex"'),
    }),
  },
  (ctx) => ({
    output: {
      message: [
        `[Daemon ${ctx.daemon.manifest.slug}]` +
        (ctx.daemon.mountpoint ? ` · mountpoint ${ctx.daemon.mountpoint.absolute}` : ""),
        ...ctx.daemon
          .flatmodes()
          .filter((mode) =>
            (!ctx.input.type || mode.manifest.type === ctx.input.type) &&
            (!ctx.input.slug || mode.manifest.slug === ctx.input.slug)
          )
          .map(line),
      ].join("\n"),
    },
  }),
);
