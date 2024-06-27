<script>
    import { getDrawerStore, Drawer } from "@skeletonlabs/skeleton";
    import { dev } from "$app/environment";
    import { onMount } from "svelte";

    export let locals;
    const drawerStore = getDrawerStore();
    let isOpen = false;
    function toggleDebugDrawer() {
        isOpen = !isOpen;
        if (isOpen) {
            openDrawer();
        } else {
            drawerStore.close();
        }
    }
    function openDrawer() {
        drawerStore.open({
            id: "debug-drawer",
            position: "bottom",
            height: "h-[280px]",
            padding: "p-4",
            rounded: "rounded-t-container-token"
        });
    }
    onMount(() => {
        if (dev && isOpen) {
            openDrawer();
        }
    });

    async function getInstructions() {
        const input = { take: 1, blacklist: {}, strategyId: "" };
        const response = await locals.client(`instructions/get/test`, input).response();
        console.log("instructions response", response);
    }
</script>

{#if dev}
    <div class="fixed left-4 top-20 z-40">
        <button class="btn variant-filled-primary btn-sm p-1" on:click={toggleDebugDrawer}>
            {isOpen ? "Close" : "Debug"}
        </button>
    </div>

    <Drawer>
        <div class="p-4">
            {#if $drawerStore.id === "debug-drawer"}
                <h3 class="h3 mb-4">Debug Tools</h3>
                <div class="flex flex-row gap-2">
                    <button class="btn variant-soft-secondary" on:click={getInstructions}>
                        Get Instructions
                    </button>
                </div>
            {/if}
        </div>
    </Drawer>
{/if}
