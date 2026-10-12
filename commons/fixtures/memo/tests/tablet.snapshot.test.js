import paladin from "@vivalence/paladin";
import { specimen, mime } from "@vivalence/typology";
import { parseHTML } from "linkedom";
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

function dom() {
  const { window, document } = parseHTML("<!doctype html><html><head></head><body></body></html>");
  const walk = (node, key) => {
    for (let proto = Object.getPrototypeOf(node); proto && proto !== window.Node.prototype; proto = Object.getPrototypeOf(proto)) {
      const descriptor = Object.getOwnPropertyDescriptor(proto, key);
      if (descriptor && descriptor.get) return descriptor.get.call(node);
    }
    return null;
  };
  for (const key of ["firstChild", "nextSibling"]) {
    const own = Object.getOwnPropertyDescriptor(window.Node.prototype, key);
    Object.defineProperty(window.Node.prototype, key, { configurable: true, get() { return walk(this, key) ?? own.get.call(this) ?? null; } });
  }
  Object.assign(globalThis, {
    window,
    document,
    Node: window.Node,
    Element: window.Element,
    HTMLElement: window.HTMLElement,
    Text: window.Text,
    Comment: window.Comment,
    DocumentFragment: window.DocumentFragment,
    Event: window.Event,
    CustomEvent: window.CustomEvent,
    requestAnimationFrame: (callback) => setTimeout(callback, 16),
    getComputedStyle: () => ({ getPropertyValue: () => "" }),
  });
  return document;
}

const fire = (element, type) => {
  const handler = element[`__${type}`];
  const event = new globalThis.window.Event(type);
  Object.defineProperty(event, "currentTarget", { configurable: true, value: element });
  return Array.isArray(handler) ? handler[0].call(element, event, ...handler.slice(1)) : handler.call(element, event);
};

const settle = async () => {
  for (let pass = 0; pass < 4; pass++) await new Promise((resolve) => setTimeout(resolve, 0));
};

const LANGUAGE = { known: "English", learning: "Latin" };
const noted = (notes) => ({ getItems: () => notes });
const row = (slug, notes = []) => ({ ...entities.literal.find((held) => held.slug === slug), ontology: slug.includes(".") ? "word" : "sentence", notes: noted(notes) });
const retained = (signal) => {
  const result = sm2.encode({ enum: signal });
  return { traits: ["RETAINED"], trait: { RETAINED: { driver: "SM2", status: result.status, due: "2026-10-12T00:00:00.000Z", state: result.state } } };
};
const freighted = (held) => ({ ...held, voice: held.voice === null ? null : `http://cargo/${held.voice}`, picture: held.picture === null ? null : `http://cargo/${held.picture}` });

describe("memo · the tablet on the dom, frame by frame", { sanitizeOps: false, sanitizeResources: false }, () => {
  const mount = async (data) => {
    const document = dom();
    const bundler = paladin.bundler(await Deno.makeTempDir({ prefix: "memo-tablet-snapshot-" }));
    const bundle = await bundler.bundle({ mime: mime.dom.svelte, entry: new URL("../mode/buffer/Memo.svelte", import.meta.url).pathname });
    const served = await bundler.serve(bundle.entries[0].mount);
    const url = URL.createObjectURL(new Blob([served.text], { type: "text/javascript" }));
    const module = await import(url);
    URL.revokeObjectURL(url);
    const calls = [];
    const buffer = {
      data,
      release: () => calls.push({ path: "release" }),
      mode: {
        call: {
          deck: async (body) => (calls.push({ path: "/deck", body }), { language: LANGUAGE, cards: [freighted(card(row("deus.noun")))] }),
          grade: async (body) => (calls.push({ path: "/grade", body }), card(row(body.card, [retained(body.signal)]))),
        },
      },
    };
    const target = document.createElement("div");
    document.body.appendChild(target);
    const handle = module.default(target, { terminal: { thread: { id: "th1" } }, buffer });
    const frame = async () => {
      await settle();
      return {
        text: target.textContent.replace(/\s+/g, " ").trim(),
        buttons: [...target.getElementsByTagName("button")].map((button) => button.textContent.replace(/\s+/g, " ").trim()),
        media: [...target.querySelectorAll("img, audio")].map((element) => ({ tag: element.tagName.toLowerCase(), src: element.getAttribute("src") })),
        revealed: target.querySelector(".tablet") !== null && target.querySelector(".tablet").classList.contains("revealed"),
        html: target.innerHTML,
      };
    };
    const press = (label) => fire([...target.getElementsByTagName("button")].find((button) => button.textContent.includes(label)), "click");
    return { calls, frame, press, handle };
  };

  it("a dealt deck of three faces played through: reveal, every grade once, the session's tallies, Vale releases the buffer", async () => {
    const deck = ["deus.noun", "gladius.noun", "carpe-diem"].map((slug) => freighted(card(row(slug))));
    const view = await mount({ deck, language: LANGUAGE });
    const frames = [{ press: null, ...(await view.frame()) }];
    for (const label of ["Revela", "Bene", "Revela", "Iterum", "Revela", "Facile", "Vale"]) {
      view.press(label);
      frames.push({ press: label, ...(await view.frame()) });
    }
    const pinned = pin({ frames, calls: view.calls }, "memo-view-dom.snapshot.json");
    expect(pinned.frames.map((frame) => frame.buttons.length)).toEqual([1, 4, 1, 4, 1, 4, 1, 1]);
    view.handle.destroy();
  });

  it("a bare buffer deals through the mode's call", async () => {
    const view = await mount({});
    pin({ frame: await view.frame(), calls: view.calls }, "memo-view-dom-dealt.snapshot.json");
    view.handle.destroy();
  });
});
