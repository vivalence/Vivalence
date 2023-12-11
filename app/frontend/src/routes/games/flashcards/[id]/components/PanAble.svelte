<script>
    import { onMount, onDestroy } from "svelte";
    import { spring } from "svelte/motion";
    import { pan } from "svelte-gestures";

    import { flashcardsStore } from "../store.js";
    import { determineDirection } from "../library.js";

    let cancelled = false;
    let xstart, ystart, yend, xend;
    const stiffness = 0.3;
    const damping = 0.55;
    let x = spring(0, { stiffness, damping });
    let y = spring(0, { stiffness, damping });

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
    <slot />
</div>
