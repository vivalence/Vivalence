import remove from "./remove.js";

export default async function (aperture) {
  aperture.router.route("/instruction/remove", remove);
  return aperture;
}
