import { mergeProps } from "solid-js";
import { holding } from "./hold.js";

export const Segment = (props) => {
  const held = mergeProps({ cls: "", open: false, chord: "", delay: 500 }, props);
  let pressed = null;
  const hold = holding(() => held.onHold(held.subject, pressed), held.delay);
  return (
    <button
      class={["seg", held.cls, held.open && "open"].filter((word) => word).join(" ")}
      data-arg={held.subject}
      aria-haspopup="dialog"
      aria-expanded={held.open ? "true" : "false"}
      title={`${held.subject} · ctrl-v ${held.chord}`}
      onClick={(event) => held.onPick && held.onPick(held.subject, event)}
      onPointerDown={(event) => {
        pressed = event;
        if (held.onHold) hold.press();
      }}
      onPointerUp={hold.release}
      onPointerLeave={hold.release}>
      {held.children}
    </button>
  );
};
