import { Paladin, FULL, lifecycle } from "@vivalence/paladin/typology";
import { write } from "./belt/write.js";
import { remove } from "./belt/remove.js";

const root = await Deno.makeTempDir({ prefix: "belt-write-" });
const paladin = lifecycle.paladin.belt(new Paladin(), [...FULL, write, remove]);
const bytes = new TextEncoder().encode("bytes");
const body = () => new Blob(["dropped"]).stream();
const dropped = { path: "in/note.txt", mime: "text/plain" };
const out = {
  text: [await paladin.write.text(`${root}/a/one.txt`, "one"), await paladin.write.text(`${root}/a/one.txt`, "one")],
  bytes: [await paladin.write.bytes(`${root}/b.bin`, bytes), await paladin.write.bytes(`${root}/b.bin`, bytes)],
  json: await paladin.write.json(`${root}/c.json`, { c: 3 }),
  stream: await paladin.write.stream(root, dropped, body()),
  again: (await paladin.write.stream(root, dropped, body())).path,
};
await paladin.write.jsonl(`${root}/d.jsonl`, { d: 1 });
await paladin.write.jsonl(`${root}/d.jsonl`, { d: 2 });
(await paladin.write.open(`${root}/e.log`)).close();
await paladin.write.dir(`${root}/f`);
await paladin.remove.file(`${root}/c.json`);
await paladin.remove.file(`${root}/never.json`);
console.log(out);
console.log((await paladin.find.index(root)).map((file) => file.path));
await Deno.remove(root, { recursive: true });
