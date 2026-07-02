import client from "./client.js";

const manifest = {
  type: "lighthouse",
  slug: "localhost",
  name: "Identity service for local-only instances.",
  traits: ["IDENTITY"],
};

// async function boot(host) {host.trajectory.open((p) => p.sig("/create"), () => {console.log("created identity service");},);}

export { manifest, client }; // boot,
