<script>
    import { createEventDispatcher, onMount, onDestroy } from "svelte";
    import { spring } from "svelte/motion";
    import { pan } from "svelte-gestures";

    const dispatch = createEventDispatcher();

    const TAB_THRESHOLD = 50;
    const HORIZONTAL_BIAS = 1.3;
    const stiffness = 0.3;
    const damping = 0.55;

    let cancelled = false;
    let xstart, ystart, yend, xend;

    let x = spring(0, { stiffness, damping });
    let y = spring(0, { stiffness, damping });

    function handleKeyDown(event) {
        if (event.key === "Escape") {
            x.set(0);
            y.set(0);
            xstart = ystart = undefined;
            xend = yend = undefined;
            cancelled = true;
        // } else if (event.code === "Space") {$flashcardsStore.revealed ? flashcardsStore.review("KNOWN") : flashcardsStore.reveal(); dispatch("space");} else if (event.code === "Digit1") {$flashcardsStore.revealed && flashcardsStore.review("UNKNOWN");} else if (event.code === "Digit2") {$flashcardsStore.revealed && flashcardsStore.review("KNOWN");} else if (event.code === "Digit3") {$flashcardsStore.revealed && flashcardsStore.review("GRADUATE");
        }
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
        switch (direction) {
            case "left":
                dispatch("left");
                break;
            case "right":
                dispatch("right");
                break;
            case "up":
                dispatch("up");
                break;
            case "down":
                dispatch("down");
                break;
            case "tap":
                dispatch("tap");
                break;
        }

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

    function determineDirection(xstart, ystart, xend, yend) {
        const dx = xend - xstart;
        const dy = yend - ystart;
        const distance = Math.sqrt(dx * dx + dy * dy);

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
</script>

<div
    class="h-screen"
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
