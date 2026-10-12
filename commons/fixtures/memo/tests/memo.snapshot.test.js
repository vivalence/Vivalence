import "@vivalence/sheets/host";
import paladin from "@vivalence/paladin";
import { specimen, mime } from "@vivalence/typology";
import { tokens } from "@vivalence/dapper";
import { testRender } from "@opentui/solid";
import { atom } from "nanostores";
import { join } from "@std/path";
import { entities } from "../dataset/entities/index.js";
import sm2 from "../domain/retention/sm2.js";
import { card } from "../domain/card.js";

const { describe, it, expect } = specimen;

const SNAPSHOTS = new URL("./snapshots", import.meta.url).pathname;
const HOT = Deno.env.get("SNAPSHOT_HOT") === "1";

function pin(subject, file) {
  const pojo = JSON.parse(JSON.stringify(subject));
  if (HOT) {
    Deno.mkdirSync(SNAPSHOTS, { recursive: true });
    specimen.snapshot(pojo, { base: SNAPSHOTS, locate: file, parse: (value) => value });
  }
  expect(pojo).toEqual(JSON.parse(Deno.readTextFileSync(join(SNAPSHOTS, file))));
  return pojo;
}

const seeded = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let mixed = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
  return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
};

const TICKETS = [["AGAIN", 3], ["HARD", 3], ["GOOD", 11], ["EASY", 3]].flatMap(([signal, weight]) => Array(weight).fill(signal));
const draw = (random) => TICKETS[Math.floor(random() * TICKETS.length)];
const rounded = (value) => Math.round(value * 1e6) / 1e6;
const horizons = (preview) => Object.fromEntries(Object.entries(preview).map(([signal, hours]) => [signal, rounded(hours)]));

const replay = (seed, learners, reviews) => {
  const random = seeded(seed);
  return Array.from({ length: learners }, () => {
    let held = null;
    return Array.from({ length: reviews }, () => {
      const signal = draw(random);
      held = held === null ? sm2.encode({ enum: signal }) : sm2.evolve({ enum: signal }, held);
      const { state } = held;
      return {
        signal,
        status: held.status,
        phase: state.phase,
        step: state.step,
        ease: rounded(state.ease),
        interval: state.interval,
        reps: state.reps,
        lapses: state.lapses,
        nextIn: rounded(held.nextIn),
        strength: rounded(sm2.strength(held)),
        preview: horizons(sm2.preview(state)),
      };
    });
  });
};

const LANGUAGE = { known: "English", learning: "Latin" };
const DUE = "2026-10-12T00:00:00.000Z";
const noted = (notes) => ({ getItems: () => notes });
const row = (slug, notes = []) => ({ ...entities.literal.find((held) => held.slug === slug), ontology: slug.includes(".") ? "word" : "sentence", notes: noted(notes) });
const retained = (signals) => {
  const result = signals.slice(1).reduce((held, signal) => sm2.evolve({ enum: signal }, held), sm2.encode({ enum: signals[0] }));
  return { traits: ["RETAINED"], trait: { RETAINED: { driver: "SM2", status: result.status, due: DUE, state: result.state } } };
};
const SUSPENDED = { traits: ["SUSPENDED"], trait: { SUSPENDED: { at: 0, reason: "leech" } } };

const HISTORIES = {
  untouched: [],
  learning: [retained(["GOOD"])],
  known: [retained(["GOOD", "GOOD"])],
  graduated: [retained(["EASY", "EASY", "EASY", "GOOD"])],
  relearning: [retained(["GOOD", "GOOD", "GOOD", "AGAIN"])],
  suspended: [retained(["GOOD", "GOOD", "GOOD", "AGAIN"]), SUSPENDED],
};

describe("memo · the dataset, pinned whole", () => {
  it("every literal in order: its ontology, rank, both sides, example, freight and symbols", () => {
    const literals = entities.literal.map((literal) => ({
      slug: literal.slug,
      traits: literal.traits,
      trait: literal.trait,
      symbols: literal.symbols.map((symbol) => symbol.slug),
    }));
    const pinned = pin(literals, "memo-dataset-literals.snapshot.json");
    expect(pinned.length).toBe(269);
  });

  it("every symbol in order: its traits and labels", () => {
    const pinned = pin(entities.symbol, "memo-dataset-symbols.snapshot.json");
    expect(pinned.length).toBe(entities.symbol.length);
  });
});

