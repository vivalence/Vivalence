import { createSignal, For, Show } from "solid-js";
import { Image } from "./Image.jsx";
import { Toggles } from "./Toggles.jsx";

const pictured = (attachment) => attachment.file !== null && attachment.file.mime.startsWith("image/");

export const Atts = (props) => {
  const [previewing, setPreviewing] = createSignal(true);
  const pictures = () => props.attachments.filter(pictured);
  return (
    <Show when={props.attachments.length > 0}>
      <Show when={previewing() && pictures().length > 0}>
        <div class="previews">
          <For each={pictures()}>{(attachment) => <Image src={attachment.file.url} alt={attachment.name} />}</For>
        </div>
      </Show>
      <div class="atts">
        <Show when={pictures().length > 0}>
          <Toggles
            label="preview"
            options={["preview"]}
            on={previewing() ? ["preview"] : []}
            icons={{ preview: "find" }}
            onPick={() => setPreviewing(!previewing())}
          />
        </Show>
        <For each={props.attachments}>
          {(attachment) => (
            <button
              class="att"
              classList={{ flying: attachment.file === null }}
              style={attachment.file === null ? { "--landed": attachment.landed / attachment.bytes } : undefined}
              title={`drop · /detach ${attachment.name}`}
              onClick={() => props.onDrop(attachment)}
            >
              {attachment.name}
              <span class="x">✕</span>
            </button>
          )}
        </For>
      </div>
    </Show>
  );
};
