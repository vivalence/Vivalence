import { children, createSignal, For, mergeProps, Show } from "solid-js";
import { Markdown } from "./Markdown.jsx";
import { Think } from "./Think.jsx";
import { Tool } from "./Tool.jsx";

export const REGISTERS = { you: "<<", agent: ">>", cmd: "<<", msg: "·", fault: "!", trace: "·" };
const HEADED = ["you", "agent"];

const register = (kind) => {
  if (!Object.hasOwn(REGISTERS, kind)) throw new Error(`[drapes] not a journal register: ${JSON.stringify(kind)} · ${Object.keys(REGISTERS).join(" · ")}`);
  return REGISTERS[kind];
};

const clip = (text) => (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject(new Error("no clipboard")));

export const Turn = (props) => {
  const held = mergeProps({ who: "", meta: "", text: "", ts: "", path: "", lens: "chat", markdown: "plain", ans: "", tools: [], think: null, buffer: null, selected: false, streaming: false }, props);
  const [folded, setFolded] = createSignal(false);
  const [copied, setCopied] = createSignal(false);
  const blocks = children(() => held.children);
  const headed = () => HEADED.includes(held.kind);
  const thinking = () => held.think !== null && held.think.some((node) => node.status === "run");
  const line = (text) => held.onLine && held.onLine(text);
  const copy = () => clip(held.text).then(() => setCopied(true), () => setCopied(false));
  const retry = () => line(held.text);
  const fold = () => setFolded(!folded());
  const open = () => line(`/buffer "${held.buffer}"`);
  return (
    <div class={`entry ${held.kind}`} classList={{ headed: headed(), sel: held.selected }} onClick={(event) => held.onPick && held.onPick(event)}>
      <Show when={headed()} fallback={<div class="reg">{register(held.kind)}</div>}>
        <div class="ehead">
          <span class="reg">{register(held.kind)}</span>
          <Show when={held.kind === "you"}>
            <span class="who">{held.who}</span>
          </Show>
          <span class="meta">{held.meta}</span>
          <span class="ops">
            <button onClick={copy}>{copied() ? "copied" : "copy"}</button>
            <Show when={held.kind === "you"}>
              <button onClick={retry}>retry</button>
            </Show>
            <Show when={held.kind === "agent"}>
              <button onClick={fold}>{folded() ? "unfold" : "fold"}</button>
            </Show>
            <Show when={held.buffer !== null}>
              <button onClick={open}>frame</button>
            </Show>
          </span>
        </div>
      </Show>
      <div class="body">
        <Show when={held.think !== null && !folded()}>
          <Think nodes={held.think} />
        </Show>
        <Show when={held.text !== "" || (held.kind === "agent" && !thinking()) || folded()}>
          <div class="text">
            <Show when={!folded()} fallback="folded">
              <Show
                when={held.kind === "trace"}
                fallback={
                  <Show when={headed() && held.markdown === "pretty"} fallback={held.text}>
                    <Markdown text={held.text} />
                  </Show>
                }>
                <span class="ts">{held.ts}</span>
                {held.text}
                <Show when={held.lens === "trace" && held.path !== ""}>
                  <span class="path">{held.path}</span>
                </Show>
              </Show>
            </Show>
            <Show when={held.streaming && !folded()}>
              <span class="cursor" />
            </Show>
          </div>
        </Show>
        <Show when={held.ans !== "" && !folded()}>
          <div class="ans">{held.ans}</div>
        </Show>
        <Show when={held.tools.length > 0 && !folded()}>
          <div class="tools">
            <For each={held.tools}>{(tool) => <Tool tool={tool} />}</For>
          </div>
        </Show>
        <Show when={blocks.toArray().length > 0 && !folded()}>
          <div class="blocks">{blocks()}</div>
        </Show>
        <Show when={!headed() && held.selected}>
          <div class="verbs">
            <button onClick={copy}>
              <b>c</b>
              {copied() ? "copied" : "copy"}
            </button>
            <Show when={held.kind === "you"}>
              <button onClick={retry}>
                <b>r</b>retry
              </button>
            </Show>
            <Show when={held.buffer !== null}>
              <button onClick={open}>
                <b>o</b>open
              </button>
            </Show>
            <Show when={held.kind === "agent"}>
              <button onClick={fold}>
                <b>f</b>
                {folded() ? "unfold" : "fold"}
              </button>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  );
};
