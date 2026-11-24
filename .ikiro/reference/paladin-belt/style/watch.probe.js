import { Paladin, FULL, lifecycle } from "@vivalence/paladin/typology";
import { watch } from "./belt/watch.js";

const root = await Deno.realPath(await Deno.makeTempDir({ prefix: "belt-watch-" }));
await Deno.writeTextFile(`${root}/one.txt`, "1");
await Deno.writeTextFile(`${root}/two.txt`, "1");
const paladin = lifecycle.paladin.belt(new Paladin(), [...FULL, watch]);
const heard = { directory: [], files: [] };
const names = (paths) => paths.map((path) => path.slice(root.length + 1)).sort();
const stops = [
  paladin.watch.directory(root, (paths) => heard.directory.push(names(paths))),
  paladin.watch.files([`${root}/one.txt`], (paths) => heard.files.push(names(paths))),
];
await new Promise((done) => setTimeout(done, 300));
await Deno.writeTextFile(`${root}/one.txt`, "2");
await Deno.writeTextFile(`${root}/two.txt`, "2");
await new Promise((done) => setTimeout(done, 900));
for (const stop of stops) stop();
console.log(heard);
await Deno.remove(root, { recursive: true });
