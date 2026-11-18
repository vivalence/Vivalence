export const FLOAT = { min: 280, head: 34, width: 260, height: 160, greed: 48 };

export const GAP = "12px";

export const CORNERS = {
  left: { left: GAP, bottom: GAP },
  right: { right: GAP, bottom: GAP },
  top: { right: GAP, top: GAP },
  bottom: { right: GAP, bottom: GAP },
};

const between = (floor, ceiling, value) => Math.max(floor, Math.min(ceiling, value));

export const MOVES = {
  drag: (start, room, dx, dy, min) => ({ ...start, x: between(0, room.width - (min ? FLOAT.min : start.w), start.x + dx), y: between(0, room.height - FLOAT.head, start.y + dy) }),
  left: (start, room, dx) => {
    const x = between(0, start.x + start.w - FLOAT.width, start.x + dx);
    return { x, w: start.x + start.w - x };
  },
  right: (start, room, dx) => ({ w: between(FLOAT.width, room.width - start.x, start.w + dx) }),
  top: (start, room, dx, dy) => {
    const y = between(0, start.y + start.h - FLOAT.height, start.y + dy);
    return { y, h: start.y + start.h - y };
  },
  bottom: (start, room, dx, dy) => ({ h: between(FLOAT.height, room.height - start.y, start.h + dy) }),
};

export const GRIPS = [
  ["top"],
  ["right"],
  ["bottom"],
  ["left"],
  ["top", "left"],
  ["top", "right"],
  ["bottom", "left"],
  ["bottom", "right"],
];

export const ZONES = [
  [({ min }) => min, null],
  [({ x }) => x < FLOAT.greed, "left"],
  [({ x, room }) => x > room.width - FLOAT.greed, "right"],
  [({ y }) => y < FLOAT.greed, "top"],
  [({ y, room }) => y > room.height - FLOAT.greed, "bottom"],
  [() => true, null],
];

export const zone = (held) => ZONES.find(([test]) => test(held))[1];

export const afloat = (float, min) => ({
  position: "absolute",
  left: `${float.x}px`,
  top: `${float.y}px`,
  width: `${min ? FLOAT.min : float.w}px`,
  height: min ? "auto" : `${float.h}px`,
  "max-width": `calc(100% - ${float.x}px)`,
  "max-height": `calc(100% - ${float.y}px)`,
});

export const perch = (align, float, min) => {
  if (float !== null) return afloat(float, min);
  if (!Object.hasOwn(CORNERS, align)) throw new Error(`[drapes] no corner for ${JSON.stringify(align)} · ${Object.keys(CORNERS).join(" · ")}`);
  return { position: "absolute", ...CORNERS[align] };
};

export const carry = (event, kinds, held) => {
  if (event.target.closest("button, select") !== null) return;
  event.preventDefault();
  const element = held.element;
  const rect = element.parentElement.getBoundingClientRect();
  const room = { width: rect.width, height: rect.height };
  const dragged = kinds.includes("drag");
  const shown = { x: element.offsetLeft, y: element.offsetTop, w: element.offsetWidth, h: element.offsetHeight };
  const start = dragged && held.float !== null ? held.float : shown;
  const view = element.ownerDocument.defaultView;
  let landed = { float: start, zone: null };
  const move = (moved) => {
    const dx = moved.clientX - event.clientX;
    const dy = moved.clientY - event.clientY;
    const float = kinds.reduce((placed, kind) => ({ ...placed, ...MOVES[kind](start, room, dx, dy, held.min) }), start);
    const pointer = { x: moved.clientX - rect.left, y: moved.clientY - rect.top };
    landed = { float, zone: dragged ? zone({ min: held.min, ...pointer, room }) : null };
    held.onMove(float, landed.zone);
  };
  const up = () => {
    view.removeEventListener("pointermove", move);
    view.removeEventListener("pointerup", up);
    held.onDrop(landed.float, landed.zone);
  };
  view.addEventListener("pointermove", move);
  view.addEventListener("pointerup", up);
};

export const Grip = (props) => (
  <span
    class={`dgrip ${props.edges.join(" ")}`}
    data-fn="dockresize"
    aria-hidden="true"
    onPointerDown={(event) => props.onGrip(event)}
  />
);
