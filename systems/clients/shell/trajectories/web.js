import config from "@vivalence/config";
// client.trajectory .branch("system") .open("up", async (ctx) => {return { status: "up" };}) .open("test", async (ctx) => {const up = await ctx.call("/system/up"); return { up, output: "lorem" };});
// await services({
//   ...client,
//   trajectory: client.trajectory.branch("/services"),
// });

// **File 2: `trajectories/control.js`**
// ```js
// import process from '../locals/process/process.js';

// export default (client, name, cmd) => {

//   return control;
// };
// ```

//   control.open('/up', () => process.spawn(name, cmd));
//   control.open('/down', () => process.kill(name));
