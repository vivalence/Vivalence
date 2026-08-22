export const AGENTIC = (mode, daemon) => () => {
  daemon
    .flatmodes()
    .filter((source) =>
      source !== mode && source.manifest?.type !== "domain" && source.implements("TOOLED")
    )
    .forEach((source) => mode.tools.branch(source.slug).slurp(source.tools));
};
