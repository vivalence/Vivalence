import { createEffect, createMemo, createResource, Match, onCleanup, Show, Switch } from "solid-js";
import { modules } from "../accept.js";
import { Button } from "../Button.jsx";
import { Empty } from "../Empty.jsx";
import { JsonTree } from "../JsonTree.jsx";
import { watch } from "../watch.js";

const entry = (buffer) => (buffer.bundle ? buffer.bundle.negotiate(modules) : null);

export const Frame = (props) => {
  const buffer = watch(props.client.terminals.$active, "$buffer");
  const present = () => buffer() !== null && buffer() !== undefined;
  const floor = createMemo(() => present() && entry(buffer()) === null);
  const source = createMemo(() => (!present() || floor() ? false : { buffer: buffer() }));
  const load = (held) => held.buffer.bundle.load(modules).then((module) => ({ buffer: held.buffer, module }));
  const [loaded] = createResource(source, load);
  let stage = null;

  createEffect(() => {
    if (loaded.state !== "ready") return;
    const held = loaded();
    if (held.buffer !== buffer()) return;
    const handle = held.module.default(stage, { buffer: held.buffer, dispatch: props.dispatch });
    onCleanup(() => {
      handle.destroy();
      stage.replaceChildren();
    });
  });

  return (
    <section class="frame-pane">
      <header class="frame-head">
        <span class="frame-title">{!present() ? "no buffer" : `buffer ${buffer().id}`}</span>
        <span class="frame-spring" />
        <Button
          size="mini"
          square
          tone="ghost"
          label="×"
          title="close buffer"
          onClick={() => props.dispatch("/buffer/close")}
        />
      </header>
      <div class="frame-body">
        <Switch>
          <Match when={!present()}>
            <div class="frame-standing">
              <Empty verb="no buffer" trace="open one from a thread" />
            </div>
          </Match>
          <Match when={floor()}>
            <div class="frame-floor" data-floor="application/json">
              <JsonTree value={buffer().data} />
            </div>
          </Match>
          <Match when={loaded.state === "errored"}>
            <div class="frame-standing">
              <Empty tone="negative" verb="bundle refused" trace={loaded.error.message} />
            </div>
          </Match>
          <Match when={loaded.loading}>
            <div class="frame-standing">
              <Empty spinner verb="loading bundle" trace={`buffer ${buffer().id}`} />
            </div>
          </Match>
        </Switch>
        <div class="frame-stage" hidden={!present() || floor()} ref={(element) => (stage = element)} />
      </div>
    </section>
  );
};

export const style = `
.frame-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: var(--surface);
  color: var(--text-ink);
}
.frame-head {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  height: var(--size-row);
  padding: 0 6px 0 12px;
  background: var(--surface-sunk);
  box-shadow: 0 var(--size-ring) 0 var(--boundary);
  font-family: var(--font-family-code);
  font-size: var(--size-type-2xs);
  color: var(--text-light);
}
.frame-spring {
  flex: 1;
}
.frame-body {
  position: relative;
  flex: 1;
  display: flex;
  min-width: 0;
  min-height: 0;
}
.frame-standing {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}
.frame-floor {
  flex: 1;
  min-width: 0;
  overflow: auto;
  padding: var(--size-space-md);
}
.frame-stage {
  flex: 1;
  min-width: 0;
  min-height: 0;
  max-width: 100vw;
}
.frame-stage[hidden] {
  display: none;
}
`;
