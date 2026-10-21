import "@vivalence/sheets";
import paladin from "@vivalence/paladin";
import { specimen, mime } from "@vivalence/typology";
import { tokens } from "@vivalence/dapper";
import { testRender } from "@opentui/solid";
import { atom } from "nanostores";
import { entities } from "../dataset/entities/index.js";
import sm2 from "../domain/retention/sm2.js";
import { card } from "../domain/card.js";

const { describe, it, expect } = specimen;

const LANGUAGE = { known: "English", learning: "Latin" };
const noted = (notes) => ({ getItems: () => notes });
const row = (slug, notes = []) => ({ ...entities.literal.find((held) => held.slug === slug), ontology: slug.includes(".") ? "word" : "sentence", notes: noted(notes) });
const retained = (signals) => {
  const result = signals.slice(1).reduce((held, signal) => sm2.evolve({ enum: signal }, held), sm2.encode({ enum: signals[0] }));
  return { traits: ["RETAINED"], trait: { RETAINED: { driver: "SM2", status: result.status, due: new Date(result.nextAt).toISOString(), state: result.state } } };
};

describe("the card — one projection of a literal and its notes, for the deck, the tools and both views", () => {
  it("an untouched word carries both sides, its example, no freight, and the horizons from scratch", () => {
    expect(card(row("deus.noun"))).toEqual({
      slug: "deus.noun",
      ontology: "word",
      known: "god",
      learning: "deus",
      example: { known: "God sees the sky", learning: "Deus caelum videt" },
      voice: null,
      picture: null,
      status: "UNTOUCHED",
      due: null,
      lapses: 0,
      suspended: false,
      preview: sm2.preview(null),
    });
  });

  it("a graded card reads its RETAINED note: status, due, lapses, the horizons from its state; a SUSPENDED note marks it", () => {
    const lapsed = retained(["GOOD", "GOOD", "GOOD", "AGAIN"]);
    const held = card(row("gladius.noun", [lapsed, { traits: ["SUSPENDED"], trait: { SUSPENDED: { at: 0, reason: "leech" } } }]));
    expect([held.status, held.lapses, held.suspended, held.picture, held.due]).toEqual(["UNKNOWN", 1, true, "images/gladius.noun.png", lapsed.trait.RETAINED.due]);
    expect(held.preview).toEqual(sm2.preview(lapsed.trait.RETAINED.state));
  });

  it("a vocalized sentence carries its voice", () => {
    expect([card(row("carpe-diem")).ontology, card(row("carpe-diem")).voice]).toEqual(["sentence", "audio/carpe-diem.wav"]);
  });
});

