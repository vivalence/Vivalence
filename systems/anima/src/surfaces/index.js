import { mount } from "./chrome/mount.jsx";
import { runs } from "./chrome/widgets/buffer/view.js";

export const chrome = {
  bundle: async () => ({ outfile: import.meta.url, bytes: 0 }),
  runs,
  mount,
};
