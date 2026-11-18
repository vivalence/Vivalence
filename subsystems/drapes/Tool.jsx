import { createSignal, For, Show } from "solid-js";
import { parts } from "@vivalence/dapper";
import { Caret } from "./Caret.jsx";
import { Drill } from "./Drill.jsx";

export const STATUS = {
  run: { glyph: parts.turn.CALLS.run, tone: "pri", duration: () => "…" },
  ok: { glyph: parts.turn.CALLS.ok, tone: "pos", duration: (tool) => tool.dur },
  wait: { glyph: parts.turn.CALLS.wait, tone: "cau", duration: () => "waiting" },
  skip: { glyph: parts.turn.CALLS.skip, tone: "muted", duration: (tool) => tool.dur },
  err: { glyph: parts.turn.CALLS.err, tone: "neg", duration: (tool) => tool.dur },
};

const status = (name) => {
  if (!Object.hasOwn(STATUS, name)) throw new Error(`[drapes] not a tool status: ${JSON.stringify(name)} · ${Object.keys(STATUS).join(" · ")}`);
  return STATUS[name];
};

export const UNFOLDED = 1;

const Fold = (props) => {
  const [open, setOpen] = createSignal(true);
  return (
    <div class="tf" classList={{ open: open() }}>
      <button type="button" class="tfh" aria-expanded={open() ? "true" : "false"} onClick={() => setOpen(!open())}>
        <Caret open={open()} />
        <span class="l">{props.label}</span>
      </button>
      <Show when={open()}>{props.children}</Show>
    </div>
  );
};

export const Tool = (props) => {
  const [open, setOpen] = createSignal(props.tool.status === "err");
  return (
    <div class={`toolc ${status(props.tool.status).tone}`} classList={{ open: open() }}>
      <button type="button" class="tool" aria-expanded={open() ? "true" : "false"} onClick={() => setOpen(!open())}>
        <Caret open={open()} />
        <span class={`g ${status(props.tool.status).tone}`}>{status(props.tool.status).glyph}</span>
        <Show when={props.tool.loop}>
          <span class="lp">loop</span>
        </Show>
        <span class="name">{props.tool.name}</span>
        <span class="arg">{props.tool.arg}</span>
        <span class="dur">{status(props.tool.status).duration(props.tool)}</span>
      </button>
      <Show when={open()}>
        <div class="toolb">
          <Show when={props.tool.input !== undefined}>
            <Fold label="input">
              <Drill value={props.tool.input} unfolded={UNFOLDED} />
            </Fold>
          </Show>
          <Show when={props.tool.yield !== undefined}>
            <Fold label="yield">
              <Show when={props.tool.frames !== undefined}>
                <div class="frames">
                  <For each={props.tool.frames}>{(frame) => <div>{frame}</div>}</For>
                </div>
              </Show>
              <Drill value={props.tool.yield} unfolded={UNFOLDED} />
            </Fold>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export const THOUGHT = { run: "pri", ok: "pos", stop: "muted" };

export const Thought = (props) => {
  const [open, setOpen] = createSignal(false);
  return (
    <div class={`toolc thought ${THOUGHT[props.node.status]}`} classList={{ open: open() }}>
      <button type="button" class="tool" aria-expanded={open() ? "true" : "false"} onClick={() => setOpen(!open())}>
        <Caret open={open()} />
        <span class={`g ${THOUGHT[props.node.status]}`}>{props.node.status === "run" ? "◐" : "✓"}</span>
        <span class="name">thinking</span>
        <span class="arg">{props.node.label}</span>
        <span class="dur">{props.node.status === "run" ? "…" : ""}</span>
      </button>
      <Show when={open()}>
        <div class="toolb">
          <div class="thx">{props.node.text}</div>
        </div>
      </Show>
    </div>
  );
};
