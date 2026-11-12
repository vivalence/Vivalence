import { join } from "@std/path";
import { specimen } from "@vivalence/typology";
import { board, IMPORT, MOUNT, part, viewed } from "../scenarios/viewed.js";

// m120 Q6B — a seeded walk in bombadil's shape (roadmap/bombadil-browser-properties.org): random moves over one
// declared view, four properties after every move; VIEW_SEED replays a failure, VIEW_STEPS lengthens the walk

const SEED = Number(Deno.env.get("VIEW_SEED") ?? 120);
const STEPS = Number(Deno.env.get("VIEW_STEPS") ?? 300);

const random = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let mixed = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
  return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
};

const served = async (world, model, response) => {
  model.builds += model.dirty ? 1 : 0;
  model.status = response.status;
  if (response.status === 304) return;
  model.text = await response.text();
  model.etag = response.headers.get("etag");
};

const open = async (world, model) => {
  await served(world, model, await world.open());
  model.dirty = false;
};

const openHolding = async (world, model) => {
  await served(world, model, await world.open(model.etag === null ? {} : { "if-none-match": model.etag }));
  model.dirty = false;
};

const editMount = async (world, model) => {
  model.edits.mount += "m";
  model.dirty = true;
  await world.edit(MOUNT, board(model.edits.mount));
};

const editImport = async (world, model) => {
  model.edits.part += "p";
  model.dirty = true;
  await world.edit(IMPORT, part(model.edits.part));
};

const restart = (world) => world.restart();

const removeArtifact = async (world, model) => {
  await Deno.remove(world.artifact).catch(absent);
  model.dirty = true;
};

const openTwice = async (world, model) => {
  const [left, right] = await Promise.all([world.open(), world.open()]);
  await served(world, model, left);
  expectSame(await right.text(), model.text, "two opens at once serve one text");
  model.dirty = false;
};

const MOVES = [open, openHolding, editMount, editImport, restart, removeArtifact, openTwice];

const absent = (error) => {
  if (error instanceof Deno.errors.NotFound) return [];
  throw error;
};

const expectSame = (actual, expected, property) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${property}: ${JSON.stringify(actual)} is not ${JSON.stringify(expected)}`);
};

const fingerprintHoldsWhileSourcesHold = async (world, model) => {
  if (model.dirty || model.etag === null) return;
  const held = await world.open({ "if-none-match": model.etag });
  await held.body?.cancel();
  expectSame(held.status, 304, "a held fingerprint answers 304 while no source changed");
};

const editIsEventuallyServed = (world, model) => {
  if (model.dirty || model.text === null) return;
  expectSame(model.text.includes(`board ${model.edits.mount}"`), true, "the mount's last edit is served");
  expectSame(model.text.includes(`part ${model.edits.part}"`), true, "the import's last edit is served");
};

const agreesWithModel = (world, model) => {
  expectSame(world.builds.length, model.builds, "a fetch builds exactly when a source changed since the last");
};

const oneArtifactPerView = async (world) => {
  const names = await Array.fromAsync(Deno.readDir(join(world.mode.mountpoint, "bundle"))).catch(absent);
  expectSame(names.map((entry) => entry.name).filter((name) => name !== "board.tty.solid.mjs"), [], "one artifact per view");
};

const PROPERTIES = [fingerprintHoldsWhileSourcesHold, editIsEventuallyServed, agreesWithModel, oneArtifactPerView];

specimen.describe("a seeded walk over one declared view — four properties hold after every move", { sanitizeResources: false, sanitizeOps: false }, () => {
  specimen.it(`seed ${SEED}, ${STEPS} moves`, async () => {
    const world = await viewed();
    const draw = random(SEED);
    const model = { edits: { mount: "", part: "" }, etag: null, text: null, status: null, dirty: true, builds: 0 };
    const walked = [];
    try {
      for (let step = 0; step < STEPS; step++) {
        const move = MOVES[Math.floor(draw() * MOVES.length)];
        walked.push(move.name);
        await move(world, model);
        for (const property of PROPERTIES) await property(world, model);
      }
    } catch (error) {
      throw new Error(`VIEW_SEED=${SEED} step ${walked.length}: ${walked.slice(-6).join(" → ")} — ${error.message}`);
    } finally {
      await world.close();
    }
    specimen.expect(new Set(walked)).toEqual(new Set(MOVES.map((move) => move.name)));
  });
});
