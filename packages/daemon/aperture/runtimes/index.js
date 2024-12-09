import available from "./available.js";

export default async function (aperture) {
  aperture.router.route("/runtimes/available", available);
  return aperture;
}
