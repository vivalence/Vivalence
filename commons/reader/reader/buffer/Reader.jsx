import { createMemo, createResource, createSignal, For, from, onMount, Show } from "solid-js";
import { render } from "solid-js/web";
import { persistentAtom } from "@nanostores/persistent";
import { Reading, Settings } from "../schematics.js";
import sheet from "./reader.css";

const SWIPE = 110;
const STEPS = ["fetch", "snapshot", "parse"];
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
};

const $settings = persistentAtom("viva.mode.reader.settings", Settings.cast({}), {
  encode: JSON.stringify,
  decode: (text) => Settings.cast(JSON.parse(text)),
});
const set = (patch) => $settings.set({ ...$settings.get(), ...patch });

const parsed = (html) => new DOMParser().parseFromString(html, "text/html").body;
const words = (text) => text.trim().split(/\s+/).filter(Boolean).length;
const listed = (html) =>
  [...parsed(html).children].map((node) => ({
    id: node.dataset.block,
    kind: KIND[node.tagName] ?? "block",
    done: node.hasAttribute("data-done"),
    words: words(node.textContent),
    html: node.outerHTML,
  }));
const minutes = (blocks) => Math.max(1, Math.ceil(blocks.reduce((sum, block) => sum + block.words, 0) / 200));
const measured = (html) => {
  const blocks = listed(html);
  const left = blocks.filter((block) => !block.done);
  return {
    left: left.length,
    minutes: minutes(left),
    percent: Math.round(((blocks.length - left.length) / blocks.length) * 100),
  };
};
const sourced = (address) => {
  const url = new URL(address);
  return `${url.host}${url.pathname.replace(/\/$/, "")}`;
};

