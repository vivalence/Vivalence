import client from "./client/brainClient.js";

const manifest = {
  type: "service",
  slug: "brain",
  name: "Brain AI",
  description:
    "It's Artificial Intelligence in the investor pitch, Machine Learning in the job description, and linear algebra when you implement it.",
};

async function boot(host) {
  host.trajectory.open(
    (p) => p.sig("/create"),
    () => {
      console.log("created ai service");
    },
  );
}

export { manifest, boot, client };
