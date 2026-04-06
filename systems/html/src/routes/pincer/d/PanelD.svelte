<script>
  import TreeView from "../TreeView.svelte";
  import { outside, inside } from "./vectors.js";
  import { project } from "./project.js";
  import { createDataspace, createTerminal, createPincer } from "./backend.js";

  const dataspace = createDataspace();
  const terminal  = $state(createTerminal());
  const pincer    = $state(createPincer());

  const ctx = $derived({ dataspace, terminal, pincer });

  const vector = $derived(pincer.dPhase === "inside" ? inside : outside);

  const kids = $derived(project(vector, ctx));

  const tree = $derived({
    name: pincer.dPhase === "inside"
      ? `inside ${terminal.toString()}`
      : "outside",
    kids,
  });

  function setPhase(next) {
    pincer.dPhase = next;
  }
</script>

<div class="panel-d-root">
  <div class="phase-tabs">
    <button
      class="tab"
      class:active={pincer.dPhase === "outside"}
      onclick={() => setPhase("outside")}
    >outside</button>
    <button
      class="tab"
      class:active={pincer.dPhase === "inside"}
      onclick={() => setPhase("inside")}
    >inside</button>
  </div>

  <div class="mount-readout">{terminal.toString()}</div>

  <div class="tree-mount">
    <TreeView node={tree} />
  </div>
</div>

<style>
  .panel-d-root {
    display: flex;
    flex-direction: column;
    gap: 6px;
    height: 100%;
    min-height: 0;
    padding: 4px 0;
  }
  .phase-tabs {
    display: flex;
    gap: 4px;
    padding: 0 8px;
    flex-shrink: 0;
  }
  .tab {
    flex: 1;
    height: 24px;
    background: var(--colors-skeleton-3-surface);
    border: 1px solid var(--colors-skeleton-3-boundary);
    color: var(--colors-skeleton-3-contrast);
    font-family: var(--font-family-code);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    opacity: 0.55;
    padding: 0;
  }
  .tab:hover {
    opacity: 0.85;
  }
  .tab.active {
    opacity: 1;
    border-color: var(--colors-skeleton-3-primary-base);
    color: var(--colors-skeleton-3-primary-base);
  }
  .mount-readout {
    padding: 0 12px;
    font-family: var(--font-family-code);
    font-size: 10px;
    color: var(--colors-skeleton-3-contrast);
    opacity: 0.6;
    flex-shrink: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tree-mount {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
</style>
