import curriculum from "./curriculum/index.js";
import topology from "./topology/index.js";
// import session from "./curriculum/session.js";

const manifest = {
  type: "corpus",
  slug: "cefr-eng-to-esp",
  name: "CEFR - English to Spanish",
  version: "0.0.5",
  traits: ["TOPOLOGICAL", "CURRICULAR", "DATASET"],
};

// async function install(runtime) {const user = await runtime.services.identity.getUser(); console.log("user", user); console.log("{...session, runtime: runtime.entity.id, user: user.id,}", {...session, runtime: runtime.entity.id, user: user.id,}); const creation = runtime.entities.session.create({...session, runtime: runtime.entity.id, user: user.id,}); await runtime.entities.em.flush(); console.log("runtime.entities.session", creation); return runtime;}

// const boot = async (runtime) => {
//   console.log(Object.keys(runtime));
//   console.log(runtime.ontology);
//   // console.log(JSON.stringify(runtime.));
//   return runtime;
// };

export { manifest, curriculum, topology };
