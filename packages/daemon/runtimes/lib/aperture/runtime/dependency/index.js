import all from "./all.js";
import compute from "./compute.js";
import onRequest from "./lib/middlewares/onRequest.js";
//
export default async function dependency(aperture) {
  const router = aperture.router.create();

  router.route("/", (i, ctx) => ctx.state.dependency);
  // aperture.router.route("/dependencies", all);

  // aperture.router.route("/instruction/feed", feed);
  // aperture.router.route("/instruction/provision", provision);

  aperture.router.route("/compute", compute);

  aperture.router.use("/dependency/:slug", onRequest, router.routes(), router.allowedMethods());
  return aperture;
}
