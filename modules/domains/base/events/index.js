let lastCall = null;

function boot(runtime) {
  runtime.emitter.on("MemoryStatusChange", async (input, ctx) => {
    if (lastCall && new Date() - lastCall < 60 * 1000) return;
    lastCall = new Date();

    // Brute force tralala
    // const { data: dependencies } = await ctx.runtime.services.supabase .from("Dependency") .select("id");
    // const computed = await Promise.all(dependencies.map((dependency) => ctx.runtime.call("/dependencies/compute", { dependency })),);
  });
}

export default { boot };

// runtime.bus.emit("MemoryStatusChange", {id: "24c4e97f-fdde-41a1-ad3b-f0530d7c7b26", state: true, status: "GRADUATED", nextIn: "9999999", nextAt: "3165-09-20T15:00:52.198Z", lastAt: "2024-12-04T00:00:52.196Z", flavor: "INDIVIDUAL", type: "BOOLEAN", statusChange: { from: null, to: "GRADUATED" },});
// input {
//   "id": "e27b88ee-7c63-4902-825a-b415262a9875",
//   "state": true,
//   "status": "GRADUATED",
//   "nextIn": 9999999,
//   "nextAt": "3165-09-20T14:53:02.715Z",
//   "lastAt": "2024-12-03T23:53:02.708Z",
//   "flavor": "INDIVIDUAL",
//   "type": "BOOLEAN",
//   "history": [{
//       "signal": "NEUTRAL",
//       "state": true,
//       "nextIn": 9999999,
//       "nextAt": "3165-09-20T14:53:02.715Z",
//       "lastAt": "2024-12-03T23:53:02.708Z",
//       "scope": {
//         "dependency": {"id": "34de578b-985b-44f1-81a0-6d2ca43ea72c"},
//         "tactic": {"id": "71c4ed7d-1a4a-4017-a794-01267d601e4b"},
//         "user": {"id": "localhost"},
//         "game": {"id": "636a8a9f-ba24-4500-be91-6bc21119f5b1"},
//         "tags": [{"id": "0e8dacef-796e-4dcd-994d-3142c512d0f6"}],
//         "tag": {"id": "0e8dacef-796e-4dcd-994d-3142c512d0f6"}
//       },
//       "status": "GRADUATED"
//     }
//   ],
//   "statusChange": {
//     "from": null,
//     "to": "GRADUATED"
//   }
// }
