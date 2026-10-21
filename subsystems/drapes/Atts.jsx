import { For, Show } from "solid-js";

export const Atts = (props) => (
  <Show when={props.attachments.length > 0}>
    <div class="atts">
      <For each={props.attachments}>
        {(attachment) => (
          <button class="att" title={`drop · /detach ${attachment.name}`} onClick={() => props.onDrop(attachment)}>
            {attachment.name}
            <span class="x">✕</span>
          </button>
        )}
      </For>
    </div>
  </Show>
);
