import { For, Show } from "solid-js";
import { JsonTree } from "./JsonTree.jsx";

export const INSET = { padding: "8px 12px 10px" };

export const Yield = (props) => (
  <div class="yield" style={props.style}>
    <Show when={props.frames !== undefined}>
      <span class="frames">
        <For each={props.frames}>
          {(frame, index) => (
            <>
              <Show when={index() > 0}>
                <br />
              </Show>
              {frame}
            </>
          )}
        </For>
      </span>
    </Show>
    <JsonTree value={props.value} />
  </div>
);
