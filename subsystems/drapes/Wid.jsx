import { Show } from "solid-js";
import { Section } from "./Srow.jsx";
import { placed as framed, tracked } from "./Tele.jsx";

export const SPANS = {
  entity: 460,
  activity: 460,
  harness: 460,
  display: 320,
  box: 460,
  system: 460,
  control: 320,
};
export const GUTTER = 8;
export const FLOOR = 180;

export const spanned = (id) => {
  if (Object.hasOwn(SPANS, id)) return SPANS[id];
  throw new Error(`[drapes] not a widget: ${JSON.stringify(id)} · ${Object.keys(SPANS).join(" · ")}`);
};

export const placed = (at, viewport, span) => {
  const width = Math.min(span, viewport.width - 2 * GUTTER);
  return {
    left: Math.max(GUTTER, Math.min(at.x, viewport.width - width - GUTTER)),
    bottom: at.bottom,
    width,
    height: Math.max(FLOOR, at.room),
  };
};

const glued = (at) =>
  `left:${at.left}px;bottom:${at.bottom}px;width:${at.width}px;max-height:${at.height}px`;

const floated = (frame) =>
  `left:${frame.x}px;top:${frame.y}px;width:${frame.w}px;height:${frame.h}px`;

export const Wid = (props) => {
  let element;
  const frame = () => (props.phone ? undefined : props.frame);
  const measured = () => ({
    x: element.offsetLeft,
    y: element.offsetTop,
    w: element.offsetWidth,
    h: element.offsetHeight,
  });
  const held = () => (frame() === undefined ? measured() : framed(frame(), props.viewport));
  const style = () =>
    frame() === undefined
      ? glued(placed(props.at, props.viewport, spanned(props.section.id)))
      : floated(held());
  const drag = (event) => {
    if (props.phone || event.target.closest(".subjh") === null) return;
    const start = held();
    tracked(event, ({ dx, dy }) => props.onPlace({ ...start, x: start.x + dx, y: start.y + dy }));
  };
  const resize = (event) => {
    const start = held();
    tracked(event, ({ dx, dy }) => props.onPlace({ ...start, w: start.w + dx, h: start.h + dy }));
  };
  return (
    <>
      <div class="scrim" onClick={() => props.onClose()} />
      <div
        ref={element}
        class="wid"
        data-zone="0"
        role="dialog"
        aria-label={props.section.title}
        style={style()}
        onPointerDown={drag}>
        <Section section={props.section} pre="wd" onAct={props.onAct} onFilter={props.onFilter} />
        <Show when={!props.phone}>
          <span class="wgrip" aria-hidden="true" onPointerDown={resize} />
        </Show>
      </div>
    </>
  );
};
