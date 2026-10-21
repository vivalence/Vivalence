import { For } from "solid-js";
import { Glyph } from "./Bar.jsx";

export const Dset = (props) => {
  const act = (entry) => props.onAct(entry);
  return (
    <div class="dset">
      <div class="views">
        <For each={props.dset.views}>
          {(entry) => (
            <button class={entry.cur ? "cur" : ""} data-signal={entry.signal} aria-label={entry.label} title={entry.signal} onClick={() => act(entry)}>
              <Glyph view={entry.label} align={props.dset.align} framed={true} />
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
        <span class="track slider" data-slider="share" role="slider" tabindex="0" aria-label="dock share" aria-valuemin="20" aria-valuemax="80" aria-valuenow={props.dset.share}>
          <span class="fill" style={`width:${props.dset.share}%`} />
          <span class="sv" data-slider-v="1">{`${props.dset.share} %`}</span>
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
