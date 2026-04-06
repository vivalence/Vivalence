import { outside, inside } from "./vectors.js";
import { project } from "./project.js";
import { createDataspace, createTerminal, createPincer } from "./backend.js";

function banner(title) {
  console.log("\n" + "=".repeat(70));
  console.log(title);
  console.log("=".repeat(70));
}

function snapshot(tag, terminal, pincer) {
  console.log(`[${tag}]  phase=${pincer.dPhase}  terminal=${terminal.toString()}`);
}

function renderTree(tree, depth = 0) {
  const pad = "  ".repeat(depth);
  const carets = tree.kids?.length ? (depth === 0 ? "▾" : "▸") : "·";
  const mark = tree.onClick ? " [click]" : "";
  console.log(`${pad}${carets} ${tree.name}${mark}`);
  for (const kid of tree.kids ?? []) renderTree(kid, depth + 1);
}

function findByPath(rows, path) {
  let cursor = { kids: rows };
  for (const name of path) {
    const hit = cursor.kids?.find((k) => k.name === name);
    if (!hit) throw new Error(`path ${path.join("/")} — segment '${name}' not found`);
    cursor = hit;
  }
  return cursor;
}

function click(rows, path, label) {
  const row = findByPath(rows, path);
  if (!row.onClick) throw new Error(`row ${path.join("/")} has no onClick`);
  console.log(`> click ${label}: ${path.join(" / ")}`);
  row.onClick();
}

function render(ctx, vector) {
  return project(vector, ctx);
}

function runScenario1() {
  banner("SCENARIO 1 — empty terminal, mount viva/flashcard/feed via outside tree");

  const dataspace = createDataspace();
  const terminal  = createTerminal();
  const pincer    = createPincer();
  const ctx = { dataspace, terminal, pincer };

  snapshot("init", terminal, pincer);

  let rows = render(ctx, outside);
  console.log("\n-- projected outside tree --");
  renderTree({ name: "outside", kids: rows });

  click(rows, ["daemons", "vivalence", "Flashcard", "feed"], "leaf /:intent");

  snapshot("post-click", terminal, pincer);

  rows = render(ctx, pincer.dPhase === "inside" ? inside : outside);
  console.log("\n-- projected inside tree --");
  renderTree({ name: `inside ${terminal.toString()}`, kids: rows });

  return { ctx, terminal, pincer };
}

function runScenario2(state) {
  banner("SCENARIO 2 — switch mount point from viva/flashcard/feed to cortex/dewey/chat");

  const { ctx, terminal, pincer } = state;

  snapshot("init", terminal, pincer);

  let rows = render(ctx, inside);
  console.log("\n-- projected inside tree --");
  renderTree({ name: `inside ${terminal.toString()}`, kids: rows });

  click(rows, ["unmount mode"], "unmount mode+intent");
  snapshot("after unmount-mode", terminal, pincer);

  click(rows, ["unmount daemon"], "unmount daemon");
  snapshot("after unmount-daemon", terminal, pincer);

  rows = render(ctx, outside);
  console.log("\n-- projected outside tree --");
  renderTree({ name: "outside", kids: rows });

  click(rows, ["daemons", "cortex", "Dewey", "chat"], "mount cortex/dewey/chat");
  snapshot("after mount cortex", terminal, pincer);

  rows = render(ctx, inside);
  console.log("\n-- projected inside tree --");
  renderTree({ name: `inside ${terminal.toString()}`, kids: rows });
}

function main() {
  const state = runScenario1();
  runScenario2(state);
  banner("DONE");
}

main();