export const Reader = (props) => {
  const stored = from(props.buffer.$data);
  const held = createMemo(() => Reading.cast(stored()));
  const settings = from($settings);
  const files = from(props.buffer.$files);
  const [address, setAddress] = createSignal("");
  const [parsing, setParsing] = createSignal(null);
  const [steps, setSteps] = createSignal([]);
  const [failed, setFailed] = createSignal(false);
  const [open, setOpen] = createSignal(false);
  const [drag, setDrag] = createSignal(null);
  let scroller;
  let swipe = null;

  const settle = (data) =>
    props.terminal.client.runtime.entities.buffer.updateOne(
      { id: props.buffer.id },
      { data: Reading.cast({ ...props.buffer.data, ...data }) },
    );

  const surface = () => parsed(props.buffer.data.article.html);
  const marked = (edit) => {
    const body = surface();
    edit(body);
    return settle({ article: { ...props.buffer.data.article, html: body.innerHTML } });
  };
  const done = async (id) => {
    await marked((body) => body.querySelector(`[data-block="${id}"]`).setAttribute("data-done", new Date().toISOString()));
    setDrag(null);
  };
  const newest = (body) =>
    [...body.querySelectorAll("[data-done]")].sort((a, b) => b.dataset.done.localeCompare(a.dataset.done))[0];
  const undo = () => marked((body) => newest(body).removeAttribute("data-done"));

  const blocks = createMemo(() => (held().article === null ? [] : listed(held().article.html)));
  const block = (id) => blocks().find((candidate) => candidate.id === id);
  const live = createMemo(() => blocks().filter((candidate) => !candidate.done).map((candidate) => candidate.id));
  const left = () => blocks().filter((candidate) => !candidate.done);
  const original = () => files().find((file) => file.id === held().article.original);

  const [buffers] = createResource(() => props.buffer.mode.entities.buffer.find({}), { initialValue: [] });
  const reading = () => buffers()
    .filter((buffer) => Reading.cast(buffer.data).article !== null);

  const typeface = async () => {
    const [file] = await props.buffer.mode.entities.file.find({ path: "OpenDyslexic-Regular.woff2" });
    const face = new FontFace("OpenDyslexic", `url(${file.url})`);
    document.fonts.add(await face.load());
  };
  onMount(typeface);

  const add = async () => {
    const url = address().trim();
    if (!url) return;
    setSteps([]);
    setFailed(false);
    setParsing(url);
    try {
      for await (const packet of props.buffer.mode.call.add({ buffer: props.buffer.id, url })) {
        setSteps((seen) => [...seen, packet]);
      }
      await props.terminal.client.runtime.entities.buffer.find({ id: props.buffer.id });
      setParsing(null);
      setAddress("");
    } catch (error) {
      console.error("[reader] /add", error);
      setFailed(true);
    }
  };
  const stepped = (index) => {
    const seen = steps();
    if (index < seen.length) return { state: "done", dot: "is-healthy", value: seen[index].value };
    if (index > seen.length) return { state: "next", dot: "", value: "" };
    return failed() ? { state: "failed", dot: "is-fault", value: "failed" } : { state: "now", dot: "is-running", value: "…" };
  };

  const down = (event, id) => {
    if (event.button > 0) return;
    if (event.target.closest("button, a, input")) return;
    swipe = { id, x: event.clientX, y: event.clientY, live: false, pointer: event.pointerId, element: event.currentTarget };
  };
  const move = (event) => {
    if (swipe === null) return;
    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    if (!swipe.live) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        swipe = null;
        return;
      }
      if (Math.abs(dx) < 12) return;
      swipe.live = true;
      swipe.element.setPointerCapture(swipe.pointer);
      getSelection().removeAllRanges();
    }
    setDrag({ id: swipe.id, dx, live: true });
  };
  const up = (event) => {
    const ended = swipe;
    swipe = null;
    if (ended === null || !ended.live) return;
    const dx = event.clientX - ended.x;
    if (Math.abs(dx) > SWIPE) {
      setDrag({ id: ended.id, dx: dx > 0 ? 900 : -900, live: false });
      setTimeout(() => done(ended.id), 200);
      return;
    }
    setDrag({ id: ended.id, dx: 0, live: false });
    setTimeout(() => setDrag(null), 220);
  };
  const dragged = (id) => (drag() !== null && drag().id === id ? drag() : null);
  const shift = (id) => (dragged(id) === null ? 0 : dragged(id).dx);

  const follow = (event) => {
    const link = event.target.closest("a[href]");
    if (link === null) return;
    event.preventDefault();
    window.open(link.href, "_blank", "noopener");
  };
  const reveal = (id) => scroller.querySelector(`[id="blk-${id}"]`).scrollIntoView({ block: "center", behavior: "smooth" });

  const Faces = (faced) => (
    <div class={`kit-choice ${faced.class}`} role="group" aria-label="face">
      <button aria-pressed={String(held().face === "original")} onClick={() => settle({ face: "original" })}>original</button>
      <button aria-pressed={String(held().face === "reader")} onClick={() => settle({ face: "reader" })}>reader</button>
    </div>
  );

  return (
    <div class="kit rd-root">
      <div class="rd-body">
        <main class="rd-frame">
          <Show when={held().article === null && parsing() === null}>
            <div class="rd-empty">
              <div class="card">
                <svg class="rd-glyph" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path d="M14 6h26l10 10v42H14z" />
                  <path d="M40 6v10h10" />
                  <path d="M21 27h22M21 34h22M21 41h15" />
                  <path d="M21 48h8" stroke-dasharray="2 3" />
                </svg>
                <div class="big">no article in the buffer</div>
                <div class="kit-field is-repl" style="min-height: 44px">
                  <span class="p">/add</span>
                  <input
                    aria-label="article url"
                    placeholder="https://example.org/tides"
                    value={address()}
                    onInput={(event) => setAddress(event.target.value)}
                    onKeyDown={(event) => { if (event.key === "Enter") add(); }}
                  />
                  <button class="kit-seg" style="color: var(--signal-primary-ink); box-shadow: inset 0 0 0 1px var(--signal-primary-ink)" onClick={add}>add</button>
                </div>
                <Show when={reading().length > 0}>
                  <div class="rd-recent">
                    <span class="kit-label">currently reading</span>
                    <For each={reading()}>
                      {(buffer) => {
                        const measure = measured(buffer.data.article.html);
                        return (
                          <button class="rd-rec" onClick={() => props.terminal.repl.dispatch(`/thread ${buffer.thread.id}`)}>
                            <span class="sign">◆</span>
                            <span class="t">{buffer.data.article.title}</span>
                            <span class="kit-meter"><i style={{ "--v": `${measure.percent}%` }} /></span>
                            <span class="v">{measure.left} left · {measure.minutes} min</span>
                          </button>
                        );
                      }}
                    </For>
                  </div>
                </Show>
              </div>
            </div>
          </Show>

          <Show when={parsing()}>
            <div class="rd-empty">
              <div class="rd-load" role="status" aria-label="processing article">
                <div class="head">
                  <span class="src">{parsing().replace(/^https?:\/\//, "")}</span>
                  <span class="pct">{Math.round((steps().length / STEPS.length) * 100)}%</span>
                </div>
                <div class="kit-meter bar"><i style={{ "--v": `${Math.round((steps().length / STEPS.length) * 100)}%` }} /></div>
                <For each={STEPS}>
                  {(name, index) => (
                    <div class={`rd-step-row is-${stepped(index()).state}`}>
                      <span class={`kit-dot ${stepped(index()).dot}`} />
                      <span class="n">{name}</span>
                      <span class="v">{stepped(index()).value}</span>
                    </div>
                  )}
                </For>
                <Show when={failed()}>
                  <button class="kit-seg" style="align-self: flex-start" onClick={() => setParsing(null)}>back</button>
                </Show>
              </div>
            </div>
          </Show>

          <Show when={held().article !== null && parsing() === null}>
            <div class="rd-top">
              <span class="kit-dot is-healthy" classList={{ "rd-busy": held().article.parse === "refining" }} />
              <a class="src" href={held().article.url} target="_blank" rel="noopener noreferrer" title={held().article.url}>{sourced(held().article.url)}</a>
              <Show when={held().article.parse === "refining"}><span class="kit-label">refining</span></Show>
              <span class="gap" />
              <button class="kit-seg" disabled={left().length === blocks().length} onClick={undo} aria-label="undo last done">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path d="M9 14L4 9l5-5" />
                  <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
                </svg>
                <span class="rd-wide">undo</span>
              </button>
              <Faces class="rd-wide" />
              <button class="kit-seg" classList={{ "is-open": open() }} aria-expanded={String(open())} aria-label="reader settings" onClick={() => setOpen(!open())}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
                  <rect x="14" y="5" width="4" height="4" rx="1" />
                  <rect x="8" y="15" width="4" height="4" rx="1" />
                </svg>
              </button>
            </div>

            <Show when={open()}>
              <div class="rd-set" role="group" aria-label="reader settings">
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
              </div>
            </Show>

            <div class="rd-mid">
              <nav class="rd-rail" aria-label="blocks">
                <For each={blocks()}>
                  {(cell) => (
                    <button
                      class="rd-cell"
                      classList={{ "is-done": cell.done, "is-media": !cell.done && cell.kind === "image" }}
                      aria-label={`${cell.id} · ${cell.kind}${cell.done ? " · done" : ""}`}
                      onClick={() => { if (!cell.done && held().face === "reader") reveal(cell.id); }}
                    />
                  )}
                </For>
                <span class="lbl">{left().length} left · {minutes(left())} min</span>
              </nav>

              <div class="rd-scroll" ref={scroller}>
                <Show
                  when={held().face === "original"}
                  fallback={
                    <div class="rd-sheet f-reader">
                      <div class="page">
                        <article
                          class={`rd-art t-${settings().type}`}
                          style={{ "--rd-size": `${settings().size}px`, "--rd-lh": LEADING[settings().leading], "--rd-measure": WIDTH[settings().width] }}
                          onClick={follow}
                        >
                          <For each={live()}>
                            {(id) => (
                              <section
                                classList={{
                                  blk: true,
                                  [`k-${block(id).kind}`]: true,
                                  "is-drag": dragged(id) !== null && dragged(id).live,
                                  "is-armed": dragged(id) !== null && dragged(id).live && Math.abs(shift(id)) > SWIPE,
                                }}
                                id={`blk-${id}`}
                                style={{ transform: `translateX(${shift(id)}px)`, opacity: Math.max(0.2, 1 - Math.abs(shift(id)) / 520).toFixed(2) }}
                                onPointerDown={(event) => down(event, id)}
                                onPointerMove={move}
                                onPointerUp={up}
                                onPointerCancel={up}
                              >
                                <div class="acts r">
                                  <button class="act done" aria-label={`done with ${id}`} onClick={() => done(id)}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                                    </svg>
                                  </button>
                                </div>
                                <div innerHTML={block(id).html} />
                              </section>
                            )}
                          </For>
                        </article>
                      </div>
                    </div>
                  }
                >
                  <div class="rd-sheet f-original">
                    <Show when={original()}>{(file) => <iframe sandbox="" src={file().url} title={held().article.title} />}</Show>
                  </div>
                </Show>
              </div>
            </div>
          </Show>
        </main>
      </div>
    </div>
  );
};

export default (element, props) => {
  const shadow = element.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = sheet;
  shadow.append(style);
  const dispose = render(() => <Reader {...props} />, shadow);
  return { destroy: dispose };
};
