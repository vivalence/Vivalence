import all from "./all.js";
import compute from "./compute.js";

export default async function (aperture) {
  aperture.router.route("/dependencies", all);
  aperture.router.route("/dependencies/compute", compute);
  return aperture;
}
