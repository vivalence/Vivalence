import { spawn } from "../../lifecycle/boot.js";
// import { OSProcessClient } from "./repository.js";
// import { ProcessEntity } from "./entity.js";
// const os = new OSProcessClient();

async function start(manifest, config) {
  return await spawn(manifest, config);
}

export default {
  start,
  //   kill: (slugOrPid) => manager.kill(slugOrPid),
  //   watch: (callback) => manager.watch(callback),
};

// async function kill(slugOrPid) {
//   const entity =
//     typeof slugOrPid === "string"
//       ? this.processes.get(slugOrPid)
//       : Array.from(this.processes.values()).find((p) => p.pid === slugOrPid);

//   if (entity) {
//     await entity.kill();
//     this.processes.delete(entity.manifest.slug);
//   }
// }

// async function watch(callback) {
//   return setInterval(async () => {
//     const processes = await this.list();
//     callback(processes);
//   }, 1000);
// }

// import { ProcessEntity, OSProcessClient } from "./prototypes.js";

// const os = new OSProcessClient();

// export default {
//   ensure: async (manifest, config) => {
//     // console.log({ config, manifest });

//     let entity = null;
//     // let entity = await os.find({ slug: manifest.slug });

//     // if (!entity.isHealthy()) {
//     //   await entity.kill();
//     //   entity = null;
//     //   console.log('priori incantatem morbidi')
//     // }

//     // if(entity){
//     //   console.log('existing process discovered; attaching.')
//     // }

//     // if (!entity) {
//     entity = await os.spawn(manifest, {
//       ...config,
//       env: {
//         ...config.env,
//         VIVA_PROCESS_SLUG: manifest.slug,
//       },
//     });
//     console.log({ entity });
//     // }

//     // return entity;
//   },

//   // kill
//   // observe: // some way to facilitate process ownership
// };
