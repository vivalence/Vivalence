<script>
  import "../app.css";
  import { writable } from "svelte/store";

  import { initTreeState } from "$components/Tree/context.js";
  import Tree from "$components/Tree/Tree.svelte";

  let { data, children } = $props();

  const tree = initTreeState({ root: data.menuData, isOpen: false });
</script>

<div class="layout bg-theme-ui-background">
  <header class="topbar">
    <div class="logo">VIVALENCE</div>
    <div class="center"></div>
    <div class="account"></div>
  </header>

  <div class="content m-6">
    {#if tree.isOpen}
      <aside class="sidebar grid-container mr-6">
        <Tree />
      </aside>
    {:else}
      <button class="sidebar-open" on:click={() => tree.toggle(true)}>
        <span>></span>
      </button>
    {/if}

    <main class="main grid-container">
      {@render children()}
    </main>
  </div>

  <div class="bottom grid-container m-6 mt-0">
    <button class="fixed p-2 rounded"> Toggle Left </button>
  </div>
</div>

<style>
  * {
    /* border: 1px solid red; */
  }
  .grid-container {
    @apply bg-theme-ui-1 rounded-lg shadow-md border border-theme-border-1;
  }
  .topbar {
    @apply bg-theme-ui-1 shadow-md border-b border-theme-border-1;
    .logo {
      @apply px-6 font-brand font-bold text-palette-white;
      font-size: 50px;
      margin-top: -14px;
      text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.91);
      /* drop-shadow: 3px 3px 6px rgba(0, 0, 0, 0.91); */
    }
  }
  .sidebar {
    @apply w-64 p-0;
  }
  .sidebar-open {
    @apply w-12 h-12 bg-theme-ui-1 text-palette-white rounded-lg shadow-md border border-theme-border-1;
    position: absolute;
    transform: translateX(-110%);
    span {
      margin-right: -15px;
    }
  }
  .layout {
    display: grid;
    height: 100vh;
    grid-template-areas:
      "topbar topbar"
      "content content"
      "bottom bottom";
    grid-template-rows: 50px minmax(0, 1fr) auto;
    grid-template-columns: subgrid;

    .topbar {
      grid-area: topbar;
      display: grid;
      grid-template-areas: "logo center account";
      grid-template-columns: auto 1fr auto;

      .logo {
        grid-area: logo;
      }

      .center {
        grid-area: center;
      }
      .account {
        grid-area: account;
      }
    }

    .content {
      grid-area: content;
      display: grid;
      grid-template-areas: "sidebar main";
      grid-template-columns: auto 1fr;

      .sidebar {
        grid-area: sidebar;
      }

      .main {
        grid-area: main;
        overflow-x: auto;
      }
    }

    .bottom {
      grid-area: bottom;
      display: none;
    }
  }
</style>
