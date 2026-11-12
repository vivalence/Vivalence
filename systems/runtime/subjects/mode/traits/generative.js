import paladin from "@vivalence/paladin";
import { Path } from "@vivalence/typology";
import { generative } from "../../../gestalten/tools/generative.js";

export const GENERATIVE = (mode, modeDie) => {
  const bundler = paladin.bundler(new Path(mode.mountpoint).absolute);

  mode.generator = {
    bundle: (data) => modeDie.entities.view.generate({ mode: mode.entity.id, ...data }, { bundler }),
  };
  mode.tools.graft(generative);
};
