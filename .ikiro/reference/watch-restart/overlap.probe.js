// the restart loop of systems/runtime/watch.js:33-52, verbatim, over a stub child that
// binds a port and takes SLOW ms to leave on SIGTERM. events come from a timer, not watchFs.
const [slow, gap] = Deno.args.map(Number);
const port = 20000 + Math.floor(Math.random() * 20000);
const stub = `
  try { Deno.serve({ port: ${port}, onListen: () => console.log("  child listens", Deno.pid) }, () => new Response("")); }
  catch (fault) { console.log("  child dies", Deno.pid, fault.name); Deno.exit(1); }
  Deno.addSignalListener("SIGTERM", () => setTimeout(() => Deno.exit(0), ${slow}));
`;
const boot = () => new Deno.Command(Deno.execPath(), { args: ["eval", stub] }).spawn();

let runtime = boot();
let settling = null;
const saved = (path) => {
  clearTimeout(settling);
  settling = setTimeout(async () => {
    console.log(`Watcher Restarting! ${path} · kills ${runtime.pid}`);
    runtime.kill("SIGTERM");
    await runtime.status;
    runtime = boot();
  }, 200);
};

await new Promise((r) => setTimeout(r, 800));
for (const path of ["a.snapshot.json", "b.snapshot.json", "c.snapshot.json"]) {
  saved(path);
  await new Promise((r) => setTimeout(r, gap));
}
await new Promise((r) => setTimeout(r, 1500));
console.log("watcher alive, kills", runtime.pid);
runtime.kill("SIGKILL");
Deno.exit(0);
