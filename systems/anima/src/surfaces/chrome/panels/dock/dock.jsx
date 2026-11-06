import { createEffect, from, on, onCleanup, onMount, Show } from "solid-js";
import * as parts from "@vivalence/drapes/parts";
import * as ambient from "../../ambient/index.js";
import { LENSES, lookup } from "../sidebar/sections.js";
import { Journal } from "./journal.jsx";
import { Composer } from "./composer.jsx";

export const HOLD = 420;

export const CLOSERS = { right: "dock", left: "dockl", top: "dock", bottom: "dock" };

export const LIVE = ["RUNNING", "PAUSED"];

export const SLACK = 24;

export const bottomed = (journal) => journal.scrollTop + journal.clientHeight >= journal.scrollHeight - SLACK;

export const following = (journal) => {
  let pinned = true;
  let last = journal.scrollTop;
  let queued = false;
  const pin = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (pinned) journal.scrollTop = journal.scrollHeight;
    });
  };
  const scrolled = () => {
    if (bottomed(journal)) pinned = true;
    else if (journal.scrollTop < last) pinned = false;
    last = journal.scrollTop;
  };
  const resized = new ResizeObserver(pin);
  const mutated = new MutationObserver(pin);
  resized.observe(journal);
  mutated.observe(journal, { childList: true, subtree: true, characterData: true });
  journal.addEventListener("scroll", scrolled, { passive: true });
  pin();
  return {
    repin: () => {
      pinned = true;
      pin();
    },
    release: () => {
      resized.disconnect();
      mutated.disconnect();
      journal.removeEventListener("scroll", scrolled);
    },
  };
};

export const live = (thread, activities) => thread !== null && activities.some((activity) => activity.thread === thread && LIVE.includes(activity.status));

export const floated = (bridge, terminal) => ({ float: null, min: false, ...bridge.float[terminal.id] });

export const refloat = (bridge, terminal, patch) => bridge.$float.set({ ...bridge.float, [terminal.id]: { ...floated(bridge, terminal), ...patch } });

export const popping = (app, terminal, signal) => {
  let held = false;
  let at = null;
  const hold = parts.holding(() => {
    held = true;
    app.bridge.$widget.set(null);
    app.bridge.$popover.set(at);
  }, HOLD);
  return {
    onPointerDown: (event) => {
      const room = event.currentTarget.closest(".client").getBoundingClientRect();
      held = false;
      at = { x: event.clientX - room.left, y: event.clientY - room.top };
      hold.press();
    },
    onPointerUp: () => hold.release(),
    onPointerLeave: () => hold.release(),
    onClick: () => (held ? (held = false) : terminal.repl.dispatch(signal).catch((error) => terminal.controller.stdout.fault(error))),
  };
};

const Head = (props) => {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  return (
    <>
      <Show when={props.dock.view !== "messenger"}>
        <button
          type="button"
          class="iconbtn"
          data-hold="pop"
          aria-label="close the dock"
          title={`${props.dock.view === "messenger" ? "dock it · /dock docked" : "close the dock · /dock closed"} · hold: display`}
          {...popping(app, terminal, props.dock.view === "messenger" ? "/dock docked" : "/dock closed")}>
          <parts.Icon name={lookup(CLOSERS, props.dock.align, "dock align")} />
        </button>
      </Show>
      <Show when={props.min}>
        <span class="dl">{props.thread === null ? "—" : props.thread.word}</span>
        <Show when={props.live}>
          <span class="dot pri live" />
        </Show>
      </Show>
      <button type="button" class="lens" title={`lens · /dock/lens ${lookup(LENSES, props.dock.lens, "lens")}`} onClick={() => terminal.repl.dispatch(`/dock/lens ${lookup(LENSES, props.dock.lens, "lens")}`).catch((error) => terminal.controller.stdout.fault(error))}>
        {props.dock.lens}
      </button>
      <Show when={props.dock.view === "messenger"}>
        <button
          type="button"
          class="iconbtn"
          aria-label={props.min ? "restore" : "minimise"}
          title={`${props.min ? "restore" : "minimise"} · /dock/min`}
          onClick={() => refloat(app.bridge, terminal, { min: !props.min })}>
          <parts.Icon name={props.min ? "restore" : "minimize"} size={14} />
        </button>
        <button type="button" class="iconbtn" aria-label="close the dock" title="close the dock · /dock closed" onClick={() => terminal.repl.dispatch("/dock closed").catch((error) => terminal.controller.stdout.fault(error))}>
          <parts.Icon name="x" size={14} />
        </button>
      </Show>
    </>
  );
};

export function Dock(props) {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const thread = from(terminal.$thread);
  const activities = from(app.client.runtime.entities.activity.$entities);
  const focus = from(app.bridge.$focus);
  const float = from(app.bridge.$float);
  let section;
  let journal;
  onMount(() => {
    const follow = following(journal);
    createEffect(on(thread, follow.repin, { defer: true }));
    onCleanup(follow.release);
  });
  const placed = () => {
    float();
    return floated(app.bridge, terminal);
  };
  const lively = () => live(thread(), parts.listing(activities));
  const min = () => props.floating && placed().min;
  const carried = (event, kind) =>
    props.floating &&
    parts.carry(event, kind, {
      element: section,
      float: placed().float,
      min: placed().min,
      onMove: (moved) => refloat(app.bridge, terminal, { float: moved }),
      onDrop: (moved, zone) => zone !== null && terminal.repl.dispatch("/dock docked").catch((error) => terminal.controller.stdout.fault(error)).then(() => terminal.repl.dispatch(`/dock ${zone}`).catch((error) => terminal.controller.stdout.fault(error))),
    });
  return (
    <section
      ref={section}
      class="pane dock"
      classList={{ focus: focus() === "journal", floating: props.floating, min: min() }}
      data-zone="1"
      style={props.floating ? parts.perch(props.dock.align, placed().float, placed().min) : props.basis}>
      <div
        class="dhead"
        data-r="dhead"
        onPointerDown={(event) => carried(event, "drag")}
        onDblClick={(event) => props.floating && event.target.closest("button") === null && refloat(app.bridge, terminal, { min: !placed().min })}>
        <Head dock={props.dock} thread={thread()} min={min()} live={lively()} />
      </div>
      <div ref={journal} class="journal" data-r="journal" role="log" onClick={() => app.bridge.$focus.set("journal")}>
        <Journal />
      </div>
      <div class="composer" data-r="composer">
        <Composer />
      </div>
      <Show when={props.floating}>
        <parts.Grip onGrip={(event) => carried(event, "resize")} />
      </Show>
    </section>
  );
}
