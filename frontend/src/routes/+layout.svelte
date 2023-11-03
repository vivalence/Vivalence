<script>
    import "../app.css";
    import { onMount } from "svelte";
    let logo = "";

    // onMount(async () => {
    //     // Load the logo here if it's dynamic or any other logic
    // });
</script>

<style>
    /* Using Tailwind classes for styling */
</style>

<main class="bg-gray-600 min-h-screen">
    <header class="bg-black p-4">
        <img src="{logo}" alt="Logo" class="h-10 mx-auto">
    </header>
    <slot></slot>
</main>

