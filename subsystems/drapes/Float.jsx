export const FLOAT = { min: 280, head: 34, width: 260, height: 160, edge: 28 };

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
  resize: (start, room, dx, dy) => ({ ...start, w: between(FLOAT.width, room.width - start.x, start.w + dx), h: between(FLOAT.height, room.height - start.y, start.h + dy) }),
};

export const ZONES = [
  [({ min }) => min, null],
  [({ x }) => x < FLOAT.edge, "left"],
  [({ x, room }) => x > room.width - FLOAT.edge, "right"],
  [() => true, null],
];

export const zone = (held) => ZONES.find(([test]) => test(held))[1];

export const afloat = (float, min) => ({
  position: "absolute",
  left: `${float.x}px`,
  top: `${float.y}px`,
  width: `${min ? FLOAT.min : float.w}px`,
  height: min ? "auto" : `${float.h}px`,
});

export const perch = (align, float, min) => {
  if (float !== null) return afloat(float, min);
  if (!Object.hasOwn(CORNERS, align)) throw new Error(`[drapes] no corner for ${JSON.stringify(align)} · ${Object.keys(CORNERS).join(" · ")}`);
  return { position: "absolute", ...CORNERS[align] };
};

export const carry = (event, kind, held) => {
  if (event.target.closest("button") !== null) return;
  event.preventDefault();
  const element = held.element;
  const rect = element.parentElement.getBoundingClientRect();
  const room = { width: rect.width, height: rect.height };
  const start = held.float === null ? { x: element.offsetLeft, y: element.offsetTop, w: element.offsetWidth, h: element.offsetHeight } : held.float;
  const view = element.ownerDocument.defaultView;
  let landed = { float: start, zone: null };
  const move = (moved) => {
    const float = MOVES[kind](start, room, moved.clientX - event.clientX, moved.clientY - event.clientY, held.min);
    landed = { float, zone: kind === "drag" ? zone({ min: held.min, x: moved.clientX - rect.left, room }) : null };
    held.onMove(float);
  };
  const up = () => {
    view.removeEventListener("pointermove", move);
    view.removeEventListener("pointerup", up);
    held.onDrop(landed.float, landed.zone);
  };
  view.addEventListener("pointermove", move);
  view.addEventListener("pointerup", up);
};

export const Grip = (props) => <span class="dgrip" data-fn="dockresize" aria-hidden="true" onPointerDown={(event) => props.onGrip(event)} />;
