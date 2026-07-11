<script>
  import { Icon } from "@vivalence/drapes";

  let { bridge } = $props();

  let collapsed = $state(bridge.dock.collapsed);
  bridge.$dock.subscribe((d) => (collapsed = d.collapsed));
</script>

<button
  class="dock"
  class:on={!collapsed}
  title={collapsed ? "open chat" : "hide chat"}
  onclick={() => bridge.setDockCollapsed(!collapsed)}>
  <Icon carbon="Chat" size="sm" variant={collapsed ? "ui" : "primary"} />
  <span class="lbl">chat</span>
</button>

<style>
  .dock {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 22px;
    padding: 0 10px;
    border-radius: 3px;
    cursor: pointer;
    font: inherit;
    transition: all 0.1s;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-contrast) 22%, transparent);
    background: color-mix(in srgb, #000 22%, var(--colors-skeleton-2-surface));
    color: var(--colors-skeleton-0-contrast);
  }
  .dock:hover {
    border-color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 45%, transparent);
  }
  .dock.on {
    border-color: var(--colors-skeleton-0-primary-base);
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 16%, transparent);
  }
  .lbl {
    font-size: var(--font-size-2xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 600;
    opacity: 0.7;
  }
  .dock.on .lbl {
    color: var(--colors-skeleton-0-primary-base);
    opacity: 1;
  }
</style>
