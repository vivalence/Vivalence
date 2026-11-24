import { For, Show } from "solid-js";
import { Icon } from "./Icon.jsx";

export const TABS = ["inspector", "logger"];
export const FLOOR = { w: 320, h: 200 };
export const GUTTER = 4;

export const placed = (frame, bounds) => {
  const w = Math.max(FLOOR.w, Math.min(frame.w, bounds.width - 2 * GUTTER));
  const h = Math.max(FLOOR.h, Math.min(frame.h, bounds.height - 2 * GUTTER));
  const x = Math.max(GUTTER, Math.min(frame.x, bounds.width - w - GUTTER));
  const y = Math.max(GUTTER, Math.min(frame.y, bounds.height - h - GUTTER));
  return { x, y, w, h };
};

export const tracked = (event, moved) => {
  event.preventDefault();
  const view = event.currentTarget.ownerDocument.defaultView;
  const origin = { x: event.clientX, y: event.clientY };
  const move = (next) => moved({ dx: next.clientX - origin.x, dy: next.clientY - origin.y });
  const up = () => {
    view.removeEventListener("pointermove", move);
    view.removeEventListener("pointerup", up);
  };
  view.addEventListener("pointermove", move);
  view.addEventListener("pointerup", up);
};

export const Tele = (props) => {
  const frame = () => placed(props.frame, props.bounds);
  const drag = (event) => {
    if (event.target.closest("button")) return;
    const start = frame();
    tracked(event, ({ dx, dy }) => props.onPlace({ ...start, x: start.x + dx, y: start.y + dy }));
  };
  const resize = (event) => {
    const start = frame();
    tracked(event, ({ dx, dy }) => props.onPlace({ ...start, w: start.w + dx, h: start.h + dy }));
  };
  return (
    <div
      class="tele"
      data-zone="3"
      role="dialog"
      aria-label="telemetry"
      style={{ left: `${frame().x}px`, top: `${frame().y}px`, width: `${frame().w}px`, height: `${frame().h}px` }}>
      <div class="ins-head" title="drag to move" onPointerDown={drag}>
        <span class="kit-label">telemetry</span>
        <div class="kit-choice" role="tablist">
          <For each={TABS}>
            {(tab) => (
              <button role="tab" aria-pressed={String(props.tab === tab)} aria-selected={String(props.tab === tab)} onClick={() => props.onTab(tab)}>
                {tab === "logger" ? `logger ${props.count}` : tab}
              </button>
            )}
          </For>
        </div>
        <span class="ins-gap" />
        <button class="kit-seg" aria-label="copy the kept log" title="copy the kept log · /telemetry/copy" onClick={() => props.onCopy()}>
          copy
        </button>
        <Show when={props.faults > 0}>
          <button class="kit-seg is-fault" aria-label="faults, show them" onClick={() => props.onFaults()}>
            {`! ${props.faults}`}
          </button>
        </Show>
        <button class="ins-x" aria-label="close" title="close · /telemetry off" onClick={() => props.onClose()}>
          <Icon name="x" size={12} />
        </button>
      </div>
      <div class="tbody">{props.children}</div>
      <span class="tgrip" aria-hidden="true" onPointerDown={resize} />
    </div>
  );
};
