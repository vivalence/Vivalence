import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  from,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import { render } from "solid-js/web";
import { persistentAtom } from "@nanostores/persistent";
import { Reading, Settings } from "../schematics.js";
import { dwell, pivot, sentence, sentences, span, tokens } from "./pace.js";
import sheet from "./reader.css";

const SWIPE = 110;
const SLOP = 14;
const FLICK = 0.6;
const GLIDE = "cubic-bezier(.16, 1, .3, 1)";
const UNITS = ["sentence", "block", "section"];
const STYLES = ["word", "chunk", "pacer"];
const PAUSES = ["off", "light", "strong"];
const PDFJS = "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.5.438/build/pdf.min.mjs";
const WORKER = "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.5.438/build/pdf.worker.min.mjs";
const TYPED = [
  [/\.epub$/i, "application/epub+zip"],
  [/\.pdf$/i, "application/pdf"],
  [/\.(md|markdown)$/i, "text/markdown"],
  [/\.org$/i, "text/org"],
  [/\.html?$/i, "text/html"],
  [/(?:)/, "text/plain"],
];
const SNIFFS = [
  [/^#{1,6} \S|^```|\[[^\]]+\]\([^)]+\)/m, "text/markdown"],
  [/^#\+\w+:|^#\+begin_|^\*+ \S/im, "text/org"],
  [/(?:)/, "text/plain"],
];
const typed = (table, subject) => table.find(([pattern]) => pattern.test(subject))[1];
const TYPES = ["dyslexic", "sans", "serif"];
const LEADING = { tight: 1.5, normal: 1.7, loose: 1.95 };
const WIDTH = { narrow: "28em", normal: "34em", wide: "42em" };
const KIND = {
  H1: "h1",
  H2: "h2",
  H3: "h2",
  H4: "h2",
  H5: "h2",
  H6: "h2",
  P: "p",
  UL: "list",
  OL: "list",
  BLOCKQUOTE: "quote",
  IMG: "image",
  PICTURE: "image",
  FIGURE: "image",
  PRE: "code",
  TABLE: "table",
};

const $settings = persistentAtom("viva.mode.reader.settings", Settings.cast({}), {
  encode: JSON.stringify,
  decode: (text) => Settings.cast(JSON.parse(text)),
});
const set = (patch) => $settings.set({ ...$settings.get(), ...patch });

const parsed = (html) => new DOMParser().parseFromString(html, "text/html").body;
const words = (text) => text.trim().split(/\s+/).filter(Boolean).length;
const listed = (section) =>
  [...section.children].map((node) => ({
    id: node.dataset.block,
    kind: KIND[node.tagName] ?? "block",
    done: node.hasAttribute("data-done"),
    words: words(node.textContent),
    html: node.outerHTML,
  }));
const minutes = (blocks, wpm = 200) => Math.max(1, Math.ceil(blocks.reduce((sum, block) => sum + block.words, 0) / wpm));
const sourced = (address) => {
  const url = new URL(address);
  return `${url.host}${url.pathname.replace(/\/$/, "")}`;
};
const disposed = (name) => `attachment; filename*=UTF-8''${encodeURIComponent(name)}`;

const Kept = (props) => (
  <ol class="rd-files">
    <For each={props.entries}>
      {(entry, index) => (
        <li>
          <label>
            <input
              type="checkbox"
              checked={entry.kept}
              onChange={(event) => props.set(props.entries.map((held, at) => (at === index() ? { ...held, kept: event.target.checked } : held)))}
            />
            <span class="t">{entry.title}</span>
          </label>
        </li>
      )}
    </For>
  </ol>
);

const EpubScreen = (props) => (
  <div class="rd-intake">
    <span class="kit-label">chapters · {props.options.files.filter((file) => file.kept).length} of {props.options.files.length}</span>
    <Kept entries={props.options.files} set={(files) => props.set({ files })} />
  </div>
);

const PdfScreen = (props) => (
  <div class="rd-intake">
    <span class="kit-label">flow</span>
    <div class="kit-choice">
      <button aria-pressed={String(props.options.flow === "reflow")} onClick={() => props.set({ flow: "reflow" })}>reflow</button>
      <button aria-pressed={String(props.options.flow === "pages")} onClick={() => props.set({ flow: "pages" })}>pages</button>
    </div>
    <Show when={props.options.flow === "reflow"}>
      <span class="kit-label">read by</span>
      <div class="kit-choice">
        <button aria-pressed={String(props.options.reader === "text")} onClick={() => props.set({ reader: "text" })}>text</button>
        <Show when={props.options.scannable}>
          <button aria-pressed={String(props.options.reader === "ocr")} onClick={() => props.set({ reader: "ocr" })}>ocr</button>
        </Show>
        <Show when={props.readable()}>
          <button aria-pressed={String(props.options.reader === "model")} onClick={() => props.set({ reader: "model" })}>model</button>
        </Show>
      </div>
    </Show>
  </div>
);

const PageScreen = (props) => (
  <div class="rd-intake">
    <span class="kit-label">extract</span>
    <div class="kit-choice">
      <button aria-pressed={String(props.options.extract === "article")} onClick={() => props.set({ extract: "article" })}>article</button>
      <button aria-pressed={String(props.options.extract === "whole")} onClick={() => props.set({ extract: "whole" })}>whole page</button>
    </div>
    <Show when={props.options.contents.length > 0}>
      <span class="kit-label">read</span>
      <div class="kit-choice">
        <button aria-pressed={String(props.options.read === "page")} onClick={() => props.set({ read: "page" })}>this page</button>
        <button aria-pressed={String(props.options.read === "contents")} onClick={() => props.set({ read: "contents" })}>its contents</button>
      </div>
      <Show when={props.options.read === "contents"}>
        <Kept entries={props.options.contents} set={(contents) => props.set({ contents })} />
      </Show>
    </Show>
    <Show when={props.options.files.length > 0}>
      <span class="kit-label">books on this page</span>
      <For each={props.options.files}>
        {(file) => (
          <button class="rd-rec" onClick={() => props.fetch(file.href)}>
            <span class="sign">◆</span>
            <span class="t">{decodeURIComponent(new URL(file.href).pathname.split("/").at(-1))}</span>
            <span />
            <span class="v">{file.type.replace(/^application\//, "").replace(/\+zip$/, "")}</span>
          </button>
        )}
      </For>
    </Show>
  </div>
);

const SCREENS = { epub: EpubScreen, pdf: PdfScreen, page: PageScreen };

export const Reader = (props) => {
  const stored = from(props.buffer.$data);
  const held = createMemo(() => Reading.cast(stored()));
  const settings = from($settings);
  const files = from(props.buffer.$files);
  const [address, setAddress] = createSignal("");
  const [parsing, setParsing] = createSignal(null);
  const [steps, setSteps] = createSignal([]);
  const [failed, setFailed] = createSignal(false);
  const [shelved, setShelved] = createSignal(false);
  const [open, setOpen] = createSignal(false);
  const [listing, setListing] = createSignal(false);
  let toggle;
  let panel;
  let contents;
  let toc;
  const dismiss = (event) => {
    const path = event.composedPath();
    if (path.includes(panel) || path.includes(toggle)) return;
    setOpen(false);
  };
  const closed = (event) => {
    const path = event.composedPath();
    if (path.includes(toc) || path.includes(contents)) return;
    setListing(false);
  };
  createEffect(() => {
    if (!open()) return;
    document.addEventListener("pointerdown", dismiss);
    onCleanup(() => document.removeEventListener("pointerdown", dismiss));
  });
  createEffect(() => {
    if (!listing()) return;
    document.addEventListener("pointerdown", closed);
    onCleanup(() => document.removeEventListener("pointerdown", closed));
  });
  const [drag, setDrag] = createSignal(null);
  const [gone, setGone] = createSignal([]);
  const [revisited, setRevisited] = createSignal([]);
  let scroller;
  let swipe = null;

  const settle = (data) =>
    props.terminal.client.runtime.entities.buffer.updateOne(
      { id: props.buffer.id },
      { data: Reading.cast({ ...props.buffer.data, ...data }) },
    );

  const filed = (id) => files().find((file) => file.id === id);
  const original = () => filed(held().article.original);
  const [book] = createResource(
    () => (held().article === null || filed(held().article.book) === undefined ? false : filed(held().article.book).url),
    async (url) => new DOMParser().parseFromString(await (await fetch(url)).text(), "text/html"),
  );

  const marked = (section) => {
    const copy = section.cloneNode(true);
    for (const [id, time] of Object.entries(held().done)) {
      copy.querySelector(`[data-block="${id}"]`)?.setAttribute("data-done", time);
    }
    return copy;
  };
  const opened = () => book().querySelector(`[data-chapter="${held().article.chapter}"]`) ?? book().querySelector("[data-chapter]");
  const blocks = createMemo(() => (held().article === null || book() === undefined ? [] : listed(marked(opened()))));
  const chapters = createMemo(() =>
    book() === undefined
      ? []
      : [...book().querySelectorAll("[data-chapter]")].map((section) => ({
        id: section.dataset.chapter,
        title: section.dataset.title,
        left: listed(marked(section)).filter((block) => !block.done).length,
      })));
  const chapter = () => chapters().findIndex((entry) => entry.id === opened().dataset.chapter);
  const following = () => chapters()[chapter() + 1];
  const turn = (id) => {
    setListing(false);
    setPlaying(false);
    return settle({ article: { ...held().article, chapter: id }, cursor: null });
  };

  const finish = (ids) => {
    const stamp = new Date().toISOString();
    return settle({ done: { ...held().done, ...Object.fromEntries(ids.map((id) => [id, stamp])) } });
  };
  const done = async (id) => {
    await finish([id]);
    setDrag(null);
  };
  const undo = () => {
    const [newest] = Object.values(held().done).sort((a, b) => b.localeCompare(a));
    return settle({ done: Object.fromEntries(Object.entries(held().done).filter(([, time]) => time !== newest)) });
  };

  const block = (id) => blocks().find((candidate) => candidate.id === id);
  const live = createMemo(() =>
    blocks()
      .filter((candidate) => !candidate.done && !gone().includes(candidate.id))
      .map((candidate) => candidate.id));
  const visible = createMemo(() =>
    blocks()
      .filter((candidate) => live().includes(candidate.id) || revisited().includes(candidate.id))
      .map((candidate) => candidate.id));
  const left = () => blocks().filter((candidate) => !candidate.done);

  const [buffers, shelf] = createResource(() => props.buffer.mode.entities.buffer.find({}), { initialValue: [] });
  const back = () => {
    setShelved(true);
    return shelf.refetch();
  };
  const reading = () => buffers()
    .map((buffer) => ({ buffer, data: Reading.cast(buffer.data) }))
    .filter((entry) => entry.data.article !== null);

  const typeface = async () => {
    const [file] = await props.buffer.mode.entities.file.find({ path: "OpenDyslexic-Regular.woff2" });
    const face = new FontFace("OpenDyslexic", `url(${file.url})`);
    document.fonts.add(await face.load());
  };
  onMount(typeface);

  const taken = async (label, packets) => {
    setSteps([]);
    setFailed(false);
    setParsing(label);
    try {
      for await (const packet of packets) setSteps((seen) => [...seen, packet]);
      await props.terminal.client.runtime.entities.buffer.find({ id: props.buffer.id });
      setParsing(null);
      setShelved(false);
      setAddress("");
    } catch (error) {
      console.error("[reader] take", error);
      setFailed(true);
    }
  };
  const add = (url = address().trim()) => {
    if (!url) return;
    return taken(url, props.buffer.mode.call.add({ buffer: props.buffer.id, url }));
  };
  const put = (name, type, blob) =>
    taken(name, props.buffer.mode.call.put[props.buffer.id]({}, {
      raw: { body: blob.stream() },
      headers: { "content-type": type, "content-disposition": disposed(name) },
    }));
  const parse = (options) =>
    taken(held().intake.url ?? "parsing", props.buffer.mode.call.parse({ buffer: props.buffer.id, options }));
  const reopen = () => taken(held().article.title, props.buffer.mode.call.reopen({ buffer: props.buffer.id }));
  const [over, setOver] = createSignal(false);
  const drop = (event) => {
    event.preventDefault();
    setOver(false);
    const [file] = event.dataTransfer.files;
    if (file !== undefined) return put(file.name, typed(TYPED, file.name), file);
    const html = event.dataTransfer.getData("text/html");
    const text = event.dataTransfer.getData("text/plain");
    if (html !== "") return put("dropped", "text/html", new Blob([html]));
    if (text.trim() !== "") return put("dropped", typed(SNIFFS, text), new Blob([text]));
  };
  const paste = (event) => {
    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");
    if (URL.canParse(text.trim())) return;
    if (html === "" && text.trim() === "") return;
    event.preventDefault();
    if (html === "" || typed(SNIFFS, text) !== "text/plain") return put("pasted", typed(SNIFFS, text), new Blob([text]));
    return put("pasted", "text/html", new Blob([html]));
  };

  const pace = (name) => set({ face: "reader", pace: settings().pace === name ? "scroll" : name });
  const now = () => block(live()[0]);
  const section = () => {
    const ids = live();
    const end = ids.findIndex((id, index) => index > 0 && ["h1", "h2"].includes(block(id).kind));
    return end === -1 ? ids : ids.slice(0, end);
  };
  const flow = createMemo(() =>
    live().length === 0 ? [] : tokens(now().kind, parsed(now().html).firstElementChild));
  const halted = () => flow().length === 0;
  const resumed = () => {
    const cursor = held().cursor;
    if (cursor === null || cursor.block !== now().id) return 0;
    return sentences(flow())[Math.min(cursor.sentence, sentences(flow()).length - 1)];
  };
  const [spot, setSpot] = createSignal({ block: null, index: 0 });
  const index = () => (spot().block === now().id ? spot().index : resumed());
  const [playing, setPlaying] = createSignal(false);
  const [played, setPlayed] = createSignal(0);
  const width = () => (settings().style === "word" ? 1 : settings().chunk);
  const frame = () => flow().slice(index(), index() + width());
  const said = () => flow().slice(...span(flow(), index()));
  const seek = (target) => setSpot({ block: now().id, index: target });
  const keep = (target) => settle({ cursor: { block: now().id, sentence: sentence(flow(), target) } });
  const advance = async () => {
    const next = index() + width();
    setPlayed(played() + 1);
    if (next < flow().length) return seek(next);
    await finish([now().id]);
  };
  const play = () => {
    if (playing()) {
      setPlaying(false);
      if (!halted()) keep(index());
      return;
    }
    if (!halted()) seek(span(flow(), index())[0]);
    setPlayed(0);
    setPlaying(true);
  };
  const hop = (steps) => {
    const starts = sentences(flow());
    const target = Math.max(0, Math.min(starts.length - 1, sentence(flow(), index()) + steps));
    seek(starts[target]);
    setPlayed(0);
    if (!playing()) keep(starts[target]);
  };
  const lingered = () => Math.max(1500, (now().words * 60000) / settings().wpm);
  createEffect(() => {
    if (!playing() || settings().pace !== "speed" || settings().face !== "reader") return;
    if (live().length === 0) return setPlaying(false);
    const timer = halted()
      ? setTimeout(() => finish([now().id]), lingered())
      : setTimeout(advance, dwell(frame(), settings(), played()));
    onCleanup(() => clearTimeout(timer));
  });
  const step = (event) => {
    if (event.target.closest("a[href]")) return;
    if (settings().unit === "section") return finish(section());
    if (settings().unit === "block" || halted()) return finish([now().id]);
    const starts = sentences(flow());
    const next = sentence(flow(), index()) + 1;
    if (next >= starts.length) return finish([now().id]);
    seek(starts[next]);
    return keep(starts[next]);
  };
  const paced = (event) => {
    if (event.target.closest("button, input") || live().length === 0) return;
    if (event.target.closest("a[href]")) return;
    return settings().pace === "block" ? step(event) : play();
  };

  const resisted = (travel) =>
    Math.abs(travel) <= SWIPE
      ? travel
      : Math.sign(travel) * (SWIPE + (Math.abs(travel) - SWIPE) * 0.35);

  const glide = (article, change) => {
    const firsts = new Map(
      [...article.children].map((node) => [node, node.getBoundingClientRect().top]),
    );
    change();
    for (const [node, top] of firsts) {
      if (!node.isConnected) continue;
      const delta = top - node.getBoundingClientRect().top;
      if (delta === 0) continue;
      node.animate(
        [{ transform: `translateY(${delta}px)` }, { transform: "none" }],
        { duration: 320, easing: GLIDE },
      );
    }
  };

  const leave = async (swiped) => {
    const width = Math.sign(swiped.dx) * swiped.element.offsetWidth;
    await swiped.element.querySelector(".txt").animate(
      [{ transform: `translateX(${width}px)`, opacity: 0 }],
      { duration: 200, easing: "cubic-bezier(.25, .8, .5, 1)", fill: "forwards" },
    ).finished;
    const read = block(swiped.id).done;
    glide(swiped.element.parentElement, () => {
      setGone([...gone(), swiped.id]);
      setRevisited(revisited().filter((id) => id !== swiped.id));
    });
    setDrag(null);
    try {
      if (!read) await finish([swiped.id]);
    } finally {
      setGone(gone().filter((id) => id !== swiped.id));
    }
  };

  const revisit = (id) => {
    const article = scroller.querySelector(".rd-art");
    if (revisited().includes(id)) {
      return glide(article, () => setRevisited(revisited().filter((candidate) => candidate !== id)));
    }
    glide(article, () => setRevisited([...revisited(), id]));
    reveal(id);
  };

  const down = (event, id) => {
    if (event.button > 0) return;
    if (event.target.closest("button, a, input")) return;
    swipe = {
      id,
      x: event.clientX,
      y: event.clientY,
      dx: 0,
      at: event.timeStamp,
      velocity: 0,
      armed: false,
      live: false,
      pointer: event.pointerId,
      element: event.currentTarget,
    };
  };
  const move = (event) => {
    if (swipe === null) return;
    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    if (!swipe.live) {
      if (Math.abs(dx) < SLOP || Math.abs(dx) < 2 * Math.abs(dy)) {
        if (Math.abs(dy) > 10) swipe = null;
        return;
      }
      swipe.live = true;
      swipe.x += Math.sign(dx) * SLOP;
      swipe.element.setPointerCapture(swipe.pointer);
      getSelection().removeAllRanges();
    }
    const travel = event.clientX - swipe.x;
    swipe.velocity = (travel - swipe.dx) / Math.max(1, event.timeStamp - swipe.at);
    swipe.dx = travel;
    swipe.at = event.timeStamp;
    const armed = Math.abs(travel) > SWIPE;
    if (armed !== swipe.armed && "vibrate" in navigator) navigator.vibrate(8);
    swipe.armed = armed;
    setDrag({ id: swipe.id, dx: resisted(travel), armed, live: true });
  };
  const up = () => {
    const ended = swipe;
    swipe = null;
    if (ended === null || !ended.live) return;
    const flung = Math.abs(ended.velocity) > FLICK
      && Math.sign(ended.velocity) === Math.sign(ended.dx)
      && Math.abs(ended.dx) > SWIPE / 3;
    if (ended.armed || flung) return leave(ended);
    setDrag(null);
  };
  const cancel = () => {
    swipe = null;
    setDrag(null);
  };
  const dragged = (id) => (drag() !== null && drag().id === id ? drag() : null);
  const shift = (id) => (dragged(id) === null ? 0 : dragged(id).dx);

  const follow = (event) => {
    const link = event.target.closest("a[href]");
    if (link === null) return;
    event.preventDefault();
    window.open(link.href, "_blank", "noopener");
  };
  const [scrolled, setScrolled] = createSignal(false);
  const [near, setNear] = createSignal(false);
  const neared = (event) => setNear(event.clientY - event.currentTarget.getBoundingClientRect().top < 150);
  const [framed, setFramed] = createSignal(new Set());
  const sighted = (entries) =>
    setFramed((before) => {
      const after = new Set(before);
      for (const entry of entries) after[entry.isIntersecting ? "add" : "delete"](entry.target.id);
      return after;
    });
  const watcher = new IntersectionObserver(sighted);
  onCleanup(() => watcher.disconnect());
  const watched = (section) => {
    watcher.observe(section);
    onCleanup(() => {
      watcher.unobserve(section);
      sighted([{ isIntersecting: false, target: section }]);
    });
  };
  const reveal = (id) => scroller.querySelector(`[id="blk-${id}"]`).scrollIntoView({ block: "center", behavior: "smooth" });

  const [pdf] = createResource(
    () => (held().article !== null && original() !== undefined && original().mime.startsWith("application/pdf") ? original().url : false),
    async (url) => {
      const library = await import(PDFJS);
      library.GlobalWorkerOptions.workerSrc = WORKER;
      return await library.getDocument(url).promise;
    },
  );
  const drawn = async (figure, document) => {
    const page = await document.getPage(Number(figure.dataset.page));
    const viewport = page.getViewport({ scale: 2 });
    const canvas = Object.assign(window.document.createElement("canvas"), { width: viewport.width, height: viewport.height });
    await page.render({ canvasContext: canvas.getContext("2d"), viewport, canvas }).promise;
    figure.replaceChildren(canvas);
  };
  createEffect(() => {
    blocks();
    settings().pace;
    settings().face;
    if (pdf() === undefined) return;
    queueMicrotask(() => {
      for (const figure of scroller.querySelectorAll("figure[data-page]:empty")) drawn(figure, pdf());
    });
  });

  const Faces = (faced) => (
    <div class={`kit-choice ${faced.class}`} role="group" aria-label="face">
      <button aria-pressed={String(settings().face === "original")} onClick={() => set({ face: "original" })}>original</button>
      <button aria-pressed={String(settings().face === "reader")} onClick={() => set({ face: "reader" })}>reader</button>
    </div>
  );

  const Next = () => (
    <div class="rd-stage is-end">
      <span class="kit-label">chapter read</span>
      <Show when={following()}>
        {(next) => (
          <button class="kit-seg rd-next" onClick={() => turn(next().id)}>
            next · {next().title}
          </button>
        )}
      </Show>
    </div>
  );

  const cortex = () => (props.buffer.mode.daemon === null ? props.terminal.client.runtime.cortex : props.buffer.mode.daemon.cortex);
  const readable = () =>
    cortex()
      .find({ type: "dialogue", via: "render" })
      .some((faculty) => faculty.channels.in.includes("document"));

  const Intake = () => {
    const [options, setOptions] = createSignal(held().intake.options);
    const change = (patch) => setOptions({ ...options(), ...patch });
    const Screen = SCREENS[options().kind];
    return (
      <div class="rd-empty">
        <div class="card">
          <div class="big">{held().intake.url === null ? "dropped" : sourced(held().intake.url)}</div>
          <span class="kit-label">{options().kind} · {held().intake.type}</span>
          <Screen options={options()} set={change} fetch={add} readable={readable} />
          <div class="rd-go">
            <Show when={held().article !== null}>
              <button class="kit-seg" onClick={() => settle({ intake: null })}>cancel</button>
            </Show>
            <button class="kit-seg rd-read" onClick={() => parse(options())}>read</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div class="kit rd-root">
      <div class="rd-body">
        <main class="rd-frame" onPointerMove={neared} onPointerLeave={() => setNear(false)}>
          <Show when={(held().article === null || shelved()) && held().intake === null && parsing() === null}>
            <div
              class="rd-empty"
              classList={{ "is-over": over() }}
              onDragOver={(event) => { event.preventDefault(); setOver(true); }}
              onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOver(false); }}
              onDrop={drop}
              onPaste={paste}
            >
              <div class="card" tabindex="0">
                <svg class="rd-glyph" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path d="M14 6h26l10 10v42H14z" />
                  <path d="M40 6v10h10" />
                  <path d="M21 27h22M21 34h22M21 41h15" />
                  <path d="M21 48h8" stroke-dasharray="2 3" />
                </svg>
                <div class="big">nothing in the buffer</div>
                <div class="kit-field is-repl" style="min-height: 44px">
                  <span class="p">/add</span>
                  <input
                    aria-label="article or book url"
                    placeholder="https://archive.org/details/tides"
                    value={address()}
                    onInput={(event) => setAddress(event.target.value)}
                    onKeyDown={(event) => { if (event.key === "Enter") add(); }}
                  />
                  <button class="kit-seg" style="color: var(--signal-primary-ink); box-shadow: inset 0 0 0 1px var(--signal-primary-ink)" onClick={() => add()}>add</button>
                </div>
                <div class="kit-label rd-hint">or drop a file · paste — epub · pdf · html · markdown · org · text</div>
                <Show when={reading().length > 0}>
                  <div class="rd-recent">
                    <span class="kit-label">currently reading</span>
                    <For each={reading()}>
                      {(entry) => (
                        <button
                          class="rd-rec"
                          onClick={() => {
                            setShelved(false);
                            return props.terminal.repl.dispatch(`/thread ${entry.buffer.thread.id}`);
                          }}
                        >
                          <span class="sign">◆</span>
                          <span class="t">{entry.data.article.title}</span>
                          <span />
                          <span class="v">{Object.keys(entry.data.done).length} done</span>
                        </button>
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            </div>
          </Show>

          <Show when={parsing()}>
            <div class="rd-empty">
              <div class="rd-load" role="status" aria-label="processing">
                <div class="head">
                  <span class="src">{parsing().replace(/^https?:\/\//, "")}</span>
                </div>
                <For each={steps()}>
                  {(packet) => (
                    <div class="rd-step-row is-done">
                      <span class="kit-dot is-healthy" />
                      <span class="n">{packet.step}</span>
                      <span class="v">{packet.value}</span>
                    </div>
                  )}
                </For>
                <div class={`rd-step-row ${failed() ? "is-failed" : "is-now"}`}>
                  <span class={`kit-dot ${failed() ? "is-fault" : "is-running"}`} />
                  <span class="n">{failed() ? "failed" : "…"}</span>
                  <span class="v" />
                </div>
                <Show when={failed()}>
                  <button class="kit-seg" style="align-self: flex-start" onClick={() => setParsing(null)}>back</button>
                </Show>
              </div>
            </div>
          </Show>

          <Show when={held().intake !== null && parsing() === null}>
            <Intake />
          </Show>

          <Show when={held().article !== null && !shelved() && held().intake === null && parsing() === null}>
            <div class="rd-top" classList={{ "is-away": scrolled() && !near() }}>
              <button class="kit-seg" aria-label="back" title="back" onClick={back}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path d="M4 11l8-7 8 7" />
                  <path d="M6 9.5V20h4.5v-6h3v6H18V9.5" />
                </svg>
              </button>
              <span class="kit-dot is-healthy" />
              <Show when={held().article.url !== null} fallback={<span class="src">{held().article.title}</span>}>
                <a class="src" href={held().article.url} target="_blank" rel="noopener noreferrer" title={held().article.url}>{sourced(held().article.url)}</a>
              </Show>
              <Show when={chapters().length > 1}>
                <button ref={contents} class="kit-seg rd-chapter" classList={{ "is-open": listing() }} aria-expanded={String(listing())} aria-label="contents" onClick={() => setListing(!listing())}>
                  <span>{chapter() + 1}/{chapters().length}</span>
                  <span class="rd-wide">{chapters()[chapter()].title}</span>
                </button>
              </Show>
              <span class="gap" />
              <button class="kit-seg" disabled={Object.keys(held().done).length === 0} onClick={undo} aria-label="undo last done">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path d="M9 14L4 9l5-5" />
                  <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
                </svg>
                <span class="rd-wide">undo</span>
              </button>
              <button class="kit-seg" aria-label="parse again" title="parse again" onClick={reopen}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path d="M20 12a8 8 0 1 1-2.3-5.7" />
                  <path d="M20 4v5h-5" />
                </svg>
              </button>
              <Faces class="rd-wide" />
              <button class="kit-seg" classList={{ "is-open": settings().pace === "block" }} aria-pressed={String(settings().pace === "block")} aria-label="block by block" title="block by block" onClick={() => pace("block")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <rect x="4" y="8" width="16" height="8" rx="1" />
                  <path d="M7 4h10M7 20h10" stroke-dasharray="2 3" />
                </svg>
              </button>
              <button class="kit-seg" classList={{ "is-open": settings().pace === "speed" }} aria-pressed={String(settings().pace === "speed")} aria-label="speed reader" title="speed reader" onClick={() => pace("speed")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path d="M13 3L5 14h6l-1 7 8-11h-6z" />
                </svg>
              </button>
              <button ref={toggle} class="kit-seg" classList={{ "is-open": open() }} aria-expanded={String(open())} aria-label="reader settings" onClick={() => setOpen(!open())}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
                  <rect x="14" y="5" width="4" height="4" rx="1" />
                  <rect x="8" y="15" width="4" height="4" rx="1" />
                </svg>
              </button>
            </div>

            <Show when={listing()}>
              <nav ref={toc} class="rd-toc" aria-label="contents">
                <For each={chapters()}>
                  {(entry) => (
                    <button class="rd-rec" classList={{ "is-cur": entry.id === opened().dataset.chapter }} onClick={() => turn(entry.id)}>
                      <span class="sign">{entry.id === opened().dataset.chapter ? "◆" : "◇"}</span>
                      <span class="t">{entry.title}</span>
                      <span />
                      <span class="v">{entry.left === 0 ? "read" : `${entry.left} left`}</span>
                    </button>
                  )}
                </For>
              </nav>
            </Show>

            <Show when={open()}>
              <div ref={panel} class="rd-set" role="group" aria-label="reader settings">
                <span class="kit-label rd-narrow">face</span>
                <Faces class="rd-narrow" />
                <span class="kit-label">type</span>
                <div class="kit-choice">
                  <For each={TYPES}>
                    {(type) => <button aria-pressed={String(settings().type === type)} onClick={() => set({ type })}>{type}</button>}
                  </For>
                </div>
                <span class="kit-label">size</span>
                <div class="rd-step">
                  <button aria-label="smaller" onClick={() => set({ size: Math.max(14, settings().size - 1) })}>−</button>
                  <span>{settings().size}px</span>
                  <button aria-label="larger" onClick={() => set({ size: Math.min(28, settings().size + 1) })}>+</button>
                </div>
                <span class="kit-label">lines</span>
                <div class="kit-choice">
                  <For each={Object.keys(LEADING)}>
                    {(leading) => <button aria-pressed={String(settings().leading === leading)} onClick={() => set({ leading })}>{leading}</button>}
                  </For>
                </div>
                <span class="kit-label">width</span>
                <div class="kit-choice">
                  <For each={Object.keys(WIDTH)}>
                    {(width) => <button aria-pressed={String(settings().width === width)} onClick={() => set({ width })}>{width}</button>}
                  </For>
                </div>
                <span class="kit-label">sidebar</span>
                <div class="kit-choice">
                  <button aria-pressed={String(settings().rail)} onClick={() => set({ rail: true })}>shown</button>
                  <button aria-pressed={String(!settings().rail)} onClick={() => set({ rail: false })}>hidden</button>
                </div>
                <Show when={settings().pace === "block"}>
                  <span class="kit-label">step</span>
                  <div class="kit-choice">
                    <For each={UNITS}>
                      {(unit) => <button aria-pressed={String(settings().unit === unit)} onClick={() => set({ unit })}>{unit}</button>}
                    </For>
                  </div>
                </Show>
                <Show when={settings().pace === "speed"}>
                  <span class="kit-label">style</span>
                  <div class="kit-choice">
                    <For each={STYLES}>
                      {(style) => <button aria-pressed={String(settings().style === style)} onClick={() => set({ style })}>{style}</button>}
                    </For>
                  </div>
                  <span class="kit-label">speed</span>
                  <div class="rd-step">
                    <button aria-label="slower" onClick={() => set({ wpm: Math.max(100, settings().wpm - 25) })}>−</button>
                    <span>{settings().wpm} wpm</span>
                    <button aria-label="faster" onClick={() => set({ wpm: Math.min(1000, settings().wpm + 25) })}>+</button>
                  </div>
                  <Show when={settings().style !== "word"}>
                    <span class="kit-label">chunk</span>
                    <div class="rd-step">
                      <button aria-label="fewer words" onClick={() => set({ chunk: Math.max(1, settings().chunk - 1) })}>−</button>
                      <span>{settings().chunk}</span>
                      <button aria-label="more words" onClick={() => set({ chunk: Math.min(5, settings().chunk + 1) })}>+</button>
                    </div>
                  </Show>
                  <span class="kit-label">pauses</span>
                  <div class="kit-choice">
                    <For each={PAUSES}>
                      {(pauses) => <button aria-pressed={String(settings().pauses === pauses)} onClick={() => set({ pauses })}>{pauses}</button>}
                    </For>
                  </div>
                  <span class="kit-label">context</span>
                  <div class="kit-choice">
                    <button aria-pressed={String(settings().context)} onClick={() => set({ context: true })}>sentence</button>
                    <button aria-pressed={String(!settings().context)} onClick={() => set({ context: false })}>off</button>
                  </div>
                </Show>
              </div>
            </Show>

            <Show when={book()} fallback={<div class="rd-empty"><span class="kit-label">opening the book…</span></div>}>
              <div class="rd-mid">
                <Show when={settings().rail}>
                <nav class="rd-rail" aria-label="blocks">
                  <For each={blocks()}>
                    {(cell) => (
                      <button
                        class="rd-cell"
                        classList={{
                          "is-done": cell.done,
                          "is-media": !cell.done && cell.kind === "image",
                          "is-framed": framed().has(`blk-${cell.id}`),
                        }}
                        aria-label={`${cell.id} · ${cell.kind}${cell.done ? " · done" : ""}`}
                        onClick={() => {
                          if (settings().face !== "reader" || settings().pace !== "scroll") return;
                          return cell.done ? revisit(cell.id) : reveal(cell.id);
                        }}
                      />
                    )}
                  </For>
                  <span class="lbl">{left().length} left · {minutes(left(), settings().pace === "speed" ? settings().wpm : 200)} min</span>
                </nav>
                </Show>

                <div class="rd-scroll" ref={scroller} onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 10)}>
                  <Show when={settings().face === "reader" && settings().pace !== "scroll"}>
                    <div class="rd-sheet f-reader rd-paced" classList={{ "is-speed": settings().pace === "speed" }} role="button" tabindex="0" onClick={paced}>
                      <article
                        class={`rd-art t-${settings().type}`}
                        style={{ "--rd-size": `${settings().size}px`, "--rd-lh": LEADING[settings().leading], "--rd-measure": WIDTH[settings().width] }}
                      >
                        <Show when={live().length > 0} fallback={<Next />}>
                          <Show when={settings().pace === "block"}>
                            <div class="rd-stage" aria-label="done, next">
                              <Show
                                when={settings().unit === "sentence" && !halted()}
                                fallback={
                                  <For each={settings().unit === "section" ? section() : [now().id]}>
                                    {(id) => <section class={`blk k-${block(id).kind}`} innerHTML={block(id).html} />}
                                  </For>
                                }
                              >
                                <section class={`blk k-${now().kind}`}>
                                  <p>{said().map((token) => token.text).join(" ")}</p>
                                </section>
                              </Show>
                            </div>
                          </Show>
                          <Show when={settings().pace === "speed"}>
                            <div class="rd-deck">
                              <button class="kit-seg" aria-label="sentence back" disabled={halted()} onClick={() => hop(-1)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M18 6l-8 6 8 6zM7 6v12" /></svg>
                              </button>
                              <button class="kit-seg" aria-label={playing() ? "pause" : "play"} onClick={play}>
                                <Show
                                  when={playing()}
                                  fallback={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M7 5l12 7-12 7z" /></svg>}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M8 5v14M16 5v14" /></svg>
                                </Show>
                                <span>{playing() ? "pause" : "play"}</span>
                              </button>
                              <button class="kit-seg" aria-label="sentence forward" disabled={halted()} onClick={() => hop(1)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 6l8 6-8 6zM17 6v12" /></svg>
                              </button>
                              <div class="rd-step">
                                <button aria-label="slower" onClick={() => set({ wpm: Math.max(100, settings().wpm - 25) })}>−</button>
                                <span>{settings().wpm} wpm</span>
                                <button aria-label="faster" onClick={() => set({ wpm: Math.min(1000, settings().wpm + 25) })}>+</button>
                              </div>
                            </div>
                            <div class="kit-meter rd-progress"><i style={{ "--v": `${halted() ? 0 : Math.round((index() / flow().length) * 100)}%` }} /></div>
                            <div class="rd-stage" classList={{ "is-playing": playing() }} aria-label={playing() ? "pause" : "play"}>
                              <Show when={!halted()} fallback={<section class={`blk k-${now().kind}`} innerHTML={now().html} />}>
                                <Show when={settings().style === "pacer"}>
                                  <section class={`blk k-${now().kind} rd-pacer`}>
                                    <p>
                                      <For each={flow()}>
                                        {(token, place) => (
                                          <span classList={{ on: place() >= index() && place() < index() + width() }}>{token.text} </span>
                                        )}
                                      </For>
                                    </p>
                                  </section>
                                </Show>
                                <Show when={settings().style !== "pacer"}>
                                  <Show
                                    when={settings().style === "word" && !frame()[0].text.includes(" ")}
                                    fallback={<div class="rd-flash">{frame().map((token) => token.text).join(" ")}</div>}
                                  >
                                    <div class="rd-flash rd-word">
                                      <span class="a">{pivot(frame()[0].text)[0]}</span>
                                      <span class="o">{pivot(frame()[0].text)[1]}</span>
                                      <span class="z">{pivot(frame()[0].text)[2]}</span>
                                    </div>
                                  </Show>
                                  <Show when={settings().context}>
                                    <div class="rd-context">{said().map((token) => token.text).join(" ")}</div>
                                  </Show>
                                </Show>
                              </Show>
                            </div>
                          </Show>
                        </Show>
                      </article>
                    </div>
                  </Show>
                  <Show when={settings().face === "original" || settings().pace === "scroll"}>
                    <Show
                      when={settings().face === "original"}
                      fallback={
                        <div class="rd-sheet f-reader">
                          <div class="page">
                            <article
                              class={`rd-art t-${settings().type}`}
                              style={{ "--rd-size": `${settings().size}px`, "--rd-lh": LEADING[settings().leading], "--rd-measure": WIDTH[settings().width] }}
                              onClick={follow}
                            >
                              <For each={visible()}>
                                {(id) => (
                                  <section
                                    classList={{
                                      blk: true,
                                      [`k-${block(id).kind}`]: true,
                                      "is-done": block(id).done,
                                      "is-drag": dragged(id) !== null && dragged(id).live,
                                      "is-armed": dragged(id) !== null && dragged(id).armed,
                                    }}
                                    id={`blk-${id}`}
                                    ref={watched}
                                    style={{ "--dx": `${shift(id)}px` }}
                                    onPointerDown={(event) => down(event, id)}
                                    onPointerMove={move}
                                    onPointerUp={up}
                                    onPointerCancel={cancel}
                                  >
                                    <div class="acts r">
                                      <button class="act done" aria-label={`done with ${id}`} onClick={() => done(id)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                                        </svg>
                                      </button>
                                    </div>
                                    <div class="txt" innerHTML={block(id).html} />
                                  </section>
                                )}
                              </For>
                              <Show when={live().length === 0}>
                                <Next />
                              </Show>
                            </article>
                          </div>
                        </div>
                      }
                    >
                      <div class="rd-sheet f-original">
                        <Show when={original()}>
                          {(file) => (
                            <Show
                              when={file().mime.startsWith("text/html")}
                              fallback={
                                <Show when={file().mime.startsWith("application/pdf")} fallback={<div class="rd-empty"><span class="kit-label">no original face for {file().mime}</span></div>}>
                                  <iframe src={file().url} title={held().article.title} />
                                </Show>
                              }
                            >
                              <iframe sandbox="" src={file().url} title={held().article.title} />
                            </Show>
                          )}
                        </Show>
                      </div>
                    </Show>
                  </Show>
                </div>
              </div>
            </Show>
          </Show>
        </main>
      </div>
    </div>
  );
};

const Fault = (props) => (
  <div class="kit rd-root">
    <div class="rd-body">
      <main class="rd-frame">
        <div class="rd-empty">
          <div class="rd-load" role="alert">
            <div class="head">
              <span class="src">buffer.data is not a Reading</span>
            </div>
            <For each={props.faults}>
              {(fault) => (
                <div class="rd-step-row is-failed" title={`${fault.instancePath} ${fault.message}`}>
                  <span class="kit-dot is-fault" />
                  <span class="n">{fault.instancePath}</span>
                  <span class="v">{fault.message}</span>
                </div>
              )}
            </For>
            <button class="kit-seg" style="align-self: flex-start" onClick={props.wipe}>wipe</button>
          </div>
        </div>
      </main>
    </div>
  </div>
);

const Held = (props) => {
  const stored = from(props.buffer.$data);
  const faults = createMemo(() => [...Reading.errors(Reading.cast(stored()))]);
  const wipe = () =>
    props.terminal.client.runtime.entities.buffer.updateOne(
      { id: props.buffer.id },
      { data: Reading.cast({}) },
    );
  return (
    <Show when={faults().length === 0} fallback={<Fault faults={faults()} wipe={wipe} />}>
      <Reader {...props} />
    </Show>
  );
};

export default (element, props) => {
  const shadow = element.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = sheet;
  shadow.append(style);
  const dispose = render(() => <Held {...props} />, shadow);
  return { destroy: dispose };
};
