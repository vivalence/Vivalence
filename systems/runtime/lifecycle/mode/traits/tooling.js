export const TOOLING = (mode) => {
  if (!mode.module.tools) return;
  mode.tools.graft(mode.module.tools);
};
