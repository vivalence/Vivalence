import { Show } from "solid-js";
import { Pip } from "../Pip.jsx";
import { watch } from "../watch.js";
import * as reading from "./reading.js";

export const Crown = (props) => {
  const thread = watch(props.client.terminals.$active, "$thread");
  const user = watch(props.client.runtime.lighthouse.$user);
  const live = watch(props.client.terminals.$active, "$thread", "$live");
  const status = watch(props.client.runtime.lighthouse.$status);
  const mode = () => (thread() === null || thread() === undefined ? null : thread().mode);

  return (
    <div class="crown-pane">
      <span class="crown-sigil">✦</span>
      <span class="crown-instance">{props.client.mask.manifest.slug}</span>
      <Show when={reading.who(user())}>
        {(name) => (
          <>
            <span class="crown-dot">·</span>
            <span class="crown-user">{name()}</span>
          </>
        )}
      </Show>
      <Show when={mode()}>
        {(held) => (
          <>
            <span class="crown-dot">·</span>
            <span class="crown-daemon">{reading.owner(props.client.runtime, held()).slug}</span>
            <span class="crown-dot">›</span>
            <span class="crown-mode">{held().slug}</span>
          </>
        )}
      </Show>
      <Show when={live() !== null && live() !== undefined}>
        <span class="crown-dot">·</span>
        <span class="crown-streaming">
          <Pip tone="primary" pulse glow />
          streaming
        </span>
      </Show>
      <span class="crown-spring" />
      <Show when={status().code === "OFFLINE"}>
        <span class="crown-offline">offline</span>
      </Show>
    </div>
  );
};

export const style = `
.crown-pane {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  height: var(--size-key);
  padding: 0 14px;
  font-family: var(--font-family-code);
  font-size: var(--size-type-2xs);
  color: var(--text-ink);
  white-space: nowrap;
  overflow: hidden;
}
.crown-sigil {
  color: var(--signal-primary-ink);
  font-size: var(--size-type-xs);
}
.crown-instance {
  font-family: var(--font-family-brand);
  font-size: var(--size-type-sm);
  font-weight: 600;
  color: var(--text-header);
}
.crown-dot {
  color: var(--text-muted);
}
.crown-user {
  color: var(--text-strong);
}
.crown-daemon {
  color: var(--text-light);
}
.crown-mode {
  color: var(--text-strong);
  font-weight: 600;
}
.crown-streaming {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--signal-primary-ink);
}
.crown-spring {
  flex: 1;
}
.crown-offline {
  padding: 2px 8px;
  border-radius: var(--shape-radius-pill);
  background: var(--signal-negative);
  color: var(--signal-negative-on);
  font-weight: 600;
  letter-spacing: var(--shape-label-track);
  text-transform: var(--shape-label-case);
}
`;
