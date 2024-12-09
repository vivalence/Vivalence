import onRequest from "./lib/middlewares/onRequest.js";

export default async function dependency(aperture) {
  const router = aperture.router.create();

  router.route("/", (i, ctx) => ctx.state.dependency);

  aperture.router.use("/dependency/:slug", onRequest, router.routes(), router.allowedMethods());
  return aperture;
}
