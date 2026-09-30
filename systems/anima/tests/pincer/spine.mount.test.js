import { specimen } from "@vivalence/typology";
import { atom } from "nanostores";
import { LIGHTHOUSE } from "../../src/client.js";
import { CLIENT, DRAPES, ENTRY, KIT, SRC, build, dom, fire, send, words } from "../dock/rig.js";

const ACTIVITY = new URL("typology/entities/activity.js", SRC).href;
const GEOMETRY = new URL("typology/stores/bridge/geometry.js", SRC).href;
const PROJECT = new URL("app/panels/f/widgets/activity.js", SRC).href;
const PLACE = new URL("panels/float.js", DRAPES).href;

const ANIMA = `export { TONES, settled } from "${ACTIVITY}";\nimport * as bridge from "${GEOMETRY}";\nexport const stores = { bridge };\n`;

const COLUMN = { left: 0, top: 0, width: 45, height: 600 };

const mode = (slug, traits) => ({ slug, implements: (trait) => traits.includes(trait.toUpperCase()) });

const daemon = (slug, { code = "healthy", modes = [], threads = [], activities = [] } = {}) => ({
  slug,
  status: { reflection: { code } },
  connection: { $state: atom("OPEN") },
  entities: {
    mode: { $entities: atom(modes) },
    thread: { $entities: atom(threads) },
    activity: { $entities: atom(activities) },
  },
});

const world = () => {
  const said = [];
  const stdin = Object.fromEntries(["SIGSTOP", "SIGCONT", "SIGTERM"].map((signal) => [signal, (reason) => said.push([signal, reason])]));
  const running = { id: "a1", status: "RUNNING", thread: "t1", steps: [{ path: "/hallucination", verb: "open", at: 0 }], stdin };
  const italian = daemon("italian", {
    modes: [mode("dojo", ["APPLICATION", "STANDALONE"]), mode("francesca", ["CONVERSATIONAL", "HARNESSED"]), mode("word", ["TOPOLOGICAL"])],
    threads: [{ id: "t1", label: { name: "lesson" } }, { id: "t2", label: { name: "drill" } }],
    activities: [running, { id: "a0", status: "DONE", thread: "t2", steps: [] }],
  });
  const chess = daemon("chess", { modes: [mode("play", ["APPLICATION"])], threads: [{ id: "t9", label: { name: "game" } }] });
  const lighthouse = {
    $status: atom({ code: "VERIFIED" }),
    $daemons: atom([italian, chess]),
    connection: { url: new URL("http://localhost:2501/") },
    manifest: { slug: "multiplayer" },
  };
  return { lighthouse, italian, chess, said };
};

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

