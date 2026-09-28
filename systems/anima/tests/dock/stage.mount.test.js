import { specimen } from "@vivalence/typology";
import { atom } from "nanostores";
import { TERMINALS } from "../../src/client.js";
import { CLIENT, ENTRY, KIT, SRC, build, dom, fire, keys, words } from "./rig.js";

const CHAIN = new URL("typology/gestalten/belt/chain.js", SRC).href;
const DOCK = new URL("typology/stores/bridge/dock.js", SRC).href;

const ANIMA = `export { chain } from "${CHAIN}";\nimport * as bridge from "${DOCK}";\nexport const stores = { bridge };\n`;
const STUB = `<div class="dock-stub">the dock</div>\n`;

const RECT = { left: 0, top: 0, width: 800, height: 600 };

const mode = (traits, slug = "dealer") => ({
  slug,
  traits,
  implements: (trait) => traits.includes(trait),
  $application: atom(null),
  status: { $transient: atom(null) },
});

const thread = (held, { phase = "manual", buffers = [] } = {}) => ({
  id: "t1",
  $mode: atom(held),
  $phase: atom(phase),
  $buffers: atom(buffers),
});

const buffer = (held, given = {}) => ({
  id: "b1",
  status: "ACTIVE",
  mode: held,
  thread: null,
  $view: atom(null),
  mounts: 0,
  mount() {
    this.mounts += 1;
  },
  unmount() {},
  ...given,
});

const drawn = (load) => ({ hash: "h1", bundle: { url: "attach/bundle/dealer" }, mount: { nature: "/card" }, load });

const terminal = (given = {}) => ({
  id: "one",
  $thread: atom(given.thread ?? null),
  $buffer: atom(given.buffer ?? null),
  $dock: atom({ side: "right", share: 0.32, collapsed: true, full: false, ...given.dock }),
  $settling: atom(given.settling ?? null),
});

const roster = (held) => {
  const $active = atom(held);
  return {
    $active,
    get active() {
      return $active.get();
    },
  };
};

const quiet = async () => {
  for (let turn = 0; turn < 4; turn += 1) await new Promise((resolve) => setTimeout(resolve, 0));
};

