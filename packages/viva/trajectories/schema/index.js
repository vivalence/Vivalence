import * as reset from "./reset.js";
import * as migrate from "./migrate.js";

export default async function (viva) {
  viva.trajectory
    .branch((p) => p.path("/schema"))
    .path(reset.match, reset.default)
    .path(migrate.match, migrate.default);
  return viva;
}
