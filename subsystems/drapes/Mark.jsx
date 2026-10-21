import { mergeProps, Show } from "solid-js";
import { holding } from "./hold.js";

export const VIKET = import.meta.resolve("@vivalence/dapper/assets/viket/pic-vinca-viket_white.svg");

export const Viket = (props) => <span class={props.live ? "viket live" : "viket"} style={`width:${props.size}px;height:${props.size}px`} aria-hidden="true" />;

export const Mark = (props) => {
  const held = mergeProps({ size: 20, live: false, fault: false, open: false, delay: 500 }, props);
  const hold = holding(() => held.onHold(), held.delay);
  return (
    <button
      class={held.open ? "mark open" : "mark"}
      aria-label="vivalence"
      title="once: keys · twice: repl · hold: sidebar"
      onClick={(event) => held.onPick && held.onPick(event)}
      onDblClick={(event) => held.onDouble && held.onDouble(event)}
      onPointerDown={() => held.onHold && hold.press()}
      onPointerUp={hold.release}
      onPointerLeave={hold.release}>
      <Viket size={held.size} live={held.live} />
      <Show when={held.fault}>
        <span class="fault" />
      </Show>
    </button>
  );
};
