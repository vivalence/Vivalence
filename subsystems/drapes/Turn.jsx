import { children, createSignal, For, mergeProps, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { parts } from "@vivalence/dapper";
import { Caret } from "./Caret.jsx";
import { Markdown } from "./Markdown.jsx";
import { Think } from "./Think.jsx";
import { Thought, Tool } from "./Tool.jsx";

const register = (kind) => {
  if (!Object.hasOwn(parts.turn.REGISTERS, kind))
    throw new Error(
      `[drapes] not a journal register: ${JSON.stringify(kind)} · ${Object.keys(parts.turn.REGISTERS).join(" · ")}`,
    );
  return parts.turn.REGISTERS[kind];
};

const clip = (text) => (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject(new Error("no clipboard")));

export const SEGMENTS = {
  think: (props) => (
    <div class="tools">
      <For each={props.segment.items}>{(node) => <Thought node={node} />}</For>
    </div>
  ),
  text: (props) => (
    <div class="text">
      <Show when={props.markdown === "pretty"} fallback={props.segment.items.join("\n\n")}>
        <Markdown text={props.segment.items.join("\n\n")} />
      </Show>
      <Show when={props.segment.tail}>
        <span class="tail">{props.segment.tail}</span>
      </Show>
      <Show when={props.cursor}>
        <span class="cursor" />
      </Show>
    </div>
  ),
  tools: (props) => (
    <div class="tools">
      <For each={props.segment.items}>{(tool) => <Tool tool={tool} />}</For>
    </div>
  ),
};

export const Turn = (props) => {
  const held = mergeProps({ who: "", meta: "", text: "", ts: "", path: "", lens: ["turns"], markdown: "plain", ans: "", tools: [], think: null, segments: null, buffer: null, selected: false, streaming: false, tail: "", heard: "", detail: "" }, props);
  const [tooled, setTooled] = createSignal(true);
  const [copied, setCopied] = createSignal(false);
  const [detailed, setDetailed] = createSignal(false);
  const blocks = children(() => held.children);
  const headed = () => register(held.kind).headed;
  const written = () => held.text !== "" || held.tail !== "" || held.streaming;
  const line = (text) => held.onLine && held.onLine(text);
  const copy = () =>
    clip([held.text, held.detail].filter((bit) => bit !== "").join("\n")).then(() => setCopied(true), () => setCopied(false));
  const retry = () => line(held.text);
  const calls = () =>
    held.segments === null
      ? held.tools.length
      : held.segments.filter((segment) => segment.type !== "text").reduce((sum, segment) => sum + segment.items.length, 0);
  const tools = () =>
    held.segments === null
      ? held.tools.length
      : held.segments.filter((segment) => segment.type === "tools").reduce((sum, segment) => sum + segment.items.length, 0);
  const staged = () => (tooled() ? held.segments : held.segments.filter((segment) => segment.type === "text"));
  const toggle = (event) => {
    event.stopPropagation();
    setTooled(!tooled());
  };
  const unfold = (event) => {
    event.stopPropagation();
    setDetailed(!detailed());
  };
  const open = () => line(`/buffer "${held.buffer}"`);
  return (
    <div class={`entry ${held.kind}`} classList={{ headed: headed(), sel: held.selected }} onClick={(event) => held.onPick && held.onPick(event)}>
      <Show when={headed()} fallback={<div class="reg">{register(held.kind).glyph}</div>}>
        <div class="ehead">
          <span class="reg">{register(held.kind).glyph}</span>
          <Show when={held.kind === "you"}>
            <span class="who">{held.who}</span>
          </Show>
          <span class="meta">{held.meta}</span>
          <Show when={calls() > 0}>
            <button type="button" class="tc" classList={{ on: tooled() }} aria-expanded={tooled() ? "true" : "false"} title="show or hide the harness" onClick={toggle}>
              <Caret open={tooled()} />
              {[
                tools() === 0 ? "" : `${tools()} ${tools() === 1 ? "tool" : "tools"}`,
                calls() === tools() ? "" : `${calls() - tools()} thinking`,
              ]
                .filter((bit) => bit !== "")
                .join(" · ")}
            </button>
          </Show>
          <span class="ops">
            <button onClick={copy}>{copied() ? "copied" : "copy"}</button>
            <Show when={held.kind === "you"}>
              <button onClick={retry}>retry</button>
            </Show>
            <Show when={held.buffer !== null}>
              <button onClick={open}>frame</button>
            </Show>
          </span>
        </div>
      </Show>
      <div class="body">
        <Show when={held.segments !== null}>
          <For each={staged()}>
            {(segment, index) => (
              <Dynamic
                component={SEGMENTS[segment.type]}
                segment={segment}
                markdown={held.markdown}
                cursor={held.streaming && index() === staged().length - 1}
              />
            )}
          </For>
          <Show when={held.streaming && held.segments.length === 0}>
            <div class="text">
              <span class="cursor" />
            </div>
          </Show>
        </Show>
        <Show when={held.segments === null && held.think !== null}>
          <Think nodes={held.think} />
        </Show>
        <Show when={held.segments === null && written()}>
          <div class="text">
            <Show
              when={held.kind === "trace"}
              fallback={
                <>
                  <Show when={headed() && held.markdown === "pretty"} fallback={held.text}>
                    <Markdown text={held.text} />
                  </Show>
                  <Show when={held.tail !== ""}>
                    <span class="tail">{held.tail}</span>
                  </Show>
                </>
              }>
              <span class="ts">{held.ts}</span>
              {held.text}
              <Show when={!held.lens.includes("turns") && held.path !== ""}>
                <span class="path">{held.path}</span>
              </Show>
            </Show>
            <Show when={held.streaming}>
              <span class="cursor" />
            </Show>
            <Show when={held.detail !== ""}>
              <button type="button" class="tc" classList={{ on: detailed() }} aria-expanded={detailed() ? "true" : "false"} title="show or hide the details" onClick={unfold}>
                <Caret open={detailed()} />
                details
              </button>
            </Show>
          </div>
        </Show>
        <Show when={held.detail !== "" && detailed()}>
          <div class="detail">{held.detail}</div>
        </Show>
        <Show when={held.heard !== ""}>
          <div class="heard">{held.heard}</div>
        </Show>
        <Show when={held.ans !== ""}>
          <div class="ans">{held.ans}</div>
        </Show>
        <Show when={held.segments === null && held.tools.length > 0 && tooled()}>
          <div class="tools">
            <For each={held.tools}>{(tool) => <Tool tool={tool} />}</For>
          </div>
        </Show>
        <Show when={blocks.toArray().length > 0}>
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
          </div>
        </Show>
      </div>
    </div>
  );
};
