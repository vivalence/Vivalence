import { fromm } from "@vivalence/typology";

export const AGENTIC = (mode, context) => () => {
  fromm
    .modes(context.modes)
    .flat.filter(
      (source) =>
        source !== mode && source.manifest?.type !== "domain" && source.implements("TOOLING"),
    )
    .forEach((source) => mode.tools.branch(source.manifest.slug, source.tools));
};
