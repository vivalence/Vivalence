import { createSignal, For, from, onMount, Show } from "solid-js";
import { render } from "solid-js/web";
import sheet from "./desk.css";

const MODELS = [
  { key: "1", id: "openai/gpt-image-2", references: 16, aspects: ["1:1", "3:2", "2:3"] },
  { key: "2", id: "black-forest-labs/flux.2-pro", references: 8, aspects: ["1:1", "3:2", "2:3", "4:3", "3:4", "16:9", "9:16"] },
  { key: "3", id: "google/gemini-2.5-flash-image", references: 3, aspects: ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"] },
];
const ASPECTS = ["1:1", "3:2", "2:3", "16:9"];
const COUNTS = [1, 2, 4];
const ROLES = ["style", "subject", "structure"];
const short = (id) => id.slice(0, 4);
const grow = (event) => {
  event.target.style.height = "auto";
  event.target.style.height = `${event.target.scrollHeight}px`;
};

export const Darkroom = (props) => {
  const held = from(props.buffer.$data);
  const [draft, setDraft] = createSignal("");
  const [busy, setBusy] = createSignal(null);
  const [fault, setFault] = createSignal(null);
  const [over, setOver] = createSignal(false);
  let picker;

  const hold = (answered) => props.terminal.client.runtime.entities.buffer.merge(answered);
  const settle = async (data) => hold(await props.buffer.mode.call.picture.settle({ buffer: props.buffer.id, data: { ...held(), ...data } }));
  const hallucinate = async () => hold(await props.buffer.mode.call.picture.hallucinate({ buffer: props.buffer.id }, { timeout: 180000 }));
  const upload = (file) => props.buffer.mode.call.picture.upload[props.buffer.id]({}, { raw: { body: file.stream() }, headers: { "content-type": file.type } });

  const ready = () => held().model !== undefined;
  onMount(() => {
    if (!ready()) settle({});
  });

  const files = from(props.buffer.$files);
  const file = (id) => files().find((row) => row.id === id);
  const model = () => MODELS.find((candidate) => candidate.id === held().model);
  const picture = () => held().pictures.find((candidate) => candidate.file === held().shown);
  const reference = () => held().references.find((candidate) => candidate.file === held().shown);
  const last = () => (held().pictures.length ? held().pictures.at(-1).file : null);
  const hint = () => {
    const painted = picture();
    if (painted) return [short(painted.file), painted.parent ? `on ${short(painted.parent)}` : null, `${painted.model} · ${painted.aspect}`, painted.prompt].filter(Boolean).join(" · ");
    return `${short(reference().file)} · a reference · ${reference().role}`;
  };

  const pick = (candidate) => settle({ model: candidate.id, aspect: candidate.aspects.includes(held().aspect) ? held().aspect : candidate.aspects[0] });
  const refer = (file) => settle({ references: [...held().references, { file, role: "style" }] });
  const remove = (item) => settle({ references: held().references.filter((candidate) => candidate.file !== item.file), shown: held().shown === item.file ? last() : held().shown });
  const assign = (item, role) => settle({ references: held().references.map((candidate) => (candidate.file === item.file ? { ...candidate, role } : candidate)) });

  const say = async () => {
    const prompt = draft().trim();
    if (!prompt || busy()) return;
    setBusy(prompt);
    setFault(null);
    setDraft("");
    try {
      await settle({ prompt });
      await hallucinate();
    } catch (error) {
      setFault(error.message);
      setDraft(prompt);
    } finally {
      setBusy(null);
    }
  };

  const add = async (files) => {
    for (const dropped of [...files].filter((file) => file.type.startsWith("image/"))) {
      const uploaded = await upload(dropped);
      await refer(uploaded.id);
    }
  };
  const drop = async (event) => {
    event.preventDefault();
    setOver(false);
    const id = event.dataTransfer.getData("text/picture");
    if (id) {
      if (!held().references.some((item) => item.file === id)) await refer(id);
      return;
    }
    await add(event.dataTransfer.files);
  };
  const key = (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    say();
    event.target.style.height = "auto";
  };

  return (
    <div class="kit desk" onDragOver={(event) => { event.preventDefault(); setOver(true); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOver(false); }} onDrop={drop}>
      <Show when={ready()}>
      <aside class="side">
        <div class="set">
          <span class="kit-label">next</span>
          <span class="kit-choice" style="padding-left: var(--size-space-2xs)">
            <button aria-pressed={String(held().next === "iterate")} onClick={() => settle({ next: "iterate" })}>on {held().shown ? short(held().shown) : "—"}</button>
            <button aria-pressed={String(held().next === "fresh")} onClick={() => settle({ next: "fresh" })}>fresh</button>
          </span>
        </div>
        <div class="set">
          <span class="kit-label">model</span>
          <For each={MODELS}>
            {(candidate) => (
              <button class="kit-row" aria-current={String(held().model === candidate.id)} onClick={() => pick(candidate)}>
                <span class="k">{candidate.key}</span>
                <span class="n">{candidate.id.split("/")[1]}</span>
                <span class="vendor">{candidate.id.split("/")[0]}</span>
                <span class="v hint" title={[candidate.id, "openrouter", `${candidate.references} references`, "no mask", ...candidate.aspects].join(" · ")}>?</span>
              </button>
            )}
          </For>
        </div>
        <div class="set">
          <span class="kit-label">aspect</span>
          <span class="kit-choice" style="padding-left: var(--size-space-2xs)">
            <For each={ASPECTS}>
              {(candidate) => (
                <button
                  classList={{ "is-off": !model().aspects.includes(candidate) }}
                  disabled={!model().aspects.includes(candidate)}
                  aria-pressed={String(held().aspect === candidate)}
                  onClick={() => settle({ aspect: candidate })}
                >
                  {candidate}
                </button>
              )}
            </For>
          </span>
        </div>
        <div class="set">
          <span class="kit-label">count</span>
          <span class="kit-choice" style="padding-left: var(--size-space-2xs)">
            <For each={COUNTS}>{(candidate) => <button aria-pressed={String(held().count === candidate)} onClick={() => settle({ count: candidate })}>{candidate}</button>}</For>
          </span>
        </div>
        <div class="set" style="margin-top: var(--size-space-sm)">
          <span class="kit-label">references</span>
          <For each={held().references}>
            {(item) => (
              <div class="ref">
                <button class="pic thumb" classList={{ "is-shown": held().shown === item.file }} aria-label={`show reference ${short(item.file)}`} onClick={() => settle({ shown: item.file })}>
                  <Show when={file(item.file)}>{(row) => <img src={row().url} alt="" />}</Show>
                </button>
                <span class="n" style="display:flex;align-items:center">
                  <span style="flex:1;overflow:hidden;text-overflow:ellipsis">{short(item.file)}</span>
                  <button class="x" aria-label={`remove ${short(item.file)}`} onClick={() => remove(item)}>×</button>
                </span>
                <span class="kit-choice">
                  <For each={ROLES}>{(role) => <button aria-pressed={String(item.role === role)} onClick={() => assign(item, role)}>{role}</button>}</For>
                </span>
              </div>
            )}
          </For>
          <button class="add" classList={{ "is-over": over() }} aria-label="add a reference" title="drop a file, or a picture from the strip" onClick={() => picker.click()}>+ drop</button>
          <input ref={picker} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden onChange={(event) => { add(event.target.files); event.target.value = ""; }} />
        </div>
      </aside>
      <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--size-space-xs)">
        <div class="pic is-frame" style="flex: 1">
          <Show when={!busy() && held().shown && file(held().shown)}>{(row) => <img src={row().url} alt="" />}</Show>
          <Show when={fault()}>
            <span class="empty fault"><span class="kit-dot is-fault" />{fault()}</span>
          </Show>
          <Show when={over()}>
            <span class="empty" style="position:absolute;inset:0;display:grid;place-items:center;box-shadow:inset 0 0 0 var(--size-ring) var(--signal-primary-ink);color:var(--signal-primary-ink);background:var(--signal-primary-tint)">drop · a reference</span>
          </Show>
          <Show when={busy()}>
            <span class="empty"><span class="kit-dot is-running" style="display:inline-block;margin-right:8px" />{busy()}</span>
          </Show>
          <Show when={!busy() && !held().shown}><span class="empty">no picture yet · say one</span></Show>
        </div>
        <div class="status">
          <span style="flex:1" />
          <Show when={!busy() && held().shown}><span class="hint" title={hint()}>?</span></Show>
        </div>
        <div class="strip">
          <For each={held().pictures}>
            {(item) => (
              <button
                class="pic thumb"
                classList={{ "is-shown": held().shown === item.file, "is-root": !item.parent }}
                aria-label={`show ${short(item.file)}`}
                title={[short(item.file), item.parent ? `on ${short(item.parent)}` : null, item.prompt].filter(Boolean).join(" · ")}
                onClick={() => settle({ shown: item.file })}
                draggable="true"
                onDragStart={(event) => { event.dataTransfer.setData("text/picture", item.file); event.dataTransfer.effectAllowed = "copy"; }}
              >
                <Show when={file(item.file)}>{(row) => <img src={row().url} alt="" />}</Show>
              </button>
            )}
          </For>
        </div>
        <label class="kit-field" style="align-items: start; padding-top: 6px; padding-bottom: 6px">
          <span class="p" style="line-height: 20px">›</span>
          <textarea rows="1" value={draft()} onInput={(event) => { setDraft(event.target.value); grow(event); }} onKeyDown={key} placeholder="say it" aria-label="say it" style="line-height: 20px; overflow: hidden" />
        </label>
      </div>
      </Show>
    </div>
  );
};

export default (element, props) => {
  const shadow = element.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = sheet;
  shadow.append(style);
  const dispose = render(() => <Darkroom {...props} />, shadow);
  return { destroy: dispose };
};
