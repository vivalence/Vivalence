import { createSignal, Show } from "solid-js";
import { Yield } from "./Yield.jsx";

export const STATUS = {
  run: { glyph: "◐", tone: "pri", duration: () => "…" },
  ok: { glyph: "✓", tone: "pos", duration: (tool) => tool.dur },
  wait: { glyph: "?", tone: "cau", duration: () => "waiting" },
  skip: { glyph: "–", tone: "muted", duration: (tool) => tool.dur },
  err: { glyph: "✕", tone: "neg", duration: (tool) => tool.dur },
};

const status = (name) => {
  if (!Object.hasOwn(STATUS, name)) throw new Error(`[drapes] not a tool status: ${JSON.stringify(name)} · ${Object.keys(STATUS).join(" · ")}`);
  return STATUS[name];
};

export const Tool = (props) => {
  const [open, setOpen] = createSignal(false);
  const yielded = () => props.tool.yield !== undefined;
  return (
    <>
      <div class="tool" title={yielded() ? "click for the yield" : ""} onClick={() => setOpen(!open())}>
        <span class={`g ${status(props.tool.status).tone}`}>{status(props.tool.status).glyph}</span>
        <Show when={props.tool.loop}>
          <span class="lp">loop</span>
        </Show>
        <span class="name">{props.tool.name}</span>
        <span class="arg">{props.tool.arg}</span>
        <span class="dur">{status(props.tool.status).duration(props.tool)}</span>
      </div>
      <Show when={open() && yielded()}>
        <Yield value={props.tool.yield} frames={props.tool.frames} />
      </Show>
    </>
  );
};
