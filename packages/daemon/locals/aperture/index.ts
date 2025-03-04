import Aperture from "./aperture.ts";
import Path from "./path.ts";
import { ApertureOptions } from "./types.ts";

export { Aperture, Path };

export function create(options: ApertureOptions = {}) {
  const path = options.path ? new Path(options.path) : new Path();
  return new Aperture(path);
}

export default { create };
