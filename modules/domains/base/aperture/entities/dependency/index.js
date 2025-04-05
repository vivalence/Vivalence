import install from "./install.js";
import remove from "./remove.js";
import compute from "./compute.js";
// import all from "./all.js";
// import compute from "./compute.js";
// import onRequest from "./lib/middlewares/onRequest.js";
//
export default { install, remove, compute };
// export default function (runtime) {
//   // runtime.aperture.open("/", (i, ctx) => ctx.state.dependency);
//   // aperture.router.route("/dependencies", all);

//   // aperture.router.route("/instruction/feed", feed);
//   // aperture.router.route("/instruction/provision", provision);

//   // aperture.router.route("/compute", compute);

//   aperture.router.use("/dependency/:slug", onRequest, router.routes(), router.allowedMethods());
//   return aperture;
// }