describe("the memo view — compiled by paladin's tty.solid row, imported from a blob as ghost does, driven by keys", { sanitizeOps: false, sanitizeResources: false }, () => {
  const mount = async (data) => {
    const store = await Deno.makeTempDir({ prefix: "memo-bundle-" });
    const bundler = paladin.bundler(store);
    const bundle = await bundler.bundle({ mime: mime.tty.solid, entry: new URL("../mode/buffer/memo.jsx", import.meta.url).pathname });
    const [held] = bundle.entries;
    expect(held.mime).toBe(mime.tty.solid);
    const served = await bundler.serve(held.mount);
    const url = URL.createObjectURL(new Blob([served.text], { type: "text/javascript" }));
    const module = await import(url);
    URL.revokeObjectURL(url);

    const calls = [];
    const cards = [card(row("deus.noun")), card(row("carpe-diem"))].map((held) => ({ ...held, voice: held.voice === null ? null : `http://cargo/${held.voice}` }));
    const terminal = {
      thread: { id: "th3" },
      buffer: { $data: atom(data) },
      mode: {
        connection: {
          call: async (path, body) => {
            calls.push({ path, body });
            return path === "/deck" ? { language: LANGUAGE, cards } : card(row("deus.noun", [retained([body.signal])]));
          },
        },
      },
    };
    const setup = await testRender(() => [], { width: 80, height: 16 });
    const handle = module.default(setup.renderer.root, { terminal, buffer: terminal.buffer, surface: { place: "frame", renderer: setup.renderer, palette: tokens.camel("northsea", "1") } });
    const frame = async () => {
      for (let pass = 0; pass < 4; pass++) {
        await setup.renderOnce();
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
      return setup.captureCharFrame();
    };
    return { setup, handle, calls, frame, terminal };
  };

  it("a bare buffer deals live; tab reveals meaning, example, freight and the four horizons; 3 grades GOOD on the thread; the session ends; tab deals again", async () => {
    const view = await mount({});
    let screen = await view.frame();
    expect(view.calls[0]).toEqual({ path: "/deck", body: { limit: 10 } });
    expect(screen).toContain("1/2 · word · untouched · Latin");
    expect(screen).toContain("deus");
    expect(screen).not.toContain("god");

    view.setup.mockInput.pressTab();
    screen = await view.frame();
    expect(screen).toContain("god");
    expect(screen).toContain("Deus caelum videt — God sees the sky");
    expect(screen).toContain("1 again 1m · 2 hard 1m · 3 good 10m · 4 easy 4d");

    await view.setup.mockInput.typeText("3");
    screen = await view.frame();
    expect(view.calls[1]).toEqual({ path: "/grade", body: { card: "deus.noun", signal: "GOOD", thread: "th3" } });
    expect(screen).toContain("2/2 · sentence · untouched");
    expect(screen).toContain("Carpe diem");

    view.setup.mockInput.pressTab();
    screen = await view.frame();
    expect(screen).toContain("♪ voice");
    await view.setup.mockInput.typeText("4");
    screen = await view.frame();
    expect(view.calls[2]).toEqual({ path: "/grade", body: { card: "carpe-diem", signal: "EASY", thread: "th3" } });
    expect(screen).toContain("sessio peracta · 2 graded — tab deals again");

    view.setup.mockInput.pressTab();
    screen = await view.frame();
    expect(view.calls[3]).toEqual({ path: "/deck", body: { limit: 10 } });

    view.handle.destroy();
    view.setup.renderer.destroy();
  });

  it("a buffer a session dealt into deals that deck without a call, and a new session landing in its data re-deals live", async () => {
    const view = await mount({ deck: [card(row("bellum.noun"))], language: LANGUAGE });
    let screen = await view.frame();
    expect(view.calls).toEqual([]);
    expect(screen).toContain("1/1 · word · untouched · Latin");
    expect(screen).toContain("bellum");

    view.terminal.buffer.$data.set({ deck: [card(row("gladius.noun")), card(row("miles.noun"))], language: LANGUAGE });
    screen = await view.frame();
    expect(view.calls).toEqual([]);
    expect(screen).toContain("1/2 · word · untouched · Latin");
    expect(screen).toContain("gladius");
    view.setup.mockInput.pressTab();
    screen = await view.frame();
    expect(screen).toContain("▣ picture");

    view.handle.destroy();
    view.setup.renderer.destroy();
  });
});

describe("the tablet — m32's svelte view, compiled by paladin's dom.svelte row", { sanitizeOps: false, sanitizeResources: false }, () => {
  it("compiles to one dom.svelte entry and its served module names the Latin grades", async () => {
    const bundler = paladin.bundler(await Deno.makeTempDir({ prefix: "memo-tablet-" }));
    const bundle = await bundler.bundle({ mime: mime.dom.svelte, entry: new URL("../mode/buffer/Memo.svelte", import.meta.url).pathname });
    expect(bundle.entries.map((entry) => entry.mime)).toEqual([mime.dom.svelte]);
    const served = await bundler.serve(bundle.entries[0].mount);
    for (const word of ["Iterum", "Durum", "Bene", "Facile", "Sessio Peracta"]) expect(served.text).toContain(word);
  });
});
