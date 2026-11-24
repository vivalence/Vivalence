import { AsyncLocalStorage } from "node:async_hooks";

const als = new AsyncLocalStorage();
const seen = [];
const server = Deno.serve({ port: 0, onListen() {} }, (request) => {
  seen.push(`${new URL(request.url).searchParams.get("phase")}: handler entry sees ${als.getStore()}`);
  return new Response("ok");
});
const curl = (phase) =>
  new Deno.Command("curl", {
    args: ["-s", "-m", "2", "-o", "/dev/null", `http://127.0.0.1:${server.addr.port}/?phase=${encodeURIComponent(phase)}`],
  }).spawn().status;
const fresh = async () => {
  const path = await Deno.makeTempFile({ suffix: ".js" });
  await Deno.writeTextFile(path, "export default [];");
  return path;
};
const [first, second] = [await fresh(), await fresh()];

try {
  await curl("1 before anything");
  await als.run("READ", () => Deno.readTextFile(first));
  await curl("2 after a scope that read a file");
  await als.run("INSTALL", () => import(first));
  await curl("3 after a scope that imported a module");
  await curl("4 again, later");
  await als.run("SECOND", () => import(second));
  await curl("5 after a second scope imported another module");
  await als.run("THIRD", () => import(first));
  await curl("6 after a third scope imported a loaded module");
  console.log(`deno ${Deno.version.deno}\n${seen.join("\n")}`);
} finally {
  await server.shutdown();
  await Deno.remove(first);
  await Deno.remove(second);
}
