import { createSignal, For, Show } from "solid-js";
import { Tool } from "./Tool.jsx";

export const NODE = { run: "◐", stop: "–", ok: "✓" };

const seconds = (ms) => `${(ms / 1000).toFixed(1)}s`;

const live = (nodes) => nodes.some((node) => node.status === "run");

const summary = (nodes) => {
  const steps = nodes.filter((node) => node.depth > 0).length;
  const calls = nodes.reduce((sum, node) => sum + node.tools.length, 0);
  const root = nodes.find((node) => node.depth === 0);
  const running = nodes.filter((node) => node.status === "run").at(-1);
  return [
    `${steps} steps · ${calls} calls`,
    root !== undefined && root.dur ? ` · ${seconds(root.dur)}` : "",
    running !== undefined ? ` · ${running.label}` : "",
  ].join("");
};

export const Think = (props) => {
  const [open, setOpen] = createSignal(live(props.nodes));
  return (
    <div class="think" classList={{ live: live(props.nodes), open: open() }}>
      <button class="thh" aria-expanded={String(open())} onClick={() => setOpen(!open())}>
        <span class="g">{live(props.nodes) ? "◐" : "✓"}</span>
        <span class="l">thinking</span>
        <span class="m">{summary(props.nodes)}</span>
        <span class="cv">{open() ? "▾" : "▸"}</span>
      </button>
      <Show when={open()}>
        <div class="thb">
          <For each={props.nodes}>
            {(node) => (
              <div class={`thn d${node.depth} ${node.status}`}>
                <div class="tht">
                  <span class="g">{NODE[node.status]}</span>
                  <span class="l">{node.label}</span>
                  <span class="dur">{node.dur ? seconds(node.dur) : ""}</span>
                </div>
                <Show when={node.text}>
                  <div class="thx">
                    {node.text}
                    <Show when={node.status === "run"}>
                      <span class="cursor" />
                    </Show>
                  </div>
                </Show>
                <Show when={node.tools.length > 0}>
                  <div class="tools">
                    <For each={node.tools}>{(tool) => <Tool tool={tool} />}</For>
                  </div>
                </Show>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
