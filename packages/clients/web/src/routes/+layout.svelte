<script>
  import "../style/app.css";
  import "../style/bsp/bsp.css";

  import Menu from "./sidebar.svelte";
  let { children } = $props();
</script>

<div class="layout">
  <header class="topbar">
    <a href="/"><div class="logo">VIVALENCE</div></a>
    <div class="center"></div>
    <div class="account"></div>
  </header>

  <div class="content m-6">
    <Menu />

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
  .layout {
    @apply bg-skeleton-app-surface;
  }
  .grid-container {
    @apply bg-skeleton-surface-1 border-skeleton-boundary-1 rounded-lg shadow-md border;
  }
  .topbar {
    @apply bg-skeleton-surface-1 border-skeleton-boundary-1 shadow-md border-b;
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
    @apply w-12 h-12 rounded-lg shadow-md border;
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
