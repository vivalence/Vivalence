import { Vector, shard, shape } from "@vivalence/typology";

export const TOOLED = (mode, daemon) => {
  if (!mode.module.tools) return;

  const tools = new Vector();
  tools.use(shard.context.bind("daemon", daemon));
  tools.use(shard.context.bind("mode", mode));
  tools.slurp(mode.module.tools);

  mode.aperture.branch("/tool").slurp(tools);
  return () => {
    // mode.tool = shape.object(tools); // might need some context scoping cleverness
  };
};
