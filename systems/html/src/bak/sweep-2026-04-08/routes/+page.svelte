<script>
  import "../client.css";
  import { setContext } from "svelte";
  import { fromm, Signal, steer } from "@vivalence/typology";
  import { commands } from "./commands.js";
  import { Terminal } from "../terminal/terminal.js";
  import Stream from "../terminal/Stream.svelte";
  import Modeline from "../terminal/Modeline.svelte";

  const terminal = new Terminal();
  setContext("terminal", terminal);

  const phase = terminal.$phase;

  let entries = $state([]);
  let input = $state("");

  async function submit(event) {
    event.preventDefault();
    if (!input.trim()) return;
    const signal = new Signal(input.trim());
    const flags = fromm.signal(signal).flags;
    input = "";

    try {
      const cast = steer.invoke(commands, signal, steer.direct);
      const output = await cast({ signal, flags, terminal });
      if (output != null) entries = [...entries, { command: signal.pathname, output }];
    } catch (error) {
      entries = [...entries, { command: signal.pathname, output: error.message }];
    }
  }
</script>

<div class="shell">
  <div class="surface">
    {#if $phase === "STREAM"}
      <Stream />
    {:else}
      <div class="repl">
        <div class="repl-history">
          {#each entries as entry}
            <div><span class="prompt">viva&gt;</span> {entry.command}</div>
            {#if typeof entry.output === "string"}
              <div class="output">{entry.output}</div>
            {:else if entry.output?.component}
              <div class="output">
                <entry.output.component {...entry.output.props} />
              </div>
            {/if}
          {/each}
        </div>

        <form class="repl-input" onsubmit={submit}>
          <span class="prompt">viva&gt;</span>
          <input bind:value={input} autofocus />
        </form>
      </div>
    {/if}
  </div>
  <Modeline />
</div>

<style>
  .shell {
    display: grid;
    grid-template-rows: 1fr auto;
    height: 100svh;
    overflow: hidden;
  }
  .surface {
    display: grid;
    min-height: 0;
    overflow: hidden;
  }
  .repl {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    overflow: hidden;
    background: var(--colors-skeleton-app-surface);
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-contrast);
  }
  .repl-history {
    overflow-y: auto;
    padding: 0 1rem;
  }
  .repl-input {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem 2rem;
  }
  .prompt {
    color: var(--colors-theme-primary-contrast);
    margin-right: 0.5ch;
  }
  .output {
    padding-left: 2ch;
    color: var(--colors-skeleton-2-contrast);
    white-space: pre-wrap;
  }
  input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    font: inherit;
    color: inherit;
    caret-color: var(--colors-theme-primary-contrast);
  }
</style>