specimen.describe("the spine — mounted: the lighthouse's pill, its daemons' dots, the card a dot shows and the card it pins", () => {
  let directory, document, mount, unmount, flush, Spine;
  const mounted = [];

  specimen.beforeAll(async () => {
    directory = await Deno.makeTempDir({ prefix: "anima-spine-mount-" });
    document = dom();
    ({ mount, unmount } = await import(ENTRY));
    ({ flush } = await import(CLIENT));
    await Deno.writeTextFile(`${directory}/anima.js`, ANIMA);
    const load = await build(
      directory,
      { Spine: new URL("app/bones/spine/spine.svelte", SRC), Pip: new URL("display/Pip.svelte", DRAPES), Key: KIT.Key, Float: KIT.Float },
      [
        [/from "@vivalence\/anima"/g, 'from "./anima.js"'],
        [/import \{ Float, Key, Pip, place \} from "@vivalence\/drapes";/, `import Float from "./Float.js";\nimport Key from "./Key.js";\nimport Pip from "./Pip.js";\nimport { place } from "${PLACE}";`],
        [/from "\.\.\/\.\.\/panels\/f\/widgets\/activity\.js"/g, `from "${PROJECT}"`],
      ],
    );
    ({ default: Spine } = await load("Spine"));
  });
  specimen.afterEach(() => {
    for (const app of mounted.splice(0)) unmount(app);
    flush();
    document.body.innerHTML = "";
  });
  specimen.afterAll(async () => {
    await Deno.remove(directory, { recursive: true });
  });

  const spine = (held) => {
    const target = document.body.appendChild(document.createElement("div"));
    mounted.push(mount(Spine, { target, props: { rect: COLUMN }, context: new Map([[LIGHTHOUSE, held.lighthouse]]) }));
    flush();
    return target;
  };
  const pill = (target) => target.getElementsByClassName("lighthouse")[0];
  const dots = (target) => [...target.getElementsByClassName("daemon")];
  const card = () => document.body.getElementsByClassName("spine-card")[0] ?? null;
  const pinned = () => document.body.getElementsByClassName("spine-pinned")[0] ?? null;
  const button = (within, label) => [...within.getElementsByTagName("button")].find((key) => words(key) === label);

  specimen.it("verified, the pill stands open: a dot per daemon, a tick per live activity, the lighthouse named in its title", () => {
    const target = spine(world());
    specimen.expect(pill(target).className.includes("open")).toBe(true);
    specimen.expect(pill(target).className.includes("positive")).toBe(true);
    specimen.expect(pill(target).getAttribute("title")).toBe("multiplayer · verified");
    specimen.expect(dots(target).map((dot) => dot.getAttribute("aria-label"))).toEqual(["italian · healthy", "chess · healthy"]);
    specimen.expect(dots(target).map((dot) => dot.getElementsByClassName("tick").length)).toEqual([1, 0]);
  });

  specimen.it("a dot shows its card on hover — offered modes, threads, live activities — kept while the pointer is in the card, gone 180 ms after it leaves", async () => {
    const target = spine(world());
    send(dots(target)[0], "mouseenter");
    flush();
    specimen.expect(words(card())).toBe("italian healthy dojo · francesca · 2 threads /hallucination running");
    send(dots(target)[0], "mouseleave");
    send(card(), "mouseenter");
    await pause(220);
    flush();
    specimen.expect(card()).not.toBe(null);
    send(card(), "mouseleave");
    await pause(220);
    flush();
    specimen.expect(card()).toBe(null);
    send(dots(target)[1], "mouseenter");
    flush();
    specimen.expect(words(card())).toBe("chess healthy play · 1 threads no live activities");
  });

  specimen.it("a dot clicked in the open pill pins its card: the facts, every daemon a row to switch to, the activities' signals, and a close that keeps the pill open", () => {
    const held = world();
    const target = spine(held);
    fire(dots(target)[0], "click");
    flush();
    specimen.expect(card()).toBe(null);
    specimen.expect(words(pinned())).toContain("daemon italian healthy");
    specimen.expect([...pinned().getElementsByClassName("spine-key")].map(words)).toEqual(["lighthouse", "modes", "threads"]);
    specimen.expect([...pinned().getElementsByClassName("spine-value")].map(words)).toEqual(["multiplayer · localhost:2501", "dojo · francesca", "2"]);
    specimen.expect([...pinned().getElementsByClassName("spine-row")].map((row) => [words(row), row.className.includes("picked")])).toEqual([["italian 1", true], ["chess —", false]]);
    specimen.expect(words(pinned().getElementsByClassName("spine-kid")[0])).toBe("/hallucination lesson · running pause stop");
    fire(button(pinned().getElementsByClassName("spine-kid")[0], "stop"), "click");
    specimen.expect(held.said).toEqual([["SIGTERM", "user pressed stop"]]);
    fire(pinned().getElementsByClassName("spine-row")[1], "click");
    flush();
    specimen.expect(words(pinned())).toContain("daemon chess healthy");
    fire(button(pinned(), "close"), "click");
    flush();
    specimen.expect(pinned()).toBe(null);
    specimen.expect(pill(target).className.includes("open")).toBe(true);
  });

  specimen.it("the pill folds on a click and on a press outside it; a folded pill's dot opens it, never pins", () => {
    const target = spine(world());
    fire(pill(target), "click");
    flush();
    specimen.expect(pill(target).className.includes("open")).toBe(false);
    fire(dots(target)[0], "click");
    flush();
    specimen.expect(pinned()).toBe(null);
    fire(pill(target), "click");
    flush();
    specimen.expect(pill(target).className.includes("open")).toBe(true);
    document.body.appendChild(document.createElement("p")).dispatchEvent(new globalThis.window.Event("mousedown", { bubbles: true }));
    flush();
    specimen.expect(pill(target).className.includes("open")).toBe(false);
  });

  specimen.it("unverified, the pill stands folded in its state's ring: unreachable, checking, expired", () => {
    const held = world();
    const target = spine(held);
    for (const [code, tone, open] of [["OFFLINE", "negative", false], ["VERIFYING", "primary", false], ["SESSION_EXPIRED", "idle", false], ["VERIFIED", "positive", true]]) {
      held.lighthouse.$status.set({ code });
      flush();
      specimen.expect([pill(target).className.includes(tone), pill(target).className.includes("open")]).toEqual([true, open]);
    }
    specimen.expect(pill(target).className.includes("checking")).toBe(false);
    held.lighthouse.$status.set({ code: "VERIFYING" });
    flush();
    specimen.expect(pill(target).className.includes("checking")).toBe(true);
  });
});
