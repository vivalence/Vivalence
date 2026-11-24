import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  from,
  on,
  onCleanup,
  Show,
} from "solid-js";
import { createStore, produce, unwrap } from "solid-js/store";
import { render } from "solid-js/web";
import { Article, Desk, Settings } from "../schematics.js";
import {
  caret,
  figured,
  KEYS,
  markup,
  mounted,
  outline,
  prefixed,
  reached,
  searched,
  sheet,
  tuned,
  wrapped,
} from "./editor.js";
import styles from "./desk.css";

const DOTS = { fault: "is-fault", published: "is-healthy", unlisted: "is-needs", draft: "" };

const GROUPS = [
  [(source) => source.fault !== null, "faults"],
  [(source) => source.article.status === "draft", "drafts"],
  [(source) => source.article.date !== undefined, "essays"],
  [() => true, "pages"],
];

const STATUSES = ["draft", "unlisted", "published"];

const MODES = [
  ["write", "write", "Mod-Alt-Digit1"],
  ["split", "split", "Mod-Alt-Digit2"],
  ["preview", "page", "Mod-Alt-Digit3"],
  ["focus", "focus", "Mod-Period"],
];

const DEVICES = [
  ["desktop", "▭", "100%"],
  ["tablet", "▯", "820px"],
  ["phone", "▮", "390px"],
];

const TABS = [
  ["post", "post"],
  ["media", "media"],
  ["outline", "outline"],
  ["stats", "stats"],
];

const MARKS = [
  ["bold", "B", "bold"],
  ["italic", "I", "italic"],
  ["strike", "S", "strike through"],
  ["code", "</>", "code"],
  ["link", "⌁", "link"],
  ["math", "∑", "math"],
  ["note", "¹", "footnote"],
];

const LINES = [
  ["heading", "H", "heading"],
  ["quote", "❝", "quote"],
  ["list", "•", "list"],
  ["numbered", "1.", "numbered list"],
  ["task", "☐", "task"],
];

const RANGES = [
  ["size", "size", 12, 26, 1, "px"],
  ["measure", "measure", 40, 140, 2, "ch"],
  ["leading", "leading", 1.2, 2.4, 0.05, ""],
];

const SWITCHES = [
  ["numbers", "line numbers"],
  ["typewriter", "typewriter scrolling"],
  ["dim", "dim other paragraphs"],
  ["spellcheck", "spelling"],
  ["sync", "page follows the sheet"],
  ["pressing", "a save presses the blog"],
];

const PAUSES = [0, 2, 5, 10, 30];

const LIMITS = { library: [180, 480], inspector: [240, 560], share: [0.2, 0.8] };

const NARROW = 760;

