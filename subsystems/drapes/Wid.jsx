import { Section } from "./Srow.jsx";

export const WIDTH = 320;
export const GUTTER = 8;
export const FLOOR = 180;

export const placed = (at, viewport) => {
  const width = Math.min(WIDTH, viewport.width - 2 * GUTTER);
  return { left: Math.max(GUTTER, Math.min(at.x, viewport.width - width - GUTTER)), bottom: at.bottom, width, height: Math.max(FLOOR, at.room) };
};

export const Wid = (props) => (
  <>
    <div class="scrim" onClick={() => props.onClose()} />
    <div
      class="wid"
      data-zone="0"
      role="dialog"
      aria-label={props.section.title}
      style={`left:${placed(props.at, props.viewport).left}px;bottom:${placed(props.at, props.viewport).bottom}px;width:${placed(props.at, props.viewport).width}px;max-height:${placed(props.at, props.viewport).height}px`}>
      <Section section={props.section} pre="wd" onAct={props.onAct} onFilter={props.onFilter} />
    </div>
  </>
);
