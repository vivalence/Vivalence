export const TOOLING = (mode) => {
  if (!mode.module.tools) return;
  mode.tools.slurp(mode.module.tools);
};