const COUNTS = [
  ["words", /\S+/g],
  ["characters", /[^\n]/g],
  ["sentences", /[^.!?\n]+[.!?]+/g],
  ["paragraphs", /(^|\n\n)\s*\S/g],
  ["links", /\]\(|\[\[/g],
  ["pictures", /!\[|\[\[\/images/g],
  ["notes", /\[\^[^\]]+\](?!:)|\[fn:[^\]]+\]/g],
];

const GLYPHS = { Mod: "⌘", Shift: "⇧", Alt: "⌥", Period: ".", Comma: ",", Backslash: "\\" };

const glyphed = (chord) =>
  chord
    .split("-")
    .map((part) => GLYPHS[part] ?? part.replace(/^(Key|Digit)/, ""))
    .join("");

const chorded = (event) =>
  [
    event.metaKey || event.ctrlKey ? "Mod" : "",
    event.shiftKey ? "Shift" : "",
    event.altKey ? "Alt" : "",
    event.code,
  ]
    .filter(Boolean)
    .join("-");

const state = (source) => (source.fault === null ? source.article.status : "fault");

const grouped = (source) => GROUPS.find(([held]) => held(source))[1];

const dated = (source) =>
  source.fault === null && source.article.date !== undefined ? source.article.date : "";

const today = () => {
  const now = new Date();
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((part) => String(part).padStart(2, "0"))
    .join(".");
};

const titled = (path) =>
  path
    .split("/")
    .at(-1)
    .replace(/\.(md|org)$/, "")
    .replaceAll(/[-_]+/g, " ");

const keyed = (draft) => JSON.stringify([draft.front, draft.body]);

const counted = (body, pattern) => (body.match(pattern) ?? []).length;

const known = (front) =>
  Article.cast(
    Object.fromEntries(Object.entries(front).filter(([key]) => key in Article.properties)),
  );

const pictured = (file) => file.mime.startsWith("image/");

const within = ([floor, ceiling], value) => Math.min(ceiling, Math.max(floor, value));

const fuzzy = (query, text) => {
  let at = 0;
  for (const letter of text.toLowerCase()) if (letter === query[at]) at++;
  return at === query.length;
};

const clock = () => new Date().toTimeString().slice(0, 5);

const Seam = (props) => {
  const [dragging, setDragging] = createSignal(false);
  let seam;
  let rect;
  const down = (event) => {
    event.preventDefault();
    seam.setPointerCapture(event.pointerId);
    rect = seam.parentElement.getBoundingClientRect();
    setDragging(true);
  };
  const move = (event) => {
    if (dragging()) props.onDrag(event, rect);
  };
  const up = () => {
    if (!dragging()) return;
    setDragging(false);
    props.onDone();
  };
  return (
    <div
      ref={seam}
      classList={{ seam: true, drag: dragging() }}
      title="drag to resize · double-click resets"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onLostPointerCapture={up}
      onDblClick={() => props.onReset()}
    />
  );
};

export const Blog = (props) => {
  const held = from(props.buffer.$data);
  const desk = createMemo(() => Desk.cast(held()));
  const open = () => desk().open;
  const settings = () => desk().settings;
  const [shelf, { refetch }] = createResource(() => props.buffer.mode.call.source.list());
  const [drafts, setDrafts] = createStore({});
  const [preview, setPreview] = createSignal("");
  const [fault, setFault] = createSignal(null);
  const [told, setTold] = createSignal("");
  const [query, setQuery] = createSignal("");
  const [fresh, setFresh] = createSignal(null);
  const [armed, setArmed] = createSignal(null);
  const [busy, setBusy] = createSignal(false);
  const [dragged, setDragged] = createSignal({});
  const [folded, setFolded] = createSignal([]);
  const [at, setAt] = createSignal({ line: 1, column: 1, chosen: 0 });
  const [palette, setPalette] = createSignal(null);
  const [picked, setPicked] = createSignal(0);
  const [tuning, setTuning] = createSignal(false);
  const [moving, setMoving] = createSignal("");
  const [stamp, setStamp] = createSignal("");
  const [narrow, setNarrow] = createSignal(false);
  const [drawer, setDrawer] = createSignal(null);
  const sheets = new Map();
  let root;
  let host;
  let frame;
  let view;
  let showing = null;
  let previewing;
  let saving;
  let ratio = 0;

  const editor = () => (view ??= mounted(host, host.getRootNode()));

  const settle = (data) =>
    props.terminal.client.runtime.entities.buffer.updateOne(
      { id: props.buffer.id },
      { data: Desk.cast({ ...desk(), ...data }) },
    );

  const tune = (data) => settle({ settings: { ...settings(), ...data } });

  const guarded = async (run) => {
    setFault(null);
    setBusy(true);
    try {
      await run();
    } catch (error) {
      setFault(error.message);
    } finally {
      setBusy(false);
    }
  };

  const draft = () => (open() === null ? undefined : drafts[open()]);

  const dirty = (path) => drafts[path] !== undefined && drafts[path].kept !== keyed(drafts[path]);

  const lying = () =>
    shelf() === undefined ? undefined : shelf().sources.find((source) => source.path === open());

  const live = () => lying() !== undefined && !["fault", "draft"].includes(state(lying()));

  const words = () => (draft() === undefined ? 0 : counted(draft().body, /\S+/g));

  const faults = () => (draft() === undefined ? [] : Article.faults(known(draft().front)));

  const width = (dock) => dragged()[dock] ?? desk()[dock].width;

  const share = () => dragged().share ?? desk().share;

  const mode = () => (narrow() && desk().mode === "split" ? "write" : desk().mode);

  const docked = (dock) =>
    narrow() ? drawer() === dock : desk()[dock].shown && desk().mode !== "focus";

  const shown = (sources) =>
    sources.filter((source) =>
      `${source.path} ${source.fault === null ? source.article.title : ""}`
        .toLowerCase()
        .includes(query().toLowerCase()),
    );

  const group = (name) =>
    shown(shelf().sources)
      .filter((source) => grouped(source) === name)
      .toSorted(
        (left, right) =>
          dated(right).localeCompare(dated(left)) || left.path.localeCompare(right.path),
      );

  const heading = () => {
    if (draft() === undefined) return null;
    return outline(open(), draft().body).findLast((entry) => entry.line <= at().line) ?? null;
  };

  const followed = () => {
    if (frame === undefined || frame.contentDocument === null) return;
    const scroller = frame.contentDocument.scrollingElement;
    if (scroller === null) return;
    scroller.scrollTop = ratio * (scroller.scrollHeight - scroller.clientHeight);
  };

  const scrolled = (event) => {
    const scroller = event.target;
    ratio = scroller.scrollTop / Math.max(1, scroller.scrollHeight - scroller.clientHeight);
    if (settings().sync) followed();
  };

  const uploaded = async (files) => {
    const paths = [];
    for (const file of [...files].filter((file) => file.type.startsWith("image/"))) {
      const placed = await props.buffer.mode.call.source.upload[file.name](
        {},
        { raw: { body: file.stream() }, headers: { "content-type": file.type } },
      );
      paths.push(placed.path);
    }
    const built = await props.buffer.mode.call.build();
    setTold(`${paths.length} placed · ${built.pages.length} pressed`);
    await refetch();
    return paths;
  };

  const placed = (path) => (event, sheetView) => {
    const files = event.type === "drop" ? event.dataTransfer.files : event.clipboardData.files;
    if (files.length === 0) return false;
    event.preventDefault();
    if (event.type === "drop") {
      const dropped = sheetView.posAtCoords({ x: event.clientX, y: event.clientY });
      if (dropped !== null) sheetView.dispatch({ selection: { anchor: dropped } });
    }
    guarded(async () => {
      const paths = await uploaded(files);
      figured(sheetView, paths.map(markup(path).figure).join("\n\n"));
    });
    return true;
  };

  const load = async (path) => {
    const source = await props.buffer.mode.call.source.read({ path });
    setDrafts(path, { front: source.front, body: source.body, kept: keyed(source) });
    sheets.set(
      path,
      sheet({
        path,
        body: source.body,
        settings: settings(),
        typed: (body) => setDrafts(path, "body", body),
        moved: setAt,
        scrolled,
        dropped: placed(path),
        pasted: placed(path),
      }),
    );
  };

  createEffect(
    on(open, (path) => {
      setArmed(null);
      setMoving(path ?? "");
      if (sheets.has(showing)) sheets.set(showing, editor().state);
      showing = null;
      if (path === null) return setPreview("");
      guarded(async () => {
        if (drafts[path] === undefined) await load(path);
        if (open() !== path) return;
        editor().setState(sheets.get(path));
        tuned(editor(), settings());
        setAt(caret(editor().state));
        showing = path;
        if (mode() !== "preview" && !narrow()) editor().focus();
      });
    }),
  );

  createEffect(
    on(settings, (now) => {
      if (showing !== null) tuned(editor(), now);
    }),
  );

  createEffect(() => {
    const path = open();
    if (path === null || drafts[path] === undefined) return;
    if (["write", "focus"].includes(mode())) return;
    const typed = { path, front: { ...drafts[path].front }, body: drafts[path].body };
    clearTimeout(previewing);
    previewing = setTimeout(async () => {
      try {
        const pressed = await props.buffer.mode.call.source.preview(typed);
        if (open() === path) setPreview(pressed.html);
      } catch (error) {
        setFault(error.message);
      }
    }, 300);
  });

  createEffect(() => {
    const path = open();
    const pause = settings().autosave;
    if (path === null || pause === 0 || !dirty(path)) return;
    clearTimeout(saving);
    saving = setTimeout(() => guarded(() => written(path)), pause * 1000);
  });

  const measured = new ResizeObserver(([entry]) =>
    setNarrow(entry.contentRect.width < NARROW),
  );

  onCleanup(() => {
    measured.disconnect();
    clearTimeout(previewing);
    clearTimeout(saving);
    view?.destroy();
  });

  const pick = (path) => {
    setDrawer(null);
    settle({ open: path });
  };

  const fronting = (key, value) =>
    setDrafts(
      open(),
      "front",
      produce((front) => {
        if (value === "") delete front[key];
        else front[key] = value;
      }),
    );

  const written = async (path) => {
    const typed = { path, front: unwrap(drafts[path]).front, body: drafts[path].body };
    await props.buffer.mode.call.source.write(typed);
    setDrafts(path, "kept", keyed(typed));
    setStamp(`saved ${clock()}`);
    await refetch();
  };

  const pressing = async () => {
    const built = await props.buffer.mode.call.build();
    setTold(`${built.pages.length} pressed · ${built.gone.length} gone · ${clock()}`);
    await refetch();
  };

  const save = () =>
    guarded(async () => {
      if (open() === null) return;
      await written(open());
      if (settings().pressing) await pressing();
    });

  const press = () =>
    guarded(async () => {
      if (open() !== null && dirty(open())) await written(open());
      await pressing();
    });

  const publish = (status) => {
    fronting("status", status);
    return press();
  };

  const create = (event) => {
    event.preventDefault();
    const path = fresh().trim();
    guarded(async () => {
      if (!shelf().sources.some((source) => source.path === path)) {
        await props.buffer.mode.call.source.write({
          path,
          front: { title: titled(path), date: today(), status: "draft" },
          body: "\n",
        });
        await refetch();
      }
      setFresh(null);
      pick(path);
    });
  };

  const forget = (path) => {
    setDrafts(path, undefined);
    sheets.delete(path);
    if (showing === path) showing = null;
  };

  const remove = (path) => {
    if (armed() !== path) return setArmed(path);
    guarded(async () => {
      await props.buffer.mode.call.source.remove({ path });
      forget(path);
      if (open() === path) await settle({ open: null });
      setTold(`removed ${path}`);
      await pressing();
    });
  };

  const move = (event) => {
    event.preventDefault();
    const path = open();
    const to = moving().trim();
    if (to === path) return;
    guarded(async () => {
      if (dirty(path)) await written(path);
      await props.buffer.mode.call.source.move({ path, to });
      forget(path);
      await settle({ open: to });
      await pressing();
    });
  };

  const choose = (event) =>
    guarded(async () => {
      await uploaded(event.target.files);
      event.target.value = "";
    });

  const docking = (dock) =>
    narrow()
      ? setDrawer(drawer() === dock ? null : dock)
      : settle({ [dock]: { ...desk()[dock], shown: !desk()[dock].shown } });

  const inspect = (tab) => {
    if (narrow()) setDrawer("inspector");
    settle({ inspector: { ...desk().inspector, shown: true, tab } });
  };

  const moded = (mode) => {
    settle({ mode });
    if (mode !== "preview" && showing !== null) queueMicrotask(() => editor().focus());
  };

  const marked = (name) => () => wrapped(editor(), markup(open()).marks[name]);

  const lined = (name) => () => prefixed(editor(), markup(open()).lines[name]);

  const sourced = () => open() !== null && draft() !== undefined;

  const COMMANDS = [
    ["save", "Mod-KeyS", sourced, save],
    ["save and press", "Mod-Shift-KeyS", sourced, press],
    ["press the blog", null, () => true, () => guarded(pressing)],
    ["publish", null, sourced, () => publish("published")],
    ["unlist", null, sourced, () => publish("unlisted")],
    ["back to draft", null, sourced, () => publish("draft")],
    ["new source", "Mod-Alt-KeyN", () => true, () => setFresh("on/")],
    ["find and replace", "Mod-KeyF", sourced, () => searched(editor())],
    ["move or remove this source", null, sourced, () => inspect("post")],
    [
      "open the live page",
      null,
      live,
      () => window.open(`${shelf().site}/${lying().article.page}`, "_blank", "noopener"),
    ],
    ...MODES.map(([mode, label, chord]) => [`show ${label}`, chord, () => true, () => moded(mode)]),
    [
      "next mode",
      "Mod-Backslash",
      () => true,
      () =>
        moded(MODES[(MODES.findIndex(([mode]) => mode === desk().mode) + 1) % MODES.length][0]),
    ],
    ["toggle the library", "Mod-Shift-KeyE", () => true, () => docking("library")],
    ["toggle the inspector", "Mod-Shift-KeyU", () => true, () => docking("inspector")],
    ...TABS.map(([tab, label]) => [`inspect ${label}`, null, () => true, () => inspect(tab)]),
    ...DEVICES.map(([device]) => [
      `page at ${device} width`,
      null,
      () => true,
      () => settle({ device }),
    ]),
    ["settings", "Mod-Comma", () => true, () => setTuning(!tuning())],
    ["commands", "Mod-KeyP", () => true, () => setPalette(palette() === null ? "" : null)],
    ...MARKS.map(([name, , label]) => [label, null, sourced, marked(name)]),
    ...LINES.map(([name, , label]) => [label, null, sourced, lined(name)]),
    ...SWITCHES.map(([key, label]) => [
      `${label}: on or off`,
      null,
      () => true,
      () => tune({ [key]: !settings()[key] }),
    ]),
    ["bigger type", null, () => true, () => tune({ size: within([12, 26], settings().size + 1) })],
    ["smaller type", null, () => true, () => tune({ size: within([12, 26], settings().size - 1) })],
    ["default settings", null, () => true, () => tune(Settings.cast({}))],
  ];

  const entries = () => {
    const asked = (palette() ?? "").toLowerCase();
    const commands = COMMANDS.filter(([, , when]) => when()).map(([label, chord, , run]) => ({
      label,
      hint: chord === null ? "" : glyphed(chord),
      run,
    }));
    const sources =
      shelf() === undefined
        ? []
        : shelf().sources.map((source) => ({
            label: `open ${source.fault === null ? source.article.title : source.path}`,
            hint: source.path,
            run: () => pick(source.path),
          }));
    return [...sources, ...commands].filter((entry) => fuzzy(asked, entry.label)).slice(0, 40);
  };

  const ran = (entry) => {
    setPalette(null);
    entry.run();
  };

  const paletted = (event) => {
    const listed = entries();
    if (event.key === "ArrowDown") setPicked((picked() + 1) % Math.max(1, listed.length));
    else if (event.key === "ArrowUp")
      setPicked((picked() - 1 + listed.length) % Math.max(1, listed.length));
    else if (event.key === "Enter" && listed[picked()] !== undefined) ran(listed[picked()]);
    else if (event.key === "Escape") setPalette(null);
    else return;
    event.preventDefault();
    event.stopPropagation();
  };

  const key = (event) => {
    if (event.key === "Escape") {
      if (palette() !== null) return setPalette(null);
      if (tuning()) return setTuning(false);
      if (drawer() !== null) return setDrawer(null);
      if (desk().mode === "focus") return moded("write");
    }
    const command = COMMANDS.find(([, chord, when]) => chord === chorded(event) && when());
    if (command === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    command[3]();
  };

  const kept = () =>
    queueMicrotask(() => {
      if (root.ownerDocument.activeElement === root.ownerDocument.body) root.focus();
    });

  const resize = (dock, sign) => (event, rect) =>
    setDragged({
      ...dragged(),
      [dock]: within(
        LIMITS[dock],
        Math.round(sign > 0 ? event.clientX - rect.left : rect.right - event.clientX),
      ),
    });

  const resized = (dock) => () => {
    const value = dragged()[dock];
    setDragged({ ...dragged(), [dock]: undefined });
    if (value !== undefined) settle({ [dock]: { ...desk()[dock], width: value } });
  };

  const sharing = (event, rect) =>
    setDragged({
      ...dragged(),
      share: within(LIMITS.share, (event.clientX - rect.left) / rect.width),
    });

  const shared = () => {
    const value = dragged().share;
    setDragged({ ...dragged(), share: undefined });
    if (value !== undefined) settle({ share: value });
  };

  const Row = (props) => (
    <button
      class="row"
      aria-current={String(open() === props.source.path)}
      title={props.source.fault === null ? props.source.path : props.source.fault}
      onClick={() => pick(props.source.path)}>
      <span class={`kit-dot ${DOTS[state(props.source)]}`} />
      <span class="n">
        {props.source.fault === null ? props.source.article.title : props.source.path}
      </span>
      <span class="unsaved">{dirty(props.source.path) ? "●" : ""}</span>
      <span class="v">{dated(props.source) || "page"}</span>
    </button>
  );

  const Library = () => (
    <aside class="dock library" style={{ width: `${width("library")}px` }}>
      <header class="dock-head">
        <span class="kit-label">sources</span>
        <span class="fill" />
        <button class="icon" title="new source · ⌘⌥N" onClick={() => setFresh("on/")}>
          +
        </button>
        <button class="icon" title="hide · ⌘⇧E" onClick={() => docking("library")}>
          ⟨
        </button>
      </header>
      <Show when={fresh() !== null}>
        <form class="kit-field new" onSubmit={create}>
          <span class="p">+</span>
          <input
            value={fresh()}
            onInput={(event) => setFresh(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setFresh(null);
            }}
            placeholder="on/a-new-essay.md"
            pattern=".+\.(md|org)"
            required
            ref={(element) => queueMicrotask(() => element.focus())}
            aria-label="a new source's path under source/"
          />
        </form>
      </Show>
      <label class="kit-field">
        <span class="p">⌕</span>
        <input
          value={query()}
          onInput={(event) => setQuery(event.target.value)}
          placeholder="filter"
          aria-label="filter the sources"
        />
      </label>
      <div class="scroll">
        <Show when={shelf()}>
          <For each={GROUPS.map(([, name]) => name)}>
            {(name) => (
              <Show when={group(name).length > 0}>
                <button
                  class="group"
                  onClick={() =>
                    setFolded(
                      folded().includes(name)
                        ? folded().filter((fold) => fold !== name)
                        : [...folded(), name],
                    )
                  }>
                  <span>{folded().includes(name) ? "▸" : "▾"}</span>
                  <span class="kit-label">{name}</span>
                  <span class="count">{group(name).length}</span>
                </button>
                <Show when={!folded().includes(name)}>
                  <For each={group(name)}>{(source) => <Row source={source} />}</For>
                </Show>
              </Show>
            )}
          </For>
        </Show>
      </div>
    </aside>
  );

  const Post = () => (
    <div class="form">
      <label class="field">
        <span>title</span>
        <input
          value={draft().front.title ?? ""}
          onInput={(event) => fronting("title", event.target.value)}
          placeholder={titled(open())}
        />
      </label>
      <label class="field">
        <span>subtitle</span>
        <textarea
          rows="2"
          value={draft().front.subtitle ?? ""}
          onInput={(event) => fronting("subtitle", event.target.value)}
          placeholder="the line a link preview shows"
        />
      </label>
      <label class="field">
        <span>date</span>
        <div class="with">
          <input
            value={draft().front.date ?? ""}
            onInput={(event) => fronting("date", event.target.value)}
            placeholder="none: a page"
            pattern="\d{4}\.\d{2}\.\d{2}"
          />
          <button class="icon" title="today" onClick={() => fronting("date", today())}>
            ◷
          </button>
          <button class="icon" title="no date: a page" onClick={() => fronting("date", "")}>
            ×
          </button>
        </div>
      </label>
      <div class="field">
        <span>status</span>
        <span class="kit-choice">
          <For each={STATUSES}>
            {(status) => (
              <button
                type="button"
                aria-pressed={String(known(draft().front).status === status)}
                onClick={() => fronting("status", status)}>
                <span class={`kit-dot ${DOTS[status]}`} /> {status}
              </button>
            )}
          </For>
        </span>
      </div>
      <label class="field">
        <span>tags</span>
        <input
          value={draft().front.tags ?? ""}
          onInput={(event) => fronting("tags", event.target.value)}
          placeholder="comma-joined"
        />
      </label>
      <div class="field">
        <span>lead picture</span>
        <Show
          when={draft().front.image !== undefined && shelf() !== undefined}
          fallback={
            <button class="ghost" onClick={() => inspect("media")}>
              choose from media
            </button>
          }>
          <figure class="lead">
            <img src={`${shelf().site}${draft().front.image}`} alt="" />
            <figcaption>
              <span>{draft().front.image}</span>
              <button class="icon" title="no lead picture" onClick={() => fronting("image", "")}>
                ×
              </button>
            </figcaption>
          </figure>
        </Show>
      </div>
      <For each={faults()}>
        {(fault) => (
          <span class="fault">
            <span class="kit-dot is-fault" />
            {fault.at} {fault.reason}
          </span>
        )}
      </For>
      <form class="field" onSubmit={move}>
        <span>path under source/</span>
        <div class="with">
          <input
            value={moving()}
            onInput={(event) => setMoving(event.target.value)}
            pattern=".+\.(md|org)"
            required
          />
          <Show when={moving().trim() !== open()}>
            <button class="ghost">move</button>
          </Show>
        </div>
      </form>
      <div class="actions">
        <button class="ghost" title="save and press · ⌘⇧S" onClick={press}>
          save and press
        </button>
        <Show when={live()}>
          <a href={`${shelf().site}/${lying().article.page}`} target="_blank" rel="noopener">
            open the live page ↗
          </a>
        </Show>
        <span class="fill" />
        <button
          class="danger"
          aria-pressed={String(armed() === open())}
          onClick={() => remove(open())}>
          {armed() === open() ? "remove it for good?" : "remove"}
        </button>
      </div>
    </div>
  );

  const Media = () => (
    <div class="media">
      <label class="drop">
        <input type="file" accept="image/*" multiple onChange={choose} />
        <span>drop or choose pictures</span>
      </label>
      <Show when={shelf()}>
        <div class="pictures">
          <For each={shelf().files.filter(pictured)}>
            {(file) => (
              <figure
                class="picture"
                classList={{ "is-lead": sourced() && draft().front.image === `/${file.path}` }}>
                <img src={`${shelf().site}/${file.path}`} alt={file.path} loading="lazy" />
                <figcaption title={file.path}>{file.path.split("/").at(-1)}</figcaption>
                <div class="over">
                  <button
                    classList={{ "is-off": !sourced() }}
                    onClick={() => figured(editor(), markup(open()).figure(file.path))}>
                    insert
                  </button>
                  <button
                    classList={{ "is-off": !sourced() }}
                    onClick={() => fronting("image", `/${file.path}`)}>
                    lead
                  </button>
                  <button
                    aria-pressed={String(armed() === file.path)}
                    onClick={() => remove(file.path)}>
                    {armed() === file.path ? "sure?" : "✕"}
                  </button>
                </div>
              </figure>
            )}
          </For>
        </div>
        <span class="kit-label">other files</span>
        <For each={shelf().files.filter((file) => !pictured(file))}>
          {(file) => (
            <a class="row" href={`${shelf().site}/${file.path}`} target="_blank" rel="noopener">
              <span class="kit-dot" />
              <span class="n">{file.path}</span>
              <span />
              <span class="v">{file.mime}</span>
            </a>
          )}
        </For>
      </Show>
    </div>
  );

  const Outline = () => (
    <div class="outline">
      <Show
        when={outline(open(), draft().body).length > 0}
        fallback={<span class="empty">no headings yet</span>}>
        <For each={outline(open(), draft().body)}>
          {(entry) => (
            <button
              class="row heading"
              aria-current={String(heading() !== null && heading().line === entry.line)}
              style={{ "padding-left": `${entry.depth * 12}px` }}
              onClick={() => reached(editor(), entry.line)}>
              <span class="n">{entry.title}</span>
              <span />
              <span />
              <span class="v">{entry.line}</span>
            </button>
          )}
        </For>
      </Show>
    </div>
  );

  const Stats = () => (
    <div class="stats">
      <For each={COUNTS}>
        {([name, pattern]) => (
          <div class="stat">
            <b>{counted(draft().body, pattern)}</b>
            <span>{name}</span>
          </div>
        )}
      </For>
      <div class="stat">
        <b>{outline(open(), draft().body).length}</b>
        <span>headings</span>
      </div>
      <div class="stat">
        <b>{Math.max(1, Math.round(words() / 230))}</b>
        <span>minutes to read</span>
      </div>
    </div>
  );

  const PANES = { post: Post, media: Media, outline: Outline, stats: Stats };

  const Inspector = () => (
    <aside class="dock inspector" style={{ width: `${width("inspector")}px` }}>
      <header class="dock-head">
        <span class="kit-choice tabs">
          <For each={TABS}>
            {([tab, label]) => (
              <button
                aria-pressed={String(desk().inspector.tab === tab)}
                onClick={() => inspect(tab)}>
                {label}
              </button>
            )}
          </For>
        </span>
        <span class="fill" />
        <button class="icon" title="hide · ⌘⇧U" onClick={() => docking("inspector")}>
          ⟩
        </button>
      </header>
      <div class="scroll">
        <Show
          when={sourced() || desk().inspector.tab === "media"}
          fallback={<span class="empty">no source open</span>}>
          {PANES[desk().inspector.tab]()}
        </Show>
      </div>
    </aside>
  );

  const Tuning = () => (
    <div class="pop settings" onKeyDown={(event) => event.stopPropagation()}>
      <header>
        <b>settings</b>
        <span class="fill" />
        <button class="ghost" onClick={() => tune(Settings.cast({}))}>
          defaults
        </button>
        <button class="icon" onClick={() => setTuning(false)}>
          ×
        </button>
      </header>
      <div class="setting">
        <span>typeface</span>
        <span class="kit-choice">
          <For each={["sans", "serif", "mono"]}>
            {(font) => (
              <button
                aria-pressed={String(settings().font === font)}
                onClick={() => tune({ font })}>
                {font}
              </button>
            )}
          </For>
        </span>
      </div>
      <For each={RANGES}>
        {([key, label, low, high, step, unit]) => (
          <label class="setting">
            <span>{label}</span>
            <input
              type="range"
              min={low}
              max={high}
              step={step}
              value={settings()[key]}
              onInput={(event) => tune({ [key]: Number(event.target.value) })}
            />
            <output>
              {settings()[key]}
              {unit}
            </output>
          </label>
        )}
      </For>
      <For each={SWITCHES}>
        {([key, label]) => (
          <label class="setting switch">
            <span>{label}</span>
            <input
              type="checkbox"
              checked={settings()[key]}
              onChange={() => tune({ [key]: !settings()[key] })}
            />
          </label>
        )}
      </For>
      <div class="setting">
        <span>save after a pause</span>
        <span class="kit-choice">
          <For each={PAUSES}>
            {(pause) => (
              <button
                aria-pressed={String(settings().autosave === pause)}
                onClick={() => tune({ autosave: pause })}>
                {pause === 0 ? "never" : `${pause}s`}
              </button>
            )}
          </For>
        </span>
      </div>
    </div>
  );

  const Palette = () => (
    <div class="veil" onClick={() => setPalette(null)}>
      <div class="pop palette" onClick={(event) => event.stopPropagation()}>
        <input
          value={palette()}
          onInput={(event) => {
            setPalette(event.target.value);
            setPicked(0);
          }}
          onKeyDown={paletted}
          placeholder="a command or a source"
          ref={(element) => queueMicrotask(() => element.focus())}
          aria-label="a command or a source"
        />
        <div class="list">
          <For each={entries()}>
            {(entry, index) => (
              <button
                class="entry"
                aria-current={String(index() === picked())}
                onMouseEnter={() => setPicked(index())}
                onClick={() => ran(entry)}>
                <span>{entry.label}</span>
                <span class="hint">{entry.hint}</span>
              </button>
            )}
          </For>
        </div>
      </div>
    </div>
  );

  return (
    <div
      class="kit desk"
      classList={{
        "is-focus": desk().mode === "focus",
        "is-narrow": narrow(),
        "is-dragging": Object.values(dragged()).some((value) => value !== undefined),
      }}
      data-mode={mode()}
      ref={(element) => {
        root = element;
        measured.observe(element);
      }}
      tabIndex="-1"
      onKeyDown={key}
      onFocusOut={kept}>
      <header class="titlebar">
        <button
          class="icon"
          aria-pressed={String(desk().library.shown)}
          title="library · ⌘⇧E"
          onClick={() => docking("library")}>
          ◧
        </button>
        <button class="title" title="commands · ⌘P" onClick={() => setPalette("")}>
          <Show when={open() !== null} fallback={<span class="muted">no source open · ⌘P</span>}>
            <Show when={lying()}>
              <span class={`kit-dot ${DOTS[state(lying())]}`} />
            </Show>
            <b>{draft() === undefined ? open() : draft().front.title ?? titled(open())}</b>
            <span class="muted">{open()}</span>
            <Show when={dirty(open())}>
              <span class="unsaved">● unsaved</span>
            </Show>
          </Show>
        </button>
        <span class="fill" />
        <Show
          when={narrow()}
          fallback={
            <span class="kit-choice modes">
              <For each={MODES}>
                {([shape, label, chord]) => (
                  <button
                    aria-pressed={String(mode() === shape)}
                    title={glyphed(chord)}
                    onClick={() => moded(shape)}>
                    {label}
                  </button>
                )}
              </For>
            </span>
          }>
          <select
            class="modes"
            value={mode()}
            onChange={(event) => moded(event.target.value)}
            aria-label="mode">
            <For each={MODES.filter(([shape]) => shape !== "split")}>
              {([shape, label]) => <option value={shape}>{label}</option>}
            </For>
          </select>
        </Show>
        <button
          class="icon"
          aria-pressed={String(desk().inspector.shown)}
          title="inspector · ⌘⇧U"
          onClick={() => docking("inspector")}>
          ◨
        </button>
        <button
          class="icon"
          aria-pressed={String(tuning())}
          title="settings · ⌘,"
          onClick={() => setTuning(!tuning())}>
          ⚙
        </button>
        <Show when={sourced()}>
          <span class="kit-choice">
            <button title="⌘S" onClick={save}>
              save
            </button>
            <Show when={!narrow()}>
              <Show
                when={known(draft().front).status === "published"}
                fallback={
                  <button class="go" onClick={() => publish("published")}>
                    publish
                  </button>
                }>
                <button title="⌘⇧S" onClick={press}>
                  press
                </button>
              </Show>
            </Show>
          </span>
        </Show>
      </header>
      <Show when={tuning()}>
        <Tuning />
      </Show>
      <Show when={palette() !== null}>
        <Palette />
      </Show>
      <div class="body">
        <Show when={narrow() && drawer() !== null}>
          <div class="veil drawn" onClick={() => setDrawer(null)} />
        </Show>
        <Show when={docked("library")}>
          <Library />
        </Show>
        <Show when={docked("library") && !narrow()}>
          <Seam
            onDrag={resize("library", 1)}
            onDone={resized("library")}
            onReset={() => settle({ library: { ...desk().library, width: 264 } })}
          />
        </Show>
        <main class="middle">
          <section
            class="writing"
            classList={{ "is-hidden": mode() === "preview" }}
            style={{ flex: mode() === "split" ? `0 0 ${share() * 100}%` : "1 1 auto" }}>
            <Show when={sourced() && mode() !== "focus"}>
              <div class="tools">
                <For each={MARKS}>
                  {([name, glyph, label]) => (
                    <button
                      class={`tool ${name}`}
                      title={KEYS[name] === undefined ? label : `${label} · ${KEYS[name]}`}
                      onClick={marked(name)}>
                      {glyph}
                    </button>
                  )}
                </For>
                <span class="gap" />
                <For each={LINES}>
                  {([name, glyph, label]) => (
                    <button class="tool" title={label} onClick={lined(name)}>
                      {glyph}
                    </button>
                  )}
                </For>
                <span class="gap" />
                <button class="tool" title="picture" onClick={() => inspect("media")}>
                  ▣
                </button>
                <button class="tool" title="find · ⌘F" onClick={() => searched(editor())}>
                  ⌕
                </button>
                <span class="fill" />
                <Show when={heading()}>
                  <span class="crumb">§ {heading().title}</span>
                </Show>
              </div>
            </Show>
            <Show when={!sourced()}>
              <div class="welcome">
                <b>nothing on the desk</b>
                <span>pick a source in the library, or</span>
                <span class="kit-choice">
                  <button onClick={() => setFresh("on/")}>start a new one</button>
                  <button onClick={() => setPalette("")}>⌘P find one</button>
                </span>
              </div>
            </Show>
            <div class="sheet" classList={{ "is-hidden": !sourced() }} ref={host} />
          </section>
          <Show when={mode() === "split"}>
            <Seam onDrag={sharing} onDone={shared} onReset={() => settle({ share: 0.5 })} />
          </Show>
          <section
            class="pressed"
            classList={{ "is-hidden": ["write", "focus"].includes(mode()) }}>
            <div class="pressbar">
              <span class="kit-choice">
                <For each={DEVICES}>
                  {([device, glyph]) => (
                    <button
                      aria-pressed={String(desk().device === device)}
                      title={`${device} width`}
                      onClick={() => settle({ device })}>
                      {glyph}
                    </button>
                  )}
                </For>
              </span>
              <span class="fill" />
              <label class="toggle">
                <input
                  type="checkbox"
                  checked={settings().sync}
                  onChange={() => tune({ sync: !settings().sync })}
                />
                follow
              </label>
              <Show when={live()}>
                <a href={`${shelf().site}/${lying().article.page}`} target="_blank" rel="noopener">
                  live ↗
                </a>
              </Show>
            </div>
            <div class="stage">
              <Show when={preview() !== ""} fallback={<span class="empty">no page yet</span>}>
                <iframe
                  ref={frame}
                  class="page"
                  style={{ width: DEVICES.find(([device]) => device === desk().device)[2] }}
                  srcdoc={preview()}
                  sandbox="allow-same-origin"
                  onLoad={followed}
                  title="the page as pressed"
                />
              </Show>
            </div>
          </section>
        </main>
        <Show when={docked("inspector") && !narrow()}>
          <Seam
            onDrag={resize("inspector", -1)}
            onDone={resized("inspector")}
            onReset={() => settle({ inspector: { ...desk().inspector, width: 320 } })}
          />
        </Show>
        <Show when={docked("inspector")}>
          <Inspector />
        </Show>
      </div>
      <footer class="status">
        <Show when={busy()}>
          <span class="kit-dot is-running" />
        </Show>
        <Show when={sourced()}>
          <span>
            Ln {at().line}, Col {at().column}
          </span>
          <Show when={at().chosen > 0}>
            <span>{at().chosen} chosen</span>
          </Show>
          <span>{words()} words</span>
          <span>{Math.max(1, Math.round(words() / 230))} min</span>
          <span>{dirty(open()) ? "● unsaved" : stamp()}</span>
        </Show>
        <Show when={fault()} fallback={<span class="told">{told()}</span>}>
          <span class="fault">
            <span class="kit-dot is-fault" />
            {fault()}
          </span>
        </Show>
        <span class="fill" />
        <Show when={settings().autosave > 0}>
          <span>autosave {settings().autosave}s</span>
        </Show>
        <button class="ghost" onClick={() => setPalette("")}>
          ⌘P commands
        </button>
      </footer>
    </div>
  );
};

export default (element, props) => {
  const shadow = element.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = styles;
  shadow.append(style);
  const dispose = render(() => <Blog {...props} />, shadow);
  return { destroy: dispose };
};
