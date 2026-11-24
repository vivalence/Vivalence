// limit: 1500 chars
import * as esbuild from "esbuild";

const HOME = Deno.env.get("HOME");
const entry = `${HOME}/.viva/registry/education/modes/games/dojo/buffer/dojo.jsx`;
const built = await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  format: "esm",
  platform: "neutral",
  packages: "external",
  write: false,
  metafile: true,
  loader: { ".jsx": "jsx" },
  jsx: "preserve",
  absWorkingDir: "/",
  logLevel: "silent",
});
await esbuild.stop();
const paths = Object.keys(built.metafile.inputs).map((path) => `/${path}`);
const stamp = async (path) => {
  const held = await Deno.stat(path);
  return { path, bytes: held.size, mtime: held.mtime.getTime() };
};
const started = performance.now();
const inputs = await Promise.all(paths.map(stamp));
const spent = performance.now() - started;
console.log(JSON.stringify({ inputs: inputs.length, statMs: Number(spent.toFixed(2)), first: inputs.slice(0, 3) }, null, 2));
Deno.exit(0);
