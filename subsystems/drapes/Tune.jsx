import { createSignal, For } from "solid-js";

export const RADAR = { width: 120, height: 108, center: [60, 62], reach: 40 };

export const SPOKES = [
  [0, -1],
  [-0.866, 0.5],
  [0.866, 0.5],
];

export const LABELS = [
  [60, 10, "middle", 0],
  [2, 96, "start", 9],
  [118, 96, "end", 9],
];

const clamp = (share) => Math.max(0, Math.min(1, share));

export const placed = (spoke, share) => [
  RADAR.center[0] + spoke[0] * RADAR.reach * share,
  RADAR.center[1] + spoke[1] * RADAR.reach * share,
];

export const along = (spoke, x, y) =>
  clamp(((x - RADAR.center[0]) * spoke[0] + (y - RADAR.center[1]) * spoke[1]) / RADAR.reach);

const outline = (shares) => SPOKES.map((spoke, index) => placed(spoke, shares[index]).join(",")).join(" ");

const spokes = SPOKES.map((spoke) => `M${RADAR.center.join(",")} L${placed(spoke, 1).join(",")}`).join(" ");

export const Tune = (props) => {
  const [dragged, setDragged] = createSignal(null);
  const point = () => (dragged() === null ? props.row.point : dragged());
  let radar;
  const spoked = (index) => (event) => {
    const rect = radar.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * RADAR.width;
    const y = ((event.clientY - rect.top) / rect.height) * RADAR.height;
    return along(SPOKES[index], x, y);
  };
  const drag = (index, measure) => (event) => {
    event.preventDefault();
    const view = radar.ownerDocument.defaultView;
    const moved = (pointer) => point().map((held, axis) => (axis === index ? measure(pointer) : held));
    const move = (pointer) => setDragged(moved(pointer));
    const up = (pointer) => {
      view.removeEventListener("pointermove", move);
      view.removeEventListener("pointerup", up);
      view.removeEventListener("pointercancel", up);
      const settled = moved(pointer);
      setDragged(null);
      props.onAct({ signal: `${props.row.signal} ${settled.map((share) => share.toFixed(2)).join(" ")}` });
    };
    setDragged(moved(event));
    view.addEventListener("pointermove", move);
    view.addEventListener("pointerup", up);
    view.addEventListener("pointercancel", up);
  };
  return (
    <div class="srow tune" data-signal={props.row.signal}>
      <svg class="radar" ref={radar} viewBox={`0 0 ${RADAR.width} ${RADAR.height}`}>
        <polygon class="frame" points={outline([1, 1, 1])} />
        <path class="spoke" d={spokes} />
        <polygon class="held" points={outline(point())} />
        <For each={SPOKES}>
          {(spoke, index) => (
            <>
              <text class="axis" x={LABELS[index()][0]} y={LABELS[index()][1]} text-anchor={LABELS[index()][2]}>
                {props.row.axes[index()]}
                <tspan x={LABELS[index()][3] === 0 ? undefined : LABELS[index()][0]} dy={LABELS[index()][3]}>
                  {LABELS[index()][3] === 0 ? " " : ""}
                  {point()[index()].toFixed(2)}
                </tspan>
              </text>
              <circle
                class="knob"
                r="5"
                cx={placed(spoke, point()[index()])[0]}
                cy={placed(spoke, point()[index()])[1]}
                onPointerDown={drag(index(), spoked(index()))}
              />
            </>
          )}
        </For>
      </svg>
    </div>
  );
};
