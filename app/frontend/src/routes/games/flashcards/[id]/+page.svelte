<script>
    import { page } from "$app/stores";
    import { pan } from "svelte-gestures";
    import { onMount, onDestroy } from "svelte";
    import { spring } from "svelte/motion";

    import FlexContainer from "../../../../kit/flex/Container.svelte";
    import FlexItem from "../../../../kit/flex/Item.svelte";

    import Card from "./components/Card.svelte";
    import Controls from "./components/Controls.svelte";
    import { flashcardsStore } from "./store.js";

    export let data;
    $: ({ GetCards } = data);
    let seeded = false;

    $: if (!seeded && $GetCards.data && $GetCards.data.Game_Flashcards_GetCards) {
        seeded = true;
        flashcardsStore.init({
            cards: $GetCards.data.Game_Flashcards_GetCards,
            gameId: $page.params.id
        });
    }

    const TAB_THRESHOLD = 50;
    const HORIZONTAL_BIAS = 1.3;
    let cancelled = false;
    let xstart, ystart, yend, xend;
    const stiffness = 0.30;
        const damping = 0.55;
    let x = spring(0, { stiffness, damping });
    let y = spring(0, { stiffness, damping });

    function determineDirection(xstart, ystart, xend, yend) {
        const dx = xend - xstart;
        const dy = yend - ystart;
        const distance = Math.sqrt(dx * dx + dy * dy); // Calculate the Euclidean distance

        if (distance < TAB_THRESHOLD) {
            return "tap";
        } else {
            if (Math.abs(dx) * HORIZONTAL_BIAS > Math.abs(dy)) {
                return dx > 0 ? "right" : "left";
            } else {
                return dy > 0 ? "down" : "up";
            }
        }
    }

    function handleKeyDown(event) {
        if (event.key === "Escape") {
            x.set(0);
            y.set(0);
            xstart = ystart = undefined;
            xend = yend = undefined;
            cancelled = true;
        } else if (event.code === "Space") {
            flashcardsStore.reveal();
        } else if (event.code === "Digit1") {
            flashcardsStore.review("UNKNOWN");
        } else if (event.code === "Digit2") {
            flashcardsStore.review("KNOWN");
        } else if (event.code === "Digit3") {
            flashcardsStore.review("GRADUATE");
        }
    }

    function handleStart(event) {
        xstart = event.type === "touchstart" ? event.touches[0].clientX : event.clientX;
        ystart = event.type === "touchstart" ? event.touches[0].clientY : event.clientY;
        cancelled = xend = yend = undefined;
    }

    function handleEnd(event) {
        if (cancelled) return;
        xend = event.type === "touchend" ? event.changedTouches[0].clientX : event.clientX;
        yend = event.type === "touchend" ? event.changedTouches[0].clientY : event.clientY;

        const direction = determineDirection(xstart, ystart, xend, yend);

        if ($flashcardsStore.revealed) {
            switch (direction) {
                case "left":
                    flashcardsStore.review("UNKNOWN");
                    break;
                case "right":
                    flashcardsStore.review("KNOWN");
                    break;
                case "up":
                    flashcardsStore.review("GRADUATE");
                    break;
            }
        } else flashcardsStore.reveal();

        x.set(0);
        y.set(0);
    }

    function handlePan(event) {
        if (!xstart) {
            xstart = event.detail.x;
            ystart = event.detail.y;
        }
        x.set(event.detail.x - xstart);
        y.set(event.detail.y - ystart);
    }

    onMount(() => {
        if (typeof window !== "undefined") {
            window.addEventListener("keydown", handleKeyDown);
        }
    });

    onDestroy(() => {
        if (typeof window !== "undefined") {
            window.removeEventListener("keydown", handleKeyDown);
        }
    });
</script>

<div
    class="h-screen -mt-16 pt-16"
    style="touch-action: none; transform: translate({$x}px, {$y}px)"
    on:mousedown={handleStart}
    on:mouseup={handleEnd}
    on:touchstart={handleStart}
    on:touchend={handleEnd}
    use:pan={{ delay: 30 }}
    on:pan={handlePan}
>
    {#if $flashcardsStore.current}
        <FlexContainer
            items="center"
            justify="center"
            classes=" h-full h-max w-full lg:mt-32 md:mt-20 mt-12"
        >
            <FlexItem>
                <Card />
            </FlexItem>
        </FlexContainer>
    {/if}
</div>
<Controls />
