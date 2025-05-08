// import curriculum from "./curriculum/index.js";
import topology from "./topology/index.js";
// import session from "./curriculum/session.js";

const manifest = {
  type: "corpus",
  slug: "eng-to-lat",
  name: "English to Latin",
  version: "0.0.5",
  traits: ["TOPOLOGICAL", "DATASET"],
};

// async function install(runtime) {const user = await runtime.services.identity.getUser(); console.log("user", user); console.log("{...session, runtime: runtime.entity.id, user: user.id,}", {...session, runtime: runtime.entity.id, user: user.id,}); const creation = runtime.entities.session.create({...session, runtime: runtime.entity.id, user: user.id,}); await runtime.entities.em.flush(); console.log("runtime.entities.session", creation); return runtime;}

// function boot(runtime) {}

export { manifest, topology };
