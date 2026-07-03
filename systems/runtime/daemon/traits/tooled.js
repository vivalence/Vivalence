import { Vector, shard, shape } from "@vivalence/typology";

export const TOOLED = (mode, daemon) => {
  if (!mode.module.tools) return;

  const tools = new Vector();
  tools.use(shard.context.bind("daemon", daemon));
  tools.use(shard.context.bind("mode", mode));
  tools.slurp(mode.module.tools);

  daemon.cortex.tools.branch(mode.slug).slurp(tools); // @beef global tool registry?! desired? i think not. i prefer explicit mode-level handling on all tools other than the modes own.

  mode.aperture.branch("/tool").slurp(tools);
  return () => {
    // mode.tool = shape.object(tools); // might need some context scoping cleverness
  };
};
