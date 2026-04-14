<script>
  import { page } from "$app/stores"

  const skins = ["tree", "palette", "breadcrumb"]
</script>

<div class="skinner-shell">
  <nav class="skinner-nav">
    <a href="/skinner" class="skinner-brand">skinner</a>
    {#each skins as skin}
      <a
        href="/skinner/{skin}"
        class="skinner-link"
        class:active={$page.url.pathname === `/skinner/${skin}`}
      >{skin}</a>
    {/each}
  </nav>
  <main class="skinner-main">
    <slot />
  </main>
</div>

<style>
  .skinner-shell {
    display: flex;
    min-height: 100vh;
    background: var(--colors-skeleton-0-surface);
    color: var(--colors-skeleton-0-contrast);
  }

  .skinner-nav {
    flex: 0 0 140px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 16px 12px;
    border-right: 1px solid var(--colors-skeleton-0-boundary);
    font-family: var(--font-family-code);
    font-size: 11px;
  }

  .skinner-brand {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--colors-skeleton-0-primary-base);
    text-decoration: none;
  }

  .skinner-link {
    padding: 4px 8px;
    border-radius: 3px;
    color: var(--colors-skeleton-1-contrast);
    text-decoration: none;
    opacity: 0.6;
  }

  .skinner-link:hover { opacity: 0.9 }
  .skinner-link.active {
    opacity: 1;
    background: var(--colors-skeleton-0-surface);
    color: var(--colors-skeleton-0-primary-base);
  }

  .skinner-main {
    flex: 1;
    padding: 24px;
    overflow: auto;
  }
</style>
