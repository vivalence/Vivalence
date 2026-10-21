import { For } from "solid-js";
import { Icon } from "./Icon.jsx";

export const TABS = ["logger", "inspector"];
export const FLOOR = { w: 320, h: 200 };
export const GUTTER = 4;

export const placed = (frame, bounds) => {
  const w = Math.max(FLOOR.w, Math.min(frame.w, bounds.width - 2 * GUTTER));
  const h = Math.max(FLOOR.h, Math.min(frame.h, bounds.height - 2 * GUTTER));
  const x = Math.max(GUTTER, Math.min(frame.x, bounds.width - w - GUTTER));
  const y = Math.max(GUTTER, Math.min(frame.y, bounds.height - h - GUTTER));
  return { x, y, w, h };
};

const tracked = (event, moved) => {
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
      <div class="tth" title="drag to move" onPointerDown={drag}>
        <span class="ttl">telemetry</span>
        <span class="ttabs">
          <For each={TABS}>
            {(tab) => (
              <button class={props.tab === tab ? "cur" : ""} onClick={() => props.onTab(tab)}>
                {tab}
              </button>
            )}
          </For>
        </span>
        <span class="sp" />
        <span class="mut">{props.count}</span>
        <button class="iconbtn" aria-label="close telemetry" title="close · /telemetry off" onClick={() => props.onClose()}>
          <Icon name="x" size={14} />
        </button>
      </div>
      <div class="tbody">{props.children}</div>
      <span class="tgrip" aria-hidden="true" onPointerDown={resize} />
    </div>
  );
};
