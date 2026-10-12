import { createSignal } from "solid-js";
import { createComponent, render } from "solid-js/web";
import { belt } from "@vivalence/ghost";

const dock = belt.dock;

export const arrangement = (mounted, layout) => {
  const held = (name) => mounted.includes(name);
  const covered = held("signin");
  const buffer = layout !== null && layout.buffer === true;
  const flags = layout === null ? { full: false, collapsed: false } : layout.dock;
  const frame = !covered && held("frame") && buffer && !(held("dock") && flags.full === true);
  const docked = !covered && held("dock") && !(frame && flags.collapsed === true);
  return {
    crown: held("crown"),
    navigation: held("navigation"),
    signin: held("signin"),
    frame,
    dock: docked,
    handle: frame && docked,
  };
};

const Chassis = (props) => {
  const shown = () => arrangement(props.mounted(), props.layout());
  const direction = () => (props.layout() === null ? "row" : props.layout().dock.direction);
  const basis = () => (shown().handle ? `0 0 ${Math.round(props.layout().dock.share * 1000) / 10}%` : "1 1 auto");
  const vertical = () => props.layout() === null || props.layout().dock.vertical;
  let stage = null;
  let last = null;
  let dragged = null;

  const rect = () => ({ width: stage.clientWidth, height: stage.clientHeight });
  const down = (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    last = { x: event.clientX, y: event.clientY };
    dragged = props.layout().dock.share;
  };
  const move = (event) => {
    if (last === null) return;
    const deltaPx = vertical() ? event.clientX - last.x : event.clientY - last.y;
    last = { x: event.clientX, y: event.clientY };
    dragged = dock.shareAfterDrag({ side: props.layout().dock.side, share: dragged, rect: rect(), deltaPx });
    props.dispatch(`/dock/share ${dragged}`);
  };
  const up = (event) => {
    if (last === null) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    last = null;
    const snapped = dock.snapAfterDrop({ side: props.layout().dock.side, share: dragged, rect: rect() });
    props.dispatch(`/dock/share ${snapped.share}`);
    if (snapped.collapsed === true) props.dispatch("/dock/collapse true");
    if (snapped.full === true) props.dispatch("/dock/full true");
  };

  return (
    <div class="chassis-root" data-zone="1">
      <header
        class="chassis-region chassis-crown"
        data-zone="0"
        data-pane="crown"
        hidden={!shown().crown}
        ref={props.regions.crown}
      />
      <div class="chassis-body">
        <aside
          class="chassis-region chassis-navigation"
          data-zone="0"
          data-pane="navigation"
          hidden={!shown().navigation}
          ref={props.regions.navigation}
        />
        <main class="chassis-stage" style={{ "flex-direction": direction() }} ref={(element) => (stage = element)}>
          <div class="chassis-region chassis-cover" data-pane="signin" hidden={!shown().signin} ref={props.regions.signin} />
          <div class="chassis-region chassis-frame" data-pane="frame" hidden={!shown().frame} ref={props.regions.frame} />
          <div
            class="chassis-handle"
            classList={{ "chassis-handle-vertical": vertical() }}
            hidden={!shown().handle}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}>
            <span class="chassis-grip" />
          </div>
          <div
            class="chassis-region chassis-dock"
            data-pane="dock"
            hidden={!shown().dock}
            style={{ flex: basis() }}
            ref={props.regions.dock}
          />
        </main>
      </div>
    </div>
  );
};

export const assemble = (root, dispatch) => {
  root.classList.add("chassis-host");
  const [mounted, setMounted] = createSignal([]);
  const [layout, setLayout] = createSignal(null);
  const regions = {};
  const bind = (name) => (element) => (regions[name] = element);
  const refs = Object.fromEntries(["crown", "navigation", "signin", "frame", "dock"].map((name) => [name, bind(name)]));
  render(() => createComponent(Chassis, { mounted, layout, dispatch, regions: refs }), root);
  return {
    mount(name, Pane, props) {
      if (mounted().includes(name)) throw new Error(`[chassis] ${name} is mounted already`);
      const dispose = render(() => createComponent(Pane, props), regions[name]);
      setMounted([...mounted(), name]);
      return {
        place: (next) => setLayout(next),
        destroy() {
          dispose();
          setMounted(mounted().filter((held) => held !== name));
        },
      };
    },
  };
};

export const style = `
.chassis-host {
  position: relative;
  height: 100svh;
  margin: 0;
  overflow: hidden;
  background: var(--surface);
  color: var(--text-ink);
  font-family: var(--font-family-sans-text);
}
.chassis-root {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: var(--surface);
  color: var(--text-ink);
}
.chassis-region[hidden],
.chassis-handle[hidden] {
  display: none;
}
.chassis-crown {
  flex: none;
  display: flex;
  background: var(--surface);
  box-shadow: 0 var(--size-ring) 0 var(--boundary);
  z-index: 1;
}
.chassis-body {
  flex: 1;
  display: flex;
  min-width: 0;
  min-height: 0;
}
.chassis-navigation {
  flex: none;
  display: flex;
  min-height: 0;
  background: var(--surface);
  box-shadow: var(--size-ring) 0 0 var(--boundary);
}
.chassis-stage {
  flex: 1;
  display: flex;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
.chassis-cover {
  flex: 1;
  display: grid;
  place-items: center;
  min-width: 0;
  min-height: 0;
  overflow: auto;
}
.chassis-frame {
  flex: 1 1 0;
  display: flex;
  min-width: 0;
  min-height: 0;
}
.chassis-dock {
  display: flex;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
.chassis-handle {
  flex: 0 0 7px;
  display: grid;
  place-items: center;
  cursor: ns-resize;
  touch-action: none;
}
.chassis-handle.chassis-handle-vertical {
  cursor: ew-resize;
}
.chassis-handle:hover {
  background: var(--control-selected);
}
.chassis-grip {
  width: 26px;
  height: 3px;
  border-radius: var(--shape-radius-xs);
  background: var(--boundary);
}
.chassis-handle-vertical .chassis-grip {
  width: 3px;
  height: 26px;
}
`;
