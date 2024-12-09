import remove from "./remove.js";
import dependency from "./dependency.js";

export default async function (aperture) {
  aperture.router.route("/instructions/dependency/feed", dependency);
  aperture.router.route("/instructions/remove", remove);
  return aperture;
}
