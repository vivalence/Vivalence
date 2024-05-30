<script>
    import { writable } from "svelte/store";
    import { Jellyfish, BarLoader } from "svelte-loading-spinners";

    export let classes = "";
    export let size = 100;
    export let color = "#1ebcb5";
</script>

<div class={`animate-spin-slow inline-block ${classes}`}>
    <div class=" rotate-[170deg] inline-block">
        <Jellyfish {size} {color} unit="px" duration="3s" />
    </div>
</div>
