import paladin from "@vivalence/paladin";
import { bundle, outfile } from "./chrome/bundle.js";
import { runs } from "./chrome/widgets/buffer/renderers.js";

export const chrome = {
  bundle,
  runs,
  mount: async (appDie) => {
    if (!paladin.is.tty) throw new Error("chrome needs a terminal — run it in one");
    const app = await import(outfile);
    return app.mount(appDie);
  },
};
