import { createSignal, For } from "solid-js";
import { Glyph } from "./Bar.jsx";

export const SHARE = { floor: 20, ceiling: 80 };

export const Dset = (props) => {
  const act = (entry) => props.onAct(entry);
  const [sliding, setSliding] = createSignal(null);
  const share = () => (sliding() === null ? props.dset.share : sliding());
  let track;
  const measure = (event) => {
    const rect = track.getBoundingClientRect();
    return Math.round(Math.min(SHARE.ceiling, Math.max(SHARE.floor, ((event.clientX - rect.left) / rect.width) * 100)));
  };
  const down = (event) => {
    event.preventDefault();
    const view = track.ownerDocument.defaultView;
    const move = (moved) => setSliding(measure(moved));
    const up = (released) => {
      view.removeEventListener("pointermove", move);
      view.removeEventListener("pointerup", up);
      view.removeEventListener("pointercancel", up);
      setSliding(null);
      act({ signal: `${props.dset.slide} ${(measure(released) / 100).toFixed(2)}` });
    };
    setSliding(measure(event));
    view.addEventListener("pointermove", move);
    view.addEventListener("pointerup", up);
    view.addEventListener("pointercancel", up);
  };
  return (
    <div class="dset">
      <div class="views">
        <For each={props.dset.views}>
          {(entry) => (
            <button class={entry.cur ? "cur" : ""} data-signal={entry.signal} aria-label={entry.label} title={entry.signal} onClick={() => act(entry)}>
              <Glyph view={entry.label} align={props.dset.align} />
            </button>
          )}
        </For>
      </div>
      <div class="aligns">
        <For each={props.dset.aligns}>
          {(entry) => (
            <button class={entry.cur ? "cur" : ""} data-signal={entry.signal} aria-label={`dock ${entry.label}`} title={entry.signal} onClick={() => act(entry)}>
              {entry.glyph}
            </button>
          )}
        </For>
      </div>
      <div class="shrow">
        <button data-signal={props.dset.less.signal} aria-label="less" onClick={() => act(props.dset.less)}>
          −
        </button>
        <span ref={track} class="track slider" data-slider="share" role="slider" tabindex="0" aria-label="dock share" aria-valuemin="20" aria-valuemax="80" aria-valuenow={share()} onPointerDown={down}>
          <span class="fill" style={`width:${share()}%`} />
          <span class="sv" data-slider-v="1">{`${share()} %`}</span>
        </span>
        <button data-signal={props.dset.more.signal} aria-label="more" onClick={() => act(props.dset.more)}>
          +
        </button>
      </div>
    </div>
  );
};

export const GUTTER = 8;
export const WIDTH = 296;
export const LIFT = 168;
export const DROP = 14;
export const FLOOR = 176;
export const REACH = 140;

export const placed = (at, viewport) => ({
  left: Math.max(GUTTER, Math.min(at.x - REACH, viewport.width - WIDTH)),
  top: at.y > viewport.height / 2 ? Math.max(GUTTER, at.y - LIFT) : Math.min(at.y + DROP, viewport.height - FLOOR),
});

export const Pop = (props) => (
  <>
    <div class="scrim" onClick={() => props.onClose()} />
    <div class="pop" data-zone="0" role="dialog" aria-label="display" style={`left:${placed(props.at, props.viewport).left}px;top:${placed(props.at, props.viewport).top}px`}>
      <Dset dset={props.dset} onAct={props.onAct} />
    </div>
  </>
);
