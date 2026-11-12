// limit: 1500 chars
import { atom } from "nanostores";
import { belt } from "@vivalence/ghost";

const view = (slug, entry, files) => ({ id: slug, slug, mime: "application/vnd.viva.tty.solid+javascript", entry, files, traits: ["FRAME"] });
const unbuilt = view("dojo", "bundle/dojo.tty.solid.mjs", []);
const built = view("play", "bundle/play.tty.solid.mjs", [{ id: "f", path: "bundle/play.tty.solid.mjs", mime: "text/javascript", integrity: "x" }]);
const pool = belt.view.candidates(atom([unbuilt, built]), atom([]));

const compiled = (held) => held.entry.endsWith(".mjs");
const compiledFirst = (left, right) => compiled(right) - compiled(left);
const pick = (views) => views.toSorted(compiledFirst)[0];

const today = { kept: pool.get().filter(belt.view.held).map((held) => held.slug), pick: null };
try {
  today.pick = belt.view.pick(pool.get()).slug;
} catch (error) {
  today.pick = `THROWS ${error.message.slice(0, 60)}`;
}
console.log(JSON.stringify({ today, after: { kept: pool.get().map((held) => held.slug), pick: pick(pool.get()).slug } }, null, 1));
