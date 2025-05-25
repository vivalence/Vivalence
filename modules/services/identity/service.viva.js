import client from "./client/mod.js";
// import service from "./service/mod.js";

const manifest = {
  type: "service",
  slug: "identity",
  name: "Identity service. Provides user authentication, authorization and licencing. Works by - Entitlements to services, traits, strategies, and resources.",
};

async function boot(host) {
  host.trajectory.open(
    (p) => p.sig("/create"),
    () => {
      console.log("created identity service");
    },
  );
}

export { manifest, boot, client };
