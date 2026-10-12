import { createEffect, createMemo, createSignal, For, Index, mergeProps, Show } from "solid-js";
import { fit, SHORT } from "../display/strip.js";
import { Button } from "./Button.jsx";

const cut = (key) => (key.short === undefined ? key.label.slice(0, SHORT) : key.short);

export const Strip = (props) => {
  const held = mergeProps({ keys: [], folds: [], fold: null, width: 0 }, props);
  const fullSizers = [];
  const shortSizers = [];
  let foldSizer = null;
  const [full, setFull] = createSignal([]);
  const [short, setShort] = createSignal([]);
  const [folder, setFolder] = createSignal(0);
  const [turned, setTurned] = createSignal(null);
  const [listed, setListed] = createSignal(false);

  createEffect(() => {
    const count = held.keys.length;
    setFull(fullSizers.slice(0, count).map((element) => element.offsetWidth));
    setShort(shortSizers.slice(0, count).map((element) => element.offsetWidth));
    setFolder(foldSizer === null ? 0 : foldSizer.offsetWidth);
  });

  const active = () => Math.max(0, held.keys.findIndex((key) => key.latched));
  const fitted = createMemo(() =>
    fit({ width: held.width, full: full(), short: short(), fold: folder(), stacked: held.fold === "stack", active: active() }),
  );
  const page = () => {
    if (fitted().mode !== "pages") return 0;
    return Math.min(fitted().pages.length - 1, turned() === null ? fitted().page : turned());
  };
  const shown = () => {
    if (fitted().mode === "pages") return held.keys.slice(...fitted().pages[page()]);
    if (fitted().mode === "merged") return held.keys.slice(active(), active() + 1);
    return held.keys;
  };
  const small = () => fitted().mode === "rail" || fitted().mode === "merged";
  const face = (key) => (fitted().labels === "short" ? cut(key) : key.label);

  const pick = (key) => {
    setListed(false);
    held.onPick(key.name);
  };
  const cycle = () => held.onFold(held.folds[(held.folds.indexOf(held.fold) + 1) % held.folds.length]);

  return (
    <div class="kit-strip-host">
      <div class="kit-strip-sizer" inert>
        <Index each={held.keys}>
          {(key, index) => (
            <>
              <span ref={(element) => (fullSizers[index] = element)}>
                <Button size="row" led={key().led} label={key().label} />
              </span>
              <span ref={(element) => (shortSizers[index] = element)}>
                <Button size="row" led={key().led} label={cut(key())} />
              </span>
            </>
          )}
        </Index>
        <Show when={held.folds.length}>
          <span ref={(element) => (foldSizer = element)}>
            <Button size="row" led label={held.fold} />
          </span>
        </Show>
      </div>
      <div class={`kit-strip kit-strip-${fitted().mode}`} data-fit={fitted().mode} style={{ zoom: fitted().zoom }}>
        <Show when={fitted().mode === "pages"}>
          <Button
            size="row"
            square
            muted={page() === 0}
            title="previous"
            label="‹"
            onClick={() => setTurned(Math.max(0, page() - 1))}
          />
          <span class="kit-strip-spring" />
        </Show>
        <For each={shown()}>
          {(key) => (
            <Button
              size={small() ? "mini" : "row"}
              latched={key.latched === true}
              led={key.led === true && !small()}
              title={key.label}
              onClick={() => (fitted().mode === "merged" ? setListed(!listed()) : pick(key))}>
              {face(key)}
              <Show when={key.count !== undefined && !small()}>
                <span class="kit-strip-count">{key.count}</span>
              </Show>
            </Button>
          )}
        </For>
        <Show when={fitted().mode === "pages"} fallback={<span class="kit-strip-spring" />}>
          <span class="kit-strip-spring" />
          <Button
            size="row"
            square
            muted={page() === fitted().pages.length - 1}
            title="next"
            label="›"
            onClick={() => setTurned(Math.min(fitted().pages.length - 1, page() + 1))}
          />
        </Show>
        <Show when={held.folds.length}>
          <Button
            size={small() ? "mini" : "row"}
            square={fitted().labels === "short" || small()}
            title={`fold · ${held.fold} · click to cycle`}
            onClick={cycle}>
            <span class="kit-strip-pips">
              <For each={held.folds}>
                {(name) => <i class="kit-strip-pip" classList={{ "kit-strip-lit": name === held.fold }} />}
              </For>
            </span>
            <Show when={fitted().mode === "row" && fitted().labels === "full"}>{held.fold}</Show>
          </Button>
        </Show>
      </div>
      <Show when={listed()}>
        <div class="kit-strip-list">
          <For each={held.keys}>
            {(key) => (
              <Button
                size="row"
                latched={key.latched === true}
                led={key.led === true}
                label={key.label}
                onClick={() => pick(key)}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

export const style = `
.kit-strip-host {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.kit-strip-sizer {
  position: absolute;
  visibility: hidden;
  pointer-events: none;
  display: flex;
  height: 0;
  overflow: hidden;
}
.kit-strip-sizer span {
  flex: none;
  display: inline-block;
}
.kit-strip {
  flex: none;
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 6px calc(5px + var(--size-depth));
  background: var(--surface-sunk);
  color: var(--text-strong);
  box-shadow: 0 0 0 var(--size-ring) var(--boundary);
}
.kit-strip.kit-strip-pages {
  gap: 8px;
}
.kit-strip.kit-strip-merged {
  padding: 3px 6px calc(3px + var(--size-depth));
}
.kit-strip.kit-strip-rail {
  flex-direction: column;
  gap: 2px;
  padding: 4px 3px;
}
.kit-strip-spring {
  flex: 1 1 0;
  min-width: 0;
}
.kit-strip-count {
  letter-spacing: 0;
  color: var(--control-on-muted);
}
.kit-strip-pips {
  display: grid;
  grid-template-columns: repeat(2, 4px);
  gap: 2px;
}
.kit-strip-pip {
  width: 4px;
  height: 4px;
  border-radius: var(--shape-radius-full);
  background: var(--boundary);
}
.kit-strip-pip.kit-strip-lit {
  background: var(--signal-primary-ink);
}
.kit-strip-list {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  background: var(--surface-lift);
  border-radius: var(--shape-radius-card);
  box-shadow: var(--shape-lift), 0 0 0 var(--size-ring) var(--boundary);
}
`;
