import client from "./client/index.js";

const manifest = {
  type: "service",
  slug: "llm",
  name: "LLM",
};

async function boot(host) {
  host.trajectory.path("/create", () => {
    console.log("created llm service");
  });
}

export { manifest, boot, client };