describe("memo · SM-2 under a seeded simulation — 64 learners × 16 reviews, the signal drawn AGAIN 3 · HARD 3 · GOOD 11 · EASY 3", () => {
  it("the same seed replays the same trajectories, a different seed does not", () => {
    expect(replay(86, 64, 16)).toEqual(replay(86, 64, 16));
    expect(replay(86, 64, 16)).not.toEqual(replay(87, 64, 16));
  });

  it("seed 86: every step's signal, status, phase, ease, interval, lapses, horizon, strength and the four previews", () => {
    const pinned = pin(replay(86, 64, 16), "memo-sm2-replay-86.snapshot.json");
    const last = pinned.map((trail) => trail.at(-1));
    expect(last.every((step) => step.reps === 16)).toBe(true);
    expect(new Set(pinned.flat().map((step) => step.status))).toEqual(new Set(["LEARNING", "KNOWN", "GRADUATED", "UNKNOWN"]));
  });

  it("from scratch: the preview of an untouched card", () => {
    pin(horizons(sm2.preview(null)), "memo-sm2-preview-untouched.snapshot.json");
  });
});

describe("memo · the card under every history", () => {
  const FACES = ["deus.noun", "gladius.noun", "carpe-diem", "esse.verb", "veni-vidi-vici", "lupus.noun"];

  it("each face × untouched · learning · known · graduated · relearning · suspended", () => {
    expect(FACES.filter((slug) => entities.literal.some((literal) => literal.slug === slug))).toEqual(FACES);
    const projected = Object.fromEntries(FACES.map((slug) => [slug, Object.fromEntries(Object.entries(HISTORIES).map(([name, notes]) => [name, card(row(slug, notes))]))]));
    pin(projected, "memo-cards.snapshot.json");
  });
});

describe("memo · the tty view, frame by frame", { sanitizeOps: false, sanitizeResources: false }, () => {
  const mount = async (data) => {
    const bundler = paladin.bundler(await Deno.makeTempDir({ prefix: "memo-snapshot-" }));
    const bundle = await bundler.bundle({ mime: mime.tty.solid, entry: new URL("../mode/buffer/memo.jsx", import.meta.url).pathname });
    const served = await bundler.serve(bundle.entries[0].mount);
    const url = URL.createObjectURL(new Blob([served.text], { type: "text/javascript" }));
    const module = await import(url);
    URL.revokeObjectURL(url);
    const calls = [];
    const terminal = {
      thread: { id: "th1" },
      buffer: { $data: atom(data) },
      mode: {
        connection: {
          call: async (path, body) => {
            calls.push({ path, body });
            return path === "/deck" ? { language: LANGUAGE, cards: [card(row("deus.noun"))] } : card(row(body.card, [retained([body.signal])]));
          },
        },
      },
    };
    const setup = await testRender(() => [], { width: 80, height: 16 });
    const handle = module.default(setup.renderer.root, terminal, { renderer: setup.renderer, palette: tokens("northsea", "1") });
    const frame = async () => {
      for (let pass = 0; pass < 4; pass++) {
        await setup.renderOnce();
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
      const lines = setup.captureCharFrame().split("\n").map((line) => line.trimEnd());
      while (lines.length > 0 && lines.at(-1) === "") lines.pop();
      return lines;
    };
    return { setup, handle, calls, frame };
  };

  const PRESSES = {
    tab: (setup) => setup.mockInput.pressTab(),
    1: (setup) => setup.mockInput.typeText("1"),
    2: (setup) => setup.mockInput.typeText("2"),
    3: (setup) => setup.mockInput.typeText("3"),
    4: (setup) => setup.mockInput.typeText("4"),
  };

  it("a dealt deck of three faces played through: every grade once, the session's end, tab deals again", async () => {
    const deck = ["deus.noun", "gladius.noun", "carpe-diem"].map((slug) => card(row(slug)));
    const view = await mount({ deck: deck.map((held) => ({ ...held, voice: held.voice === null ? null : `http://cargo/${held.voice}`, picture: held.picture === null ? null : `http://cargo/${held.picture}` })), language: LANGUAGE });
    const frames = [{ key: null, frame: await view.frame() }];
    for (const key of ["tab", "3", "tab", "1", "tab", "4", "tab"]) {
      await PRESSES[key](view.setup);
      frames.push({ key, frame: await view.frame() });
    }
    pin({ frames, calls: view.calls }, "memo-view-tty.snapshot.json");
    view.handle.destroy();
    view.setup.renderer.destroy();
  });
});
