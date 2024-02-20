<script>
  import "../app.postcss";
    import { onMount } from "svelte";
    import Navbar from "../components/navbar/Navbar.svelte";
</script>

<main class="bg-theme-ui-background min-h-screen pt-16">
    <Navbar />
    <slot/>
</main>
