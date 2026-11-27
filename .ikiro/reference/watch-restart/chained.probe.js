// the proposed loop for systems/runtime/watch.js over the same stub child. DIES=1: the child
// leaves by itself after 300 ms, as a boot fault does.
const [slow, gap, dies] = Deno.args.map(Number);
const port = 20000 + Math.floor(Math.random() * 20000);
const stub = `
  try { Deno.serve({ port: ${port}, onListen: () => console.log("  child listens", Deno.pid) }, () => new Response("")); }
  catch (fault) { console.log("  child dies", Deno.pid, fault.name); Deno.exit(1); }
  Deno.addSignalListener("SIGTERM", () => setTimeout(() => Deno.exit(0), ${slow}));
  if (${dies}) setTimeout(() => Deno.exit(1), 300);
`;
const spawn = () => new Deno.Command(Deno.execPath(), { args: ["eval", stub] }).spawn();

const boot = () => {
  const runtime = { process: spawn(), left: false };
  runtime.process.status.then((status) => {
    runtime.left = true;
    console.log(`runtime left · code ${status.code}`);
  });
  return runtime;
};

let runtime = boot();
let settling = null;
let restarted = Promise.resolve();

const saved = (path) => {
  clearTimeout(settling);
  settling = setTimeout(() => {
    restarted = restarted.then(async () => {
      console.log(`Watcher Restarting! File change detected: ${JSON.stringify(path)}`);
      if (!runtime.left) runtime.process.kill("SIGTERM");
      await runtime.process.status;
      runtime = boot();
    });
  }, 200);
};

await new Promise((r) => setTimeout(r, 800));
for (const path of ["a.snapshot.json", "b.snapshot.json", "c.snapshot.json"]) {
  saved(path);
  await new Promise((r) => setTimeout(r, gap));
}
await new Promise((r) => setTimeout(r, 2500));
await restarted;
console.log("watcher alive");
if (!runtime.left) runtime.process.kill("SIGKILL");
Deno.exit(0);
