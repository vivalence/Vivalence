import paladin from "@vivalence/paladin";
import { Path } from "@vivalence/typology";
import { surfacing } from "../../../gestalten/tools/surfacing.js";

export const SURFACING = (mode, modeDie) => {
  const bundler = paladin.bundler(new Path(mode.mountpoint).absolute);

  mode.surface = {
    bundle: (data) => modeDie.entities.surface.generate({ mode: mode.entity.id, ...data }, { bundler }),
  };
  mode.tools.graft(surfacing);
};
