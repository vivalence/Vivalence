<script>
    export let data = [];
    let total = data.reduce((acc, curr) => acc + curr.number, 0);
</script>

<div class="flex">
    {#each data.sort((a, b) => a.index - b.index) as { label, number, class: cssClass, color }, i}
        <div
            class="line-segment h-4 relative cursor-pointer {cssClass} {color}"
            style="width: {(number / total) * 100}%;);"
            data-label={label}
        ></div>
    {/each}
        <!-- <div class="line-segment h-4 animated bg-primary-500" style="width: 0%;"></div> -->
</div>

<style>
    @keyframes shrink {
        0% {
          width: 1000%;
        }
        100% {
          width: 0%;
        }
    }
    @keyframes fadeIn {
        0% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }
    @keyframes bounceUp {
        0% {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
        }
        100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    .line-segment:hover::after {
        content: attr(data-label);
        position: absolute;
        padding: var(--space-1) var(--space-2);
        background-color: var(--color-info);
        color: var(--color-on-info);
        font-size: var(--text-xs);
        white-space: nowrap;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-radius: var(--rounded-md);
        animation: bounceUp 0.2s ease-out;
    }
    .line-segment.animated {
        animation: shrink 0.5s ease-out;
    }
    .line-segment {
        animation: fadeIn 0.5s ease-in-out;
    }
</style>
