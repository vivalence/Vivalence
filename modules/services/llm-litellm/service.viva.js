import client from "./client/index.js";

const manifest = {
  type: "service",
  slug: "llm-litellm",
  name: "LLM",
};

async function boot(host) {
  host.trajectory.path("/create", () => {
    console.log("created llm service");
  });
}

export { manifest, boot, client };
