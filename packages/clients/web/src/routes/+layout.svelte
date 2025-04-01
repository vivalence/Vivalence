<script>
  import "../style/app.css";
  import "../style/bsp/bsp.css";
  import "./+layout.css";

  import Sidebar from "./sidebar.svelte";

  let { children, data } = $props();
</script>

<div class="bsp-chain-root layout">
  <header class="topbar">
    <a href="/"><div class="logo">VIVALENCE</div></a>
    <div class="center"></div>
    <div class="account"></div>
  </header>

  <div class="bsp-node content m-6">
    <aside class="bsp-node aside">
      <Sidebar menudata={data.menudata} />
    </aside>

    <main class="bsp-node main">
      {@render children()}
    </main>
  </div>

  <!-- <div class="bottom grid-container m-6 mt-0"> <button class="fixed p-2 rounded"> Toggle Left </button> </div> -->
</div>
