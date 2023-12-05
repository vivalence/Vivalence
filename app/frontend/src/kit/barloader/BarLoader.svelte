<script>
    import { writable } from "svelte/store";
    import { Jellyfish, BarLoader } from "svelte-loading-spinners";

    export const size = 100;
    export const color = "#1ebcb5";
</script>

<div class=" animate-spin-slow inline-block">
    <div class=" rotate-[170deg] inline-block">
        <Jellyfish {size} {color} unit="px" duration="3s" />
    </div>
</div>