specimen.describe("panel A — mounted: the frame's states, the status bar, the seam", () => {
  let directory, document, mount, unmount, flush, Stage;
  const mounted = [];

  specimen.beforeAll(async () => {
    directory = await Deno.makeTempDir({ prefix: "anima-stage-mount-" });
    document = dom();
    ({ mount, unmount } = await import(ENTRY));
    ({ flush } = await import(CLIENT));
    await Deno.writeTextFile(`${directory}/anima.js`, ANIMA);
    await Deno.writeTextFile(`${directory}/Dock.svelte`, STUB);
    const load = await build(
      directory,
      {
        Stage: new URL("app/panels/a/a.svelte", SRC),
        Dock: new URL(`file://${directory}/Dock.svelte`),
        Frame: KIT.Frame,
        Empty: KIT.Empty,
        Spinner: KIT.Spinner,
        Status: KIT.Status,
        Key: KIT.Key,
      },
      [[/from "@vivalence\/anima"/g, 'from "./anima.js"']],
    );
    ({ default: Stage } = await load("Stage"));
  });
  specimen.afterEach(() => {
    for (const app of mounted.splice(0)) unmount(app);
    flush();
    document.body.innerHTML = "";
  });
  specimen.afterAll(async () => {
    await Deno.remove(directory, { recursive: true });
  });

  const stage = (held) => {
    const target = document.body.appendChild(document.createElement("div"));
    mounted.push(mount(Stage, { target, props: { rect: RECT }, context: new Map([[TERMINALS, roster(held)]]) }));
    flush();
    return target;
  };

  specimen.it("no terminal and no thread say so, and where to go", () => {
    const told = "no thread pick a mode in navigation · or a thread";
    specimen.expect(words(stage(null))).toBe(told);
    specimen.expect(words(stage(terminal()))).toBe(told);
  });

  specimen.it("a terminal that is still restored says which entity it waits for, and stops saying it", () => {
    const held = terminal({ settling: { thread: "3f9c1a", buffer: "b71e04" } });
    const target = stage(held);
    specimen.expect(words(target)).toBe("settling · thread");
    specimen.expect(target.getElementsByClassName("spinner")).toHaveLength(1);

    held.$settling.set({ thread: null, buffer: "b71e04" });
    flush();
    specimen.expect(words(target)).toBe("settling · buffer");

    held.$settling.set(null);
    flush();
    specimen.expect(words(target)).toBe("no thread pick a mode in navigation · or a thread");
    specimen.expect(target.getElementsByClassName("spinner")).toHaveLength(0);
  });

  specimen.it("a thread with no cursor resolves its buffer over the reason", () => {
    const held = thread(mode(["APPLICATION", "HARNESSED"]), { phase: "inert" });
    const target = stage(terminal({ thread: held }));
    specimen.expect(words(target)).toBe("resolving buffer inert · open a buffer or engage a phase");

    held.$phase.set("manual");
    flush();
    specimen.expect(words(target)).toBe("resolving buffer no buffers · open or pull");

    held.$buffers.set([{ id: "b1" }]);
    flush();
    specimen.expect(words(target)).toBe("resolving buffer cursor empty");
  });

  specimen.it("a harnessed mode with no application is conversational, with a buffer or without", () => {
    const spoken = mode(["HARNESSED"]);
    const told = "conversational · no application the dock is the surface";
    specimen.expect(words(stage(terminal({ thread: thread(spoken) })))).toBe(told);
    specimen.expect(words(stage(terminal({ thread: thread(spoken), buffer: buffer(spoken) })))).toBe(told);
  });

  specimen.it("a buffer with no view is a fault of its own, and names the mode's status", () => {
    const held = mode(["APPLICATION"]);
    const target = stage(terminal({ thread: thread(held), buffer: buffer(held) }));
    specimen.expect(words(target)).toBe("buffer has no view mode dealer · application pending");
    specimen.expect(target.getElementsByClassName("negative")).toHaveLength(1);

    held.status.$transient.set({ code: "ERROR", error: { message: "bundle refused" } });
    flush();
    specimen.expect(words(target)).toBe("buffer has no view mode dealer · application pending · mode error · bundle refused");
  });

  specimen.it("a view loads under its path, mounts, and the status bar names the buffer's status", async () => {
    let release;
    const seen = [];
    const held = mode(["APPLICATION", "HARNESSED"]);
    const cursor = buffer(held);
    const loading = new Promise((resolve) => (release = resolve));
    cursor.$view.set(drawn(() => loading));
    const seated = terminal({ thread: thread(held, { buffers: [cursor] }), buffer: cursor });
    const target = stage(seated);
    specimen.expect(words(target)).toBe("loading view attach/bundle/dealer/card active chat");

    release({ default: (node, props) => (seen.push(props.buffer.id), { destroy() {} }) });
    await quiet();
    flush();
    specimen.expect(seen).toEqual(["b1"]);
    specimen.expect(cursor.mounts).toBe(1);
    specimen.expect(words(target)).toBe("active chat");

    const chat = keys(target).find((key) => words(key) === "chat");
    specimen.expect(chat.classList.contains("latched")).toBe(false);
    fire(chat, "click", { detail: 1 });
    flush();
    specimen.expect(seated.$dock.get().collapsed).toBe(false);
    specimen.expect(keys(target).find((key) => words(key) === "chat").classList.contains("latched")).toBe(true);
  });

  specimen.it("a mode with no harness has no chat key under its view", async () => {
    const held = mode(["APPLICATION"]);
    const cursor = buffer(held, { status: "DONE" });
    cursor.$view.set(drawn(() => Promise.resolve({ default: () => ({ destroy() {} }) })));
    const target = stage(terminal({ thread: thread(held, { buffers: [cursor] }), buffer: cursor }));
    await quiet();
    flush();
    specimen.expect(words(target)).toBe("done");
    specimen.expect(keys(target)).toHaveLength(0);
    const tones = [...target.getElementsByClassName("status")].map((status) => status.classList.contains("positive"));
    specimen.expect(tones).toEqual([true]);
  });

  specimen.it("the frame keeps its own two states: a buffer still an id, a view that refused", async () => {
    const held = mode(["APPLICATION"]);
    const waiting = stage(terminal({ thread: thread(held), buffer: "b71e04" }));
    specimen.expect(words(waiting)).toBe("resolving buffer b71e04");

    const cursor = buffer(held);
    cursor.$view.set(drawn(() => Promise.reject(new Error("integrity mismatch"))));
    const silenced = console.error;
    console.error = () => {};
    try {
      const refused = stage(terminal({ thread: thread(held, { buffers: [cursor] }), buffer: cursor }));
      await quiet();
      flush();
      specimen.expect(words(refused)).toBe("view refused integrity mismatch attach/bundle/dealer/card active");
    } finally {
      console.error = silenced;
    }
  });

  specimen.it("an open dock sits behind a seam with a grip; full, the seam is gone", () => {
    const held = mode(["HARNESSED"]);
    const seated = terminal({ thread: thread(held), dock: { collapsed: false } });
    const target = stage(seated);
    specimen.expect(target.getElementsByClassName("dock-stub")).toHaveLength(1);
    specimen.expect(target.getElementsByClassName("seam")).toHaveLength(1);
    specimen.expect(target.getElementsByClassName("grip")).toHaveLength(1);
    specimen.expect(target.getElementsByClassName("seam")[0].classList.contains("vertical")).toBe(true);

    seated.$dock.set({ ...seated.$dock.get(), full: true });
    flush();
    specimen.expect(target.getElementsByClassName("dock-stub")).toHaveLength(1);
    specimen.expect(target.getElementsByClassName("seam")).toHaveLength(0);

    seated.$dock.set({ ...seated.$dock.get(), collapsed: true });
    flush();
    specimen.expect(target.getElementsByClassName("dock-stub")).toHaveLength(0);
  });
});
