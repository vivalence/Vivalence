import { createSignal } from "solid-js";

export const FLOOR = 0.2;
export const CEILING = 0.8;
export const clamp = (share) => Math.min(CEILING, Math.max(FLOOR, share));

export const ALONG = {
  right: (rect, event) => (rect.right - event.clientX) / rect.width,
  left: (rect, event) => (event.clientX - rect.left) / rect.width,
  bottom: (rect, event) => (rect.bottom - event.clientY) / rect.height,
  top: (rect, event) => (event.clientY - rect.top) / rect.height,
};

export const ORIENTATION = { right: "v", left: "v", bottom: "h", top: "h" };

const along = (align) => {
  if (!Object.hasOwn(ALONG, align)) throw new Error(`[drapes] no seam along ${JSON.stringify(align)} · ${Object.keys(ALONG).join(" · ")}`);
  return ALONG[align];
};

export const Split = (props) => (
  <div class="split" style={{ "flex-direction": props.direction }}>
    {props.children}
  </div>
);

export const Seam = (props) => {
  const [dragging, setDragging] = createSignal(false);
  let seam;
  const measure = (event) => clamp(along(props.align)(seam.parentElement.getBoundingClientRect(), event));
  const down = (event) => {
    event.preventDefault();
    const view = seam.ownerDocument.defaultView;
    const move = (moved) => props.onDrag(measure(moved));
    const up = (released) => {
      view.removeEventListener("pointermove", move);
      view.removeEventListener("pointerup", up);
      setDragging(false);
      props.onShare(measure(released));
    };
    setDragging(true);
    props.onDrag(measure(event));
    view.addEventListener("pointermove", move);
    view.addEventListener("pointerup", up);
  };
  return (
    <div
      ref={seam}
      classList={{ seam: true, [ORIENTATION[props.align]]: true, drag: dragging() }}
      data-seam="1"
      title="drag · double-click resets · /split"
      onPointerDown={down}
      onDblClick={() => props.onReset()}
    />
  );
};
